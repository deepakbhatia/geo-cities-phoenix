const { getFirestore, admin } = require('../config/firebase');
const { generatePageContent, detectAIContent } = require('./aiController');

// Helper function to update page tag after async detection
async function updatePageTag(cityId, pageId, result) {
  try {
    const db = getFirestore();
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId);
    
    await pageRef.update({
      contentTag: result.contentTag,
      aiConfidenceScore: result.aiConfidenceScore,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    console.log(`Updated page ${pageId} tag to ${result.contentTag} (confidence: ${result.aiConfidenceScore})`);
  } catch (error) {
    console.error('Error updating page tag:', error);
  }
}

// Helper function to generate slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Get all pages for a city
const getPages = async (req, res) => {
  try {
    const db = getFirestore();
    const { cityId } = req.params;
    
    // Verify city exists
    const cityDoc = await db.collection('cities').doc(cityId).get();
    if (!cityDoc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // Get pages
    const snapshot = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const pages = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      pages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString()
      });
    });
    
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to access pages' });
    }
    
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get single page
const getPage = async (req, res) => {
  try {
    const db = getFirestore();
    const { cityId, pageId } = req.params;
    
    const doc = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId)
      .get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const data = doc.data();
    res.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString()
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to access page' });
    }
    
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Create new page
const createPage = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { title, type, contentMode, prompt, content } = req.body;
    
    // Validate input
    if (!title || !type || !contentMode) {
      return res.status(400).json({ 
        error: 'Title, type, and content mode are required' 
      });
    }
    
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ 
        error: 'Title must be between 3 and 100 characters' 
      });
    }
    
    // Validate based on content mode
    if (contentMode === 'ai-generate') {
      if (!prompt || prompt.length < 10 || prompt.length > 500) {
        return res.status(400).json({ 
          error: 'Prompt must be between 10 and 500 characters' 
        });
      }
    } else if (contentMode === 'write-myself') {
      if (!content || content.length < 50 || content.length > 5000) {
        return res.status(400).json({ 
          error: 'Content must be between 50 and 5000 characters' 
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'Invalid content mode. Must be "ai-generate" or "write-myself"' 
      });
    }
    
    const db = getFirestore();
    
    // Verify city exists
    const cityDoc = await db.collection('cities').doc(cityId).get();
    if (!cityDoc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // Check for duplicate title in this city
    const slug = generateSlug(title);
    const duplicateCheck = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .where('titleSlug', '==', slug)
      .limit(1)
      .get();
    
    if (!duplicateCheck.empty) {
      return res.status(409).json({ 
        error: 'A page with this title already exists in this city' 
      });
    }
    
    // Check page limit (100 per city)
    const pageCount = await db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .count()
      .get();
    
    if (pageCount.data().count >= 100) {
      return res.status(400).json({ 
        error: 'This city has reached its page limit (100 pages)' 
      });
    }
    
    let finalContent;
    let contentTag;
    let aiConfidenceScore = null;
    let originalPrompt = null;
    
    if (contentMode === 'ai-generate') {
      // Generate content with AI
      finalContent = await generatePageContent({
        cityId,
        title,
        type,
        prompt
      });
      contentTag = 'ai-generated';
      originalPrompt = prompt;
    } else {
      // Use user-written content
      finalContent = content;
      contentTag = 'pending'; // Will be updated after detection
    }
    
    // Create page in Firestore
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc();
    
    const now = admin.firestore.Timestamp.now();
    
    const pageData = {
      id: pageRef.id,
      cityId,
      title,
      titleSlug: slug,
      type,
      contentMode,
      contentTag,
      aiConfidenceScore,
      originalPrompt,
      content: finalContent,
      createdAt: now,
      updatedAt: now
    };
    
    await pageRef.set(pageData);
    
    // Run AI detection asynchronously for user-written content
    if (contentMode === 'write-myself') {
      detectAIContent(finalContent)
        .then(result => {
          updatePageTag(cityId, pageRef.id, result);
        })
        .catch(err => {
          console.error('AI detection failed:', err);
          // Default to user-written if detection fails
          updatePageTag(cityId, pageRef.id, {
            contentTag: 'user-written',
            aiConfidenceScore: null
          });
        });
    }
    
    res.status(201).json({
      ...pageData,
      createdAt: pageData.createdAt.toDate().toISOString(),
      updatedAt: pageData.updatedAt.toDate().toISOString()
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Update page
const updatePage = async (req, res) => {
  try {
    const db = getFirestore();
    const { cityId, pageId } = req.params;
    const { title, prompt } = req.body;
    
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId);
    
    const doc = await pageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const pageData = doc.data();
    const updates = {
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    // Update title if provided
    if (title) {
      updates.title = title;
      updates.titleSlug = generateSlug(title);
    }
    
    // Regenerate content if new prompt provided
    if (prompt) {
      updates.originalPrompt = prompt;
      updates.content = await generatePageContent({
        cityId,
        title: title || pageData.title,
        type: pageData.type,
        prompt
      });
    }
    
    await pageRef.update(updates);
    
    const updatedDoc = await pageRef.get();
    const updatedData = updatedDoc.data();
    
    res.json({
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData.createdAt.toDate().toISOString(),
      updatedAt: updatedData.updatedAt.toDate().toISOString()
    });
  } catch (error) {
    console.error('Error updating page:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to update page' });
    }
    
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// Delete page
const deletePage = async (req, res) => {
  try {
    const db = getFirestore();
    const { cityId, pageId } = req.params;
    
    const pageRef = db.collection('cities')
      .doc(cityId)
      .collection('pages')
      .doc(pageId);
    
    const doc = await pageRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    await pageRef.delete();
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to delete page' });
    }
    
    res.status(500).json({ error: 'Failed to delete page' });
  }
};


module.exports = {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage
};

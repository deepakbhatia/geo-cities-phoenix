import { generatePageContent } from './aiController.js';

// In-memory storage for pages (will be replaced with Firestore)
let pages = [];

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
export const getPages = (req, res) => {
  try {
    const { cityId } = req.params;
    const cityPages = pages.filter(p => p.cityId === cityId);
    
    // Sort by creation date (newest first)
    cityPages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(cityPages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

// Get single page
export const getPage = (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    const page = pages.find(p => p.id === pageId && p.cityId === cityId);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

// Create new page
export const createPage = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { title, type, prompt } = req.body;
    
    // Validate input
    if (!title || !type || !prompt) {
      return res.status(400).json({ 
        error: 'Title, type, and prompt are required' 
      });
    }
    
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ 
        error: 'Title must be between 3 and 100 characters' 
      });
    }
    
    if (prompt.length < 10 || prompt.length > 500) {
      return res.status(400).json({ 
        error: 'Prompt must be between 10 and 500 characters' 
      });
    }
    
    // Check for duplicate title in this city
    const slug = generateSlug(title);
    const duplicate = pages.find(p => 
      p.cityId === cityId && p.titleSlug === slug
    );
    
    if (duplicate) {
      return res.status(409).json({ 
        error: 'A page with this title already exists in this city' 
      });
    }
    
    // Check page limit (100 per city)
    const cityPages = pages.filter(p => p.cityId === cityId);
    if (cityPages.length >= 100) {
      return res.status(400).json({ 
        error: 'This city has reached its page limit (100 pages)' 
      });
    }
    
    // Generate content with AI
    const content = await generatePageContent({
      cityId,
      title,
      type,
      prompt
    });
    
    // Create page
    const newPage = {
      id: String(pages.length + 1),
      cityId,
      title,
      titleSlug: slug,
      type,
      prompt,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    pages.push(newPage);
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
};

// Update page
export const updatePage = async (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    const { title, prompt } = req.body;
    
    const pageIndex = pages.findIndex(p => 
      p.id === pageId && p.cityId === cityId
    );
    
    if (pageIndex === -1) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const page = pages[pageIndex];
    
    // Update fields
    if (title) {
      page.title = title;
      page.titleSlug = generateSlug(title);
    }
    
    if (prompt) {
      // Regenerate content with new prompt
      page.prompt = prompt;
      page.content = await generatePageContent({
        cityId,
        title: title || page.title,
        type: page.type,
        prompt
      });
    }
    
    page.updatedAt = new Date().toISOString();
    pages[pageIndex] = page;
    
    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

// Delete page
export const deletePage = (req, res) => {
  try {
    const { cityId, pageId } = req.params;
    
    const pageIndex = pages.findIndex(p => 
      p.id === pageId && p.cityId === cityId
    );
    
    if (pageIndex === -1) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    pages.splice(pageIndex, 1);
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

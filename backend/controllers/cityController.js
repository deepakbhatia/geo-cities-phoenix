import { getFirestore, admin } from '../config/firebase.js';
import { generateSlug } from '../utils/slug.js';
import { validateCityInput } from '../utils/validation.js';

/**
 * Check if a city with the given name already exists (case-insensitive)
 */
async function checkDuplicateCity(name) {
  const db = getFirestore();
  const slug = generateSlug(name);
  
  const snapshot = await db.collection('cities')
    .where('nameSlug', '==', slug)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}

/**
 * Get count of cities with the given theme
 */
async function getThemeCount(theme) {
  const db = getFirestore();
  
  const snapshot = await db.collection('cities')
    .where('theme', '==', theme.toLowerCase())
    .count()
    .get();
  
  return snapshot.data().count;
}

/**
 * Generate alternative city name suggestions
 */
function generateNameSuggestions(name) {
  return [
    `${name} 2`,
    `New ${name}`,
    `${name} District`
  ];
}

/**
 * Get all cities
 */
export const getCities = async (req, res) => {
  try {
    const db = getFirestore();
    
    const snapshot = await db.collection('cities')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const cities = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Get content count from subcollection
      const contentSnapshot = await doc.ref.collection('content').count().get();
      const contentCount = contentSnapshot.data().count;
      
      cities.push({
        id: doc.id,
        name: data.name,
        theme: data.theme,
        vibe: data.vibe,
        pages: new Array(contentCount).fill(null) // Placeholder for compatibility
      });
    }
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to access database' });
    }
    
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

/**
 * Get a single city by ID
 */
export const getCity = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;
    
    const doc = await db.collection('cities').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const data = doc.data();
    
    // Get content count
    const contentSnapshot = await doc.ref.collection('content').count().get();
    const contentCount = contentSnapshot.data().count;
    
    res.json({
      id: doc.id,
      name: data.name,
      theme: data.theme,
      vibe: data.vibe,
      pages: new Array(contentCount).fill(null) // Placeholder for compatibility
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to access database' });
    }
    
    res.status(500).json({ error: 'Failed to fetch city' });
  }
};

/**
 * Create a new city
 */
export const createCity = async (req, res) => {
  try {
    const { name, theme, vibe } = req.body;
    
    // Validate input
    const validationErrors = validateCityInput(name, theme, vibe);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    // Check for duplicate city name
    const isDuplicate = await checkDuplicateCity(name);
    if (isDuplicate) {
      return res.status(409).json({ 
        error: `A city named "${name}" already exists. Please choose a different name.`,
        code: 'DUPLICATE_CITY',
        suggestions: generateNameSuggestions(name)
      });
    }
    
    // Check theme popularity
    const themeCount = await getThemeCount(theme);
    let warning = null;
    
    if (themeCount >= 3) {
      warning = `There are already ${themeCount} cities with the "${theme}" theme. Consider making yours unique!`;
    }
    
    // Create city document
    const db = getFirestore();
    const cityRef = db.collection('cities').doc();
    const now = admin.firestore.Timestamp.now();
    const slug = generateSlug(name);
    
    const cityData = {
      id: cityRef.id,
      name,
      nameSlug: slug,
      theme: theme.toLowerCase(),
      vibe,
      createdAt: now,
      updatedAt: now
    };
    
    await cityRef.set(cityData);
    
    // Return response with warning if applicable
    const response = {
      id: cityRef.id,
      name,
      theme: theme.toLowerCase(),
      vibe,
      pages: []
    };
    
    if (warning) {
      response.warning = warning;
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating city:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to create city' });
    }
    
    res.status(500).json({ error: 'Failed to create city' });
  }
};

/**
 * Update an existing city
 */
export const updateCity = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;
    const { name, theme, vibe } = req.body;
    
    // Validate input
    const validationErrors = validateCityInput(name, theme, vibe);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    // Check if city exists
    const cityRef = db.collection('cities').doc(id);
    const doc = await cityRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // If name changed, check for duplicates
    const currentData = doc.data();
    if (name !== currentData.name) {
      const isDuplicate = await checkDuplicateCity(name);
      if (isDuplicate) {
        return res.status(409).json({ 
          error: `A city named "${name}" already exists. Please choose a different name.`,
          code: 'DUPLICATE_CITY',
          suggestions: generateNameSuggestions(name)
        });
      }
    }
    
    // Update city document
    const now = admin.firestore.Timestamp.now();
    const slug = generateSlug(name);
    
    const updateData = {
      name,
      nameSlug: slug,
      theme: theme.toLowerCase(),
      vibe,
      updatedAt: now
    };
    
    await cityRef.update(updateData);
    
    res.json({
      id,
      name,
      theme: theme.toLowerCase(),
      vibe,
      pages: []
    });
  } catch (error) {
    console.error('Error updating city:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to update city' });
    }
    
    res.status(500).json({ error: 'Failed to update city' });
  }
};

/**
 * Delete a city and all its subcollections
 */
export const deleteCity = async (req, res) => {
  try {
    const db = getFirestore();
    const { id } = req.params;
    
    const cityRef = db.collection('cities').doc(id);
    const doc = await cityRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // Delete subcollections
    const batch = db.batch();
    
    // Delete content subcollection
    const contentSnapshot = await cityRef.collection('content').get();
    contentSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete aiGenerations subcollection
    const aiGenSnapshot = await cityRef.collection('aiGenerations').get();
    aiGenSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the city document
    batch.delete(cityRef);
    
    await batch.commit();
    
    res.json({ 
      message: 'City deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    
    if (error.code === 'permission-denied') {
      return res.status(403).json({ error: 'Permission denied to delete city' });
    }
    
    res.status(500).json({ error: 'Failed to delete city' });
  }
};

/**
 * Helper function to get city by ID (for internal use)
 * @deprecated Use getCity endpoint instead
 */
export const getCityById = async (id) => {
  const db = getFirestore();
  const doc = await db.collection('cities').doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    theme: data.theme,
    vibe: data.vibe,
    pages: []
  };
};

const { getFirestore, admin } = require('../config/firebase');

/**
 * Save AI-generated content to Firestore cache
 * @param {string} cityId - The city ID
 * @param {string} type - Type of generation (publicSquare, radio, newsletter)
 * @param {string} content - The generated content
 */
async function saveAIGeneration(cityId, type, content) {
  const db = getFirestore();
  const cityRef = db.collection('cities').doc(cityId);
  const generationRef = cityRef.collection('aiGenerations').doc();
  
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + (24 * 60 * 60 * 1000)  // 24 hours from now
  );
  
  await generationRef.set({
    id: generationRef.id,
    type,
    content,
    generatedAt: now,
    expiresAt
  });
  
  console.log(`💾 Cached ${type} generation for city ${cityId}`);
}

/**
 * Get cached AI-generated content if it exists and hasn't expired
 * @param {string} cityId - The city ID
 * @param {string} type - Type of generation (publicSquare, radio, newsletter)
 * @returns {string|null} - The cached content or null if not found/expired
 */
async function getCachedAIGeneration(cityId, type) {
  const db = getFirestore();
  const cityRef = db.collection('cities').doc(cityId);
  const now = admin.firestore.Timestamp.now();
  
  const snapshot = await cityRef.collection('aiGenerations')
    .where('type', '==', type)
    .where('expiresAt', '>', now)
    .orderBy('expiresAt', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    console.log(`📭 No cached ${type} generation found for city ${cityId}`);
    return null;
  }
  
  const cachedContent = snapshot.docs[0].data().content;
  console.log(`📬 Retrieved cached ${type} generation for city ${cityId}`);
  return cachedContent;
}


module.exports = {
  saveAIGeneration,
  getCachedAIGeneration
};

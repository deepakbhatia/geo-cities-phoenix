const admin = require('firebase-admin');

/**
 * Initialize Firebase Admin SDK for Cloud Functions
 * No credentials needed - automatically authenticated in Cloud Functions environment
 */

let db = null;

function initializeFirebase() {
  try {
    // Initialize Firebase Admin (no credentials needed in Cloud Functions)
    if (!admin.apps.length) {
      admin.initializeApp();
    }

    db = admin.firestore();
    
    console.log('✅ Firebase initialized successfully for Cloud Functions');
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    throw error;
  }
}

function getFirestore() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};

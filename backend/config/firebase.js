import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Requires environment variables:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_SERVICE_ACCOUNT: JSON string of service account credentials
 */

let db = null;

export function initializeFirebase() {
  try {
    // Check if required environment variables are set
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
    }

    // Parse service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    db = admin.firestore();
    
    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Connected to Firestore project: ${process.env.FIREBASE_PROJECT_ID}`);
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    throw error;
  }
}

export function getFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
}

export { admin };

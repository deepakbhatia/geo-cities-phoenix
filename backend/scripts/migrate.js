import dotenv from 'dotenv';
import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';
import { generateSlug } from '../utils/slug.js';

dotenv.config();

// Initial cities data from in-memory storage
const cities = [
  { name: 'Silicon Valley', theme: 'tech', vibe: 'futuristic' },
  { name: 'Sunset Boulevard', theme: 'art', vibe: 'creative' },
  { name: 'Neon District', theme: 'cyberpunk', vibe: 'edgy' }
];

async function migrate() {
  try {
    console.log('🚀 Starting migration to Firestore...\n');
    
    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();
    
    // Check for existing cities to make migration idempotent
    const existingSnapshot = await db.collection('cities').get();
    if (!existingSnapshot.empty) {
      console.log(`⚠️  Found ${existingSnapshot.size} existing cities in Firestore`);
      console.log('Migration is idempotent - checking for duplicates...\n');
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const city of cities) {
      const slug = generateSlug(city.name);
      
      // Check if city already exists
      const existingCity = await db.collection('cities')
        .where('nameSlug', '==', slug)
        .limit(1)
        .get();
      
      if (!existingCity.empty) {
        console.log(`⏭️  Skipping "${city.name}" - already exists`);
        skippedCount++;
        continue;
      }
      
      // Create city document
      const cityRef = db.collection('cities').doc();
      const now = admin.firestore.Timestamp.now();
      
      const cityData = {
        id: cityRef.id,
        name: city.name,
        nameSlug: slug,
        theme: city.theme.toLowerCase(),
        vibe: city.vibe,
        createdAt: now,
        updatedAt: now
      };
      
      await cityRef.set(cityData);
      console.log(`✅ Migrated "${city.name}" (ID: ${cityRef.id})`);
      migratedCount++;
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount} cities`);
    console.log(`   ⏭️  Skipped: ${skippedCount} cities (already exist)`);
    console.log(`   📝 Total: ${cities.length} cities processed`);
    console.log('\n🎉 Migration complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();

import dotenv from 'dotenv';
import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';
import { generateSlug } from '../utils/slug.js';

dotenv.config();

// Initial cities data for migration
const cities = [
  // Tech & Innovation
  { name: 'Silicon Valley', theme: 'tech', vibe: 'futuristic' },
  { name: 'Binary Bay', theme: 'tech', vibe: 'innovative' },
  { name: 'Quantum Quarter', theme: 'tech', vibe: 'cutting-edge' },
  { name: 'Algorithm Alley', theme: 'tech', vibe: 'analytical' },
  { name: 'Cloud City', theme: 'tech', vibe: 'ethereal' },
  
  // Art & Creativity
  { name: 'Sunset Boulevard', theme: 'art', vibe: 'creative' },
  { name: 'Canvas Corner', theme: 'art', vibe: 'expressive' },
  { name: 'Palette Plaza', theme: 'art', vibe: 'colorful' },
  { name: 'Mural Mile', theme: 'art', vibe: 'vibrant' },
  { name: 'Gallery Gardens', theme: 'art', vibe: 'sophisticated' },
  
  // Cyberpunk & Futuristic
  { name: 'Neon District', theme: 'cyberpunk', vibe: 'edgy' },
  { name: 'Chrome Heights', theme: 'cyberpunk', vibe: 'dystopian' },
  { name: 'Hologram Harbor', theme: 'cyberpunk', vibe: 'electric' },
  { name: 'Synth City', theme: 'cyberpunk', vibe: 'neon-lit' },
  { name: 'Circuit Street', theme: 'cyberpunk', vibe: 'gritty' },
  
  // Nature & Environment
  { name: 'Emerald Grove', theme: 'nature', vibe: 'peaceful' },
  { name: 'Willow Woods', theme: 'nature', vibe: 'serene' },
  { name: 'Blossom Bay', theme: 'nature', vibe: 'tranquil' },
  { name: 'Meadow Mews', theme: 'nature', vibe: 'refreshing' },
  { name: 'Forest Falls', theme: 'nature', vibe: 'mystical' },
  
  // Music & Entertainment
  { name: 'Melody Manor', theme: 'music', vibe: 'rhythmic' },
  { name: 'Jazz Junction', theme: 'music', vibe: 'smooth' },
  { name: 'Rock Ridge', theme: 'music', vibe: 'energetic' },
  { name: 'Symphony Square', theme: 'music', vibe: 'harmonious' },
  { name: 'Beat Boulevard', theme: 'music', vibe: 'groovy' },
  
  // Gaming & Virtual
  { name: 'Pixel Park', theme: 'gaming', vibe: 'playful' },
  { name: 'Quest Quarter', theme: 'gaming', vibe: 'adventurous' },
  { name: 'Arcade Avenue', theme: 'gaming', vibe: 'nostalgic' },
  { name: 'Level Up Lane', theme: 'gaming', vibe: 'competitive' },
  { name: 'Console Commons', theme: 'gaming', vibe: 'retro' },
  
  // Food & Culinary
  { name: 'Flavor Town', theme: 'food', vibe: 'delicious' },
  { name: 'Spice Street', theme: 'food', vibe: 'aromatic' },
  { name: 'Bistro Bay', theme: 'food', vibe: 'gourmet' },
  { name: 'Market Mile', theme: 'food', vibe: 'bustling' },
  { name: 'Cafe Corner', theme: 'food', vibe: 'cozy' },
  
  // Fantasy & Magic
  { name: 'Mystic Meadows', theme: 'fantasy', vibe: 'enchanted' },
  { name: 'Dragon District', theme: 'fantasy', vibe: 'epic' },
  { name: 'Wizard Way', theme: 'fantasy', vibe: 'magical' },
  { name: 'Fairy Falls', theme: 'fantasy', vibe: 'whimsical' },
  { name: 'Castle Cove', theme: 'fantasy', vibe: 'majestic' },
  
  // Space & Cosmic
  { name: 'Starlight Station', theme: 'space', vibe: 'cosmic' },
  { name: 'Nebula Neighborhood', theme: 'space', vibe: 'otherworldly' },
  { name: 'Galaxy Gardens', theme: 'space', vibe: 'infinite' },
  { name: 'Asteroid Alley', theme: 'space', vibe: 'adventurous' },
  { name: 'Lunar Landing', theme: 'space', vibe: 'mysterious' },
  
  // Retro & Vintage
  { name: 'Vintage Village', theme: 'retro', vibe: 'nostalgic' },
  { name: 'Diner Drive', theme: 'retro', vibe: 'classic' },
  { name: 'Jukebox Junction', theme: 'retro', vibe: 'groovy' },
  { name: 'Vinyl Valley', theme: 'retro', vibe: 'timeless' },
  { name: 'Nifty Fifties', theme: 'retro', vibe: 'charming' },
  
  // Horror & Dark
  { name: 'Shadow Street', theme: 'horror', vibe: 'eerie' },
  { name: 'Phantom Plaza', theme: 'horror', vibe: 'haunting' },
  { name: 'Midnight Manor', theme: 'horror', vibe: 'spooky' },
  { name: 'Raven Ridge', theme: 'horror', vibe: 'dark' },
  { name: 'Cryptic Corner', theme: 'horror', vibe: 'mysterious' },
  
  // Sports & Fitness
  { name: 'Victory Village', theme: 'sports', vibe: 'competitive' },
  { name: 'Champion Circle', theme: 'sports', vibe: 'energetic' },
  { name: 'Stadium Square', theme: 'sports', vibe: 'exciting' },
  { name: 'Fitness Falls', theme: 'sports', vibe: 'motivating' },
  { name: 'Arena Avenue', theme: 'sports', vibe: 'dynamic' },
  
  // Science & Discovery
  { name: 'Laboratory Lane', theme: 'science', vibe: 'curious' },
  { name: 'Discovery District', theme: 'science', vibe: 'innovative' },
  { name: 'Experiment Estate', theme: 'science', vibe: 'analytical' },
  { name: 'Research Row', theme: 'science', vibe: 'methodical' },
  { name: 'Atom Alley', theme: 'science', vibe: 'precise' },
  
  // Ocean & Maritime
  { name: 'Coral Cove', theme: 'ocean', vibe: 'tropical' },
  { name: 'Sailor Street', theme: 'ocean', vibe: 'nautical' },
  { name: 'Tide Town', theme: 'ocean', vibe: 'breezy' },
  { name: 'Lighthouse Landing', theme: 'ocean', vibe: 'coastal' },
  { name: 'Marina Mile', theme: 'ocean', vibe: 'refreshing' },
  
  // Urban & Metropolitan
  { name: 'Metro Mews', theme: 'urban', vibe: 'bustling' },
  { name: 'Downtown District', theme: 'urban', vibe: 'lively' },
  { name: 'Skyline Square', theme: 'urban', vibe: 'modern' },
  { name: 'City Center', theme: 'urban', vibe: 'vibrant' },
  { name: 'Concrete Commons', theme: 'urban', vibe: 'industrial' },
  
  // Steampunk & Victorian
  { name: 'Clockwork Corner', theme: 'steampunk', vibe: 'mechanical' },
  { name: 'Brass Boulevard', theme: 'steampunk', vibe: 'industrial' },
  { name: 'Gear Gardens', theme: 'steampunk', vibe: 'inventive' },
  { name: 'Steam Street', theme: 'steampunk', vibe: 'vintage' },
  { name: 'Cog City', theme: 'steampunk', vibe: 'intricate' },
  
  // Minimalist & Zen
  { name: 'Zen Zone', theme: 'minimalist', vibe: 'calm' },
  { name: 'Simple Street', theme: 'minimalist', vibe: 'clean' },
  { name: 'Quiet Quarter', theme: 'minimalist', vibe: 'peaceful' },
  { name: 'Bare Bay', theme: 'minimalist', vibe: 'serene' },
  { name: 'Pure Plaza', theme: 'minimalist', vibe: 'tranquil' },
  
  // Wild West & Frontier
  { name: 'Dusty Dale', theme: 'western', vibe: 'rugged' },
  { name: 'Frontier Falls', theme: 'western', vibe: 'adventurous' },
  { name: 'Saloon Street', theme: 'western', vibe: 'rustic' },
  { name: 'Canyon City', theme: 'western', vibe: 'wild' },
  { name: 'Prairie Point', theme: 'western', vibe: 'untamed' }
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

// Migration script to add new fields to existing pages

// For in-memory storage
export function migrateInMemoryPages(pages) {
  console.log('Starting in-memory page migration...');
  
  let migratedCount = 0;
  
  const migratedPages = pages.map(page => {
    // Skip if already migrated
    if (page.contentMode) {
      console.log(`Skipping page ${page.id} - already migrated`);
      return page;
    }
    
    // Add new fields
    const migrated = {
      ...page,
      contentMode: 'ai-generate',
      contentTag: 'ai-generated',
      originalPrompt: page.prompt || 'Legacy page - no prompt saved',
      aiConfidenceScore: null
    };
    
    migratedCount++;
    console.log(`Migrated page: ${page.title}`);
    
    return migrated;
  });
  
  console.log(`Migration complete: ${migratedCount}/${pages.length} pages migrated`);
  
  return migratedPages;
}

// For Firestore (when implemented)
export async function migrateFirestorePages(db) {
  console.log('Starting Firestore page migration...');
  
  try {
    // Get all cities
    const citiesSnapshot = await db.collection('cities').get();
    
    let totalPages = 0;
    let migratedPages = 0;
    
    for (const cityDoc of citiesSnapshot.docs) {
      const pagesSnapshot = await cityDoc.ref
        .collection('pages')
        .get();
      
      totalPages += pagesSnapshot.size;
      
      for (const pageDoc of pagesSnapshot.docs) {
        const pageData = pageDoc.data();
        
        // Skip if already migrated
        if (pageData.contentMode) {
          console.log(`Skipping ${pageDoc.id} - already migrated`);
          continue;
        }
        
        // Update with new fields
        await pageDoc.ref.update({
          contentMode: 'ai-generate',
          contentTag: 'ai-generated',
          originalPrompt: pageData.prompt || 'Legacy page - no prompt saved',
          aiConfidenceScore: null
        });
        
        migratedPages++;
        console.log(`Migrated page: ${pageData.title}`);
      }
    }
    
    console.log(`Migration complete: ${migratedPages}/${totalPages} pages migrated`);
    
    return {
      total: totalPages,
      migrated: migratedPages
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// CLI usage for in-memory migration
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script is for programmatic use.');
  console.log('Import and call migrateInMemoryPages() or migrateFirestorePages() from your code.');
}

import { db } from '../src/lib/db';
import { categories } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Vietnamese slug generator
function vietnameseSlug(str: string): string {
  const vietnamese = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  const latin = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
  
  return str
    .toLowerCase()
    .split('')
    .map(char => {
      const index = vietnamese.indexOf(char);
      return index !== -1 ? latin[index] : char;
    })
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateSlugs() {
  try {
    // Get all categories
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    
    console.log(`Found ${allCategories.length} categories`);
    
    // Generate slugs with deduplication
    const slugMap = new Map<string, string>();
    const updates: Array<{ id: string; slug: string; name: string }> = [];
    
    for (const cat of allCategories) {
      let baseSlug = vietnameseSlug(cat.name);
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Check for duplicates and append counter
      while (slugMap.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }
      
      slugMap.set(finalSlug, cat.id);
      updates.push({ id: cat.id, slug: finalSlug, name: cat.name });
    }
    
    // Update database
    console.log('\nUpdating categories with slugs:');
    for (const { id, slug, name } of updates) {
      await db.update(categories).set({ slug }).where(eq(categories.id, id));
      console.log(`✓ ${name} → ${slug}`);
    }
    
    console.log(`\n✅ Successfully updated ${updates.length} categories`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateSlugs();

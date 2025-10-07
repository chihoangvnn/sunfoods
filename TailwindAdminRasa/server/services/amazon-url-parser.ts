import { db } from '../db';
import { 
  bookCategories, 
  amazonUrlProcessingLog,
  insertBookCategorySchema,
  insertAmazonUrlProcessingLogSchema,
  type BookCategory,
  type InsertBookCategory,
  type InsertAmazonUrlProcessingLog
} from '../../shared/schema';
import { eq, like } from 'drizzle-orm';

// Interface for parsed Amazon URL data
export interface ParsedAmazonUrl {
  originalUrl: string;
  categoryName: string;
  amazonCategoryId: string;
  slug: string;
  level: number;
  parentCategory?: string;
}

// Interface for category hierarchy building
export interface CategoryHierarchy {
  name: string;
  slug: string;
  level: number;
  children: CategoryHierarchy[];
  amazonData?: {
    categoryId: string;
    bestsellerUrl: string;
  };
}

/**
 * Parse Amazon bestseller URL to extract category information
 * Supports multiple Amazon URL formats:
 * - https://www.amazon.com/Best-Sellers-Books/zgbs/books
 * - https://www.amazon.com/Best-Sellers-Books-Fiction/zgbs/books/17
 * - https://www.amazon.com/Best-Sellers-Books-Science-Fiction-Fantasy/zgbs/books/25
 * - https://amazon.co.uk/Best-Sellers-Books-Literature-Fiction/zgbs/books/62
 * - https://www.amazon.com/zgbs/books/25/ref=zg_bs_nav_books_2_17
 * - With query parameters, trailing slashes, internationalization
 */
export function parseAmazonUrl(url: string): ParsedAmazonUrl | null {
  try {
    const urlObj = new URL(url.trim());
    
    // Support multiple Amazon domains
    if (!urlObj.hostname.match(/amazon\.(com|co\.uk|ca|de|fr|it|es|com\.au|in|com\.br|co\.jp)/)) {
      return null;
    }

    const pathname = urlObj.pathname;
    
    // Pattern 1: /Best-Sellers-Books-{categories}/zgbs/books/{id?}
    let pathMatch = pathname.match(/\/Best-Sellers-Books(?:-([^\/]+))?\/zgbs\/books(?:\/(\d+))?/);
    
    if (pathMatch) {
      const [, rawCategory, categoryId] = pathMatch;
      
      if (!rawCategory) {
        // Root books category
        return {
          originalUrl: url,
          categoryName: 'Books',
          amazonCategoryId: categoryId || 'books',
          slug: 'books',
          level: 0,
          parentCategory: undefined
        };
      }
      
      // Parse nested category path with proper hierarchy
      const hierarchy = parseUrlPathHierarchy(rawCategory);
      const mainCategory = hierarchy[hierarchy.length - 1]; // Take the most specific category
      
      return {
        originalUrl: url,
        categoryName: mainCategory.name,
        amazonCategoryId: categoryId || rawCategory,
        slug: mainCategory.slug,
        level: hierarchy.length - 1,
        parentCategory: hierarchy.length > 1 ? hierarchy[hierarchy.length - 2].name : 'Books'
      };
    }
    
    // Pattern 2: /zgbs/books/{id?}
    pathMatch = pathname.match(/\/zgbs\/books(?:\/(\d+))?(?:\/ref=.*)?/);
    
    if (pathMatch) {
      const [, categoryId] = pathMatch;
      
      if (!categoryId) {
        return {
          originalUrl: url,
          categoryName: 'Books',
          amazonCategoryId: 'books',
          slug: 'books',
          level: 0,
          parentCategory: undefined
        };
      }
      
      return {
        originalUrl: url,
        categoryName: `Category ${categoryId}`,
        amazonCategoryId: categoryId,
        slug: `category-${categoryId}`,
        level: 1,
        parentCategory: 'Books'
      };
    }
    
    // Pattern 3: Extract from query parameters
    const nodeParam = urlObj.searchParams.get('node');
    if (nodeParam && pathname.includes('books')) {
      return {
        originalUrl: url,
        categoryName: `Category ${nodeParam}`,
        amazonCategoryId: nodeParam,
        slug: `category-${nodeParam}`,
        level: 1,
        parentCategory: 'Books'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Amazon URL:', error);
    return null;
  }
}

/**
 * Parse URL path hierarchy using Amazon's category structure
 */
function parseUrlPathHierarchy(categoryPath: string): Array<{ name: string; slug: string }> {
  const hierarchy: Array<{ name: string; slug: string }> = [];
  
  // Always start with Books as root
  hierarchy.push({ name: 'Books', slug: 'books' });
  
  const parts = categoryPath.split('-').filter(p => p.length > 0);
  
  // Common Amazon category mappings with proper hierarchy
  const categoryMappings: Record<string, { hierarchy: string[]; finalName?: string }> = {
    'Literature': { hierarchy: ['Literature & Fiction'] },
    'Science': { hierarchy: ['Science Fiction & Fantasy'], finalName: 'Science Fiction' },
    'Fantasy': { hierarchy: ['Science Fiction & Fantasy'], finalName: 'Fantasy' },
    'Mystery': { hierarchy: ['Mystery, Thriller & Suspense'], finalName: 'Mystery' },
    'Thriller': { hierarchy: ['Mystery, Thriller & Suspense'], finalName: 'Thriller' },
    'Romance': { hierarchy: ['Romance'] },
    'History': { hierarchy: ['History'] },
    'Biography': { hierarchy: ['Biographies & Memoirs'], finalName: 'Biography' },
    'Memoirs': { hierarchy: ['Biographies & Memoirs'], finalName: 'Memoirs' },
    'Business': { hierarchy: ['Business & Money'], finalName: 'Business' },
    'Money': { hierarchy: ['Business & Money'], finalName: 'Money' },
    'Self': { hierarchy: ['Self-Help'] },
    'Help': { hierarchy: ['Self-Help'] },
    'Health': { hierarchy: ['Health, Fitness & Dieting'], finalName: 'Health' },
    'Fitness': { hierarchy: ['Health, Fitness & Dieting'], finalName: 'Fitness' },
    'Cooking': { hierarchy: ['Cookbooks, Food & Wine'], finalName: 'Cooking' },
    'Food': { hierarchy: ['Cookbooks, Food & Wine'], finalName: 'Food' },
    'Wine': { hierarchy: ['Cookbooks, Food & Wine'], finalName: 'Wine' },
    'Travel': { hierarchy: ['Travel'] },
    'Religion': { hierarchy: ['Religion & Spirituality'], finalName: 'Religion' },
    'Spirituality': { hierarchy: ['Religion & Spirituality'], finalName: 'Spirituality' },
    'Politics': { hierarchy: ['Politics & Social Sciences'], finalName: 'Politics' },
    'Social': { hierarchy: ['Politics & Social Sciences'], finalName: 'Social Sciences' },
    'Arts': { hierarchy: ['Arts & Photography'], finalName: 'Arts' },
    'Photography': { hierarchy: ['Arts & Photography'], finalName: 'Photography' },
    'Computers': { hierarchy: ['Computers & Technology'], finalName: 'Computers' },
    'Technology': { hierarchy: ['Computers & Technology'], finalName: 'Technology' },
    'Education': { hierarchy: ['Education & Teaching'], finalName: 'Education' },
    'Teaching': { hierarchy: ['Education & Teaching'], finalName: 'Teaching' },
    'Parenting': { hierarchy: ['Parenting & Relationships'], finalName: 'Parenting' },
    'Relationships': { hierarchy: ['Parenting & Relationships'], finalName: 'Relationships' },
    'Sports': { hierarchy: ['Sports & Outdoors'], finalName: 'Sports' },
    'Outdoors': { hierarchy: ['Sports & Outdoors'], finalName: 'Outdoors' }
  };
  
  // Identify category pattern
  const firstPart = parts[0];
  const mapping = categoryMappings[firstPart];
  
  if (mapping) {
    // Add the main category
    const mainCategoryName = mapping.hierarchy[0];
    hierarchy.push({ 
      name: mainCategoryName, 
      slug: mainCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    
    // If there are more parts, create subcategories
    if (parts.length > 1) {
      const subcategoryName = mapping.finalName || 
        parts.slice(1)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      
      hierarchy.push({
        name: subcategoryName,
        slug: subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
    }
  } else {
    // Fallback: create categories from path parts
    let currentPath = '';
    for (let i = 0; i < Math.min(parts.length, 3); i++) { // Limit depth to prevent too deep hierarchies
      currentPath += (i > 0 ? ' ' : '') + parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
      
      if (i === 0 || i === parts.length - 1 || parts.length <= 2) {
        hierarchy.push({
          name: currentPath,
          slug: currentPath.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });
      }
    }
  }
  
  return hierarchy;
}

/**
 * Build category hierarchy from parsed URLs
 */
export function buildCategoryHierarchy(parsedUrls: ParsedAmazonUrl[]): CategoryHierarchy[] {
  const categoryMap = new Map<string, CategoryHierarchy>();
  const rootCategories: CategoryHierarchy[] = [];

  // First pass: Create all categories
  for (const parsed of parsedUrls) {
    if (!categoryMap.has(parsed.categoryName)) {
      const category: CategoryHierarchy = {
        name: parsed.categoryName,
        slug: parsed.slug,
        level: parsed.level,
        children: [],
        amazonData: {
          categoryId: parsed.amazonCategoryId,
          bestsellerUrl: parsed.originalUrl
        }
      };
      categoryMap.set(parsed.categoryName, category);
    }
  }

  // Second pass: Build hierarchy
  for (const parsed of parsedUrls) {
    const category = categoryMap.get(parsed.categoryName)!;
    
    if (parsed.parentCategory && categoryMap.has(parsed.parentCategory)) {
      // Add as child to parent
      const parent = categoryMap.get(parsed.parentCategory)!;
      parent.children.push(category);
    } else {
      // Root level category
      category.level = 0;
      rootCategories.push(category);
    }
  }

  return rootCategories;
}

/**
 * Create category in database
 */
async function createCategory(categoryData: CategoryHierarchy, parentId?: string): Promise<string> {
  // Check if category already exists
  const existingCategory = await db
    .select()
    .from(bookCategories)
    .where(eq(bookCategories.slug, categoryData.slug))
    .limit(1);

  if (existingCategory.length > 0) {
    return existingCategory[0].id;
  }

  // Create new category
  const newCategory: InsertBookCategory = {
    name: categoryData.name,
    slug: categoryData.slug,
    parentId,
    level: categoryData.level,
    amazonCategoryId: categoryData.amazonData?.categoryId,
    amazonBestsellerUrl: categoryData.amazonData?.bestsellerUrl,
    description: `${categoryData.name} books from Amazon bestsellers`,
    icon: getIconForCategory(categoryData.name),
    color: getColorForCategory(categoryData.name),
    isActive: true,
    isFeatured: categoryData.level === 0, // Root categories are featured
  };

  const result = await db
    .insert(bookCategories)
    .values(newCategory)
    .returning();

  return result && result.length > 0 ? result[0]?.id || '' : '';
}

/**
 * Get appropriate icon for category
 */
function getIconForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('erotica') || name.includes('romance')) return '💖';
  if (name.includes('science') || name.includes('fiction')) return '🚀';
  if (name.includes('fantasy')) return '🔮';
  if (name.includes('mystery') || name.includes('thriller')) return '🔍';
  if (name.includes('horror')) return '👻';
  if (name.includes('western')) return '🤠';
  if (name.includes('urban')) return '🏙️';
  if (name.includes('paranormal')) return '👻';
  if (name.includes('victorian')) return '👑';
  if (name.includes('suspense')) return '🔍';
  if (name.includes('poetic')) return '✍️';
  
  return '📚'; // Default book icon
}

/**
 * Get appropriate color for category
 */
function getColorForCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('erotica') || name.includes('romance')) return '#ec4899'; // Pink
  if (name.includes('science')) return '#3b82f6'; // Blue
  if (name.includes('fantasy')) return '#8b5cf6'; // Purple
  if (name.includes('mystery')) return '#374151'; // Gray
  if (name.includes('horror')) return '#ef4444'; // Red
  if (name.includes('western')) return '#d97706'; // Orange
  if (name.includes('urban')) return '#10b981'; // Green
  
  return '#3b82f6'; // Default blue
}

/**
 * Log URL processing status
 */
async function logUrlProcessing(
  url: string, 
  status: 'pending' | 'processed' | 'error' | 'skipped',
  result?: any,
  error?: string,
  createdCategoryId?: string
): Promise<void> {
  const parsedUrl = parseAmazonUrl(url);
  
  const logEntry: InsertAmazonUrlProcessingLog = {
    originalUrl: url,
    categoryName: parsedUrl?.categoryName,
    amazonCategoryId: parsedUrl?.amazonCategoryId,
    status,
    processingResult: result || {},
    errorMessage: error,
    createdCategoryId,
    processedAt: new Date(),
  };

  await db.insert(amazonUrlProcessingLog).values(logEntry);
}

/**
 * Process single Amazon URL and create category
 */
export async function processSingleUrl(url: string): Promise<{ success: boolean; categoryId?: string; error?: string }> {
  try {
    // Parse URL
    const parsed = parseAmazonUrl(url);
    if (!parsed) {
      await logUrlProcessing(url, 'error', null, 'Invalid URL format');
      return { success: false, error: 'Invalid URL format' };
    }

    // Check if already processed
    const existingLog = await db
      .select()
      .from(amazonUrlProcessingLog)
      .where(eq(amazonUrlProcessingLog.originalUrl, url))
      .limit(1);

    if (existingLog.length > 0 && existingLog[0].status === 'processed') {
      return { success: true, categoryId: existingLog[0].createdCategoryId || undefined };
    }

    // Create category hierarchy
    const hierarchy = buildCategoryHierarchy([parsed]);
    
    let createdCategoryId: string | undefined;
    
    // Process each category in hierarchy
    for (const rootCategory of hierarchy) {
      createdCategoryId = await createCategory(rootCategory);
      
      // Process children
      for (const child of rootCategory.children) {
        await createCategory(child, createdCategoryId);
      }
    }

    // Log success
    await logUrlProcessing(url, 'processed', { 
      categoryName: parsed.categoryName,
      hierarchy: hierarchy.length 
    }, undefined, createdCategoryId);

    return { success: true, categoryId: createdCategoryId };

  } catch (error: any) {
    console.error('Error processing URL:', url, error);
    await logUrlProcessing(url, 'error', null, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Process multiple Amazon URLs in batch
 */
export async function processBatchUrls(urls: string[], batchSize: number = 10): Promise<{
  processed: number;
  errors: number;
  created: number;
  skipped: number;
}> {
  const results = {
    processed: 0,
    errors: 0,
    created: 0,
    skipped: 0
  };

  console.log(`🔄 Starting batch processing of ${urls.length} URLs...`);

  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);

    // Process batch concurrently
    const batchPromises = batch.map(url => processSingleUrl(url));
    const batchResults = await Promise.all(batchPromises);

    // Update results
    for (const result of batchResults) {
      results.processed++;
      if (result.success) {
        if (result.categoryId) {
          results.created++;
        } else {
          results.skipped++;
        }
      } else {
        results.errors++;
      }
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`✅ Batch processing complete:`, results);
  return results;
}

/**
 * Get processing statistics
 */
export async function getProcessingStats(): Promise<{
  totalProcessed: number;
  successful: number;
  errors: number;
  pending: number;
  categoriesCreated: number;
}> {
  const logs = await db.select().from(amazonUrlProcessingLog);
  
  const stats = {
    totalProcessed: logs.length,
    successful: logs.filter(log => log.status === 'processed').length,
    errors: logs.filter(log => log.status === 'error').length,
    pending: logs.filter(log => log.status === 'pending').length,
    categoriesCreated: logs.filter(log => log.createdCategoryId).length
  };

  return stats;
}

/**
 * Sample URLs for testing (based on user's provided examples)
 */
export const SAMPLE_AMAZON_URLS = [
  "https://www.amazon.com/Best-Sellers-Books-Paranormal-Erotica/zgbs/books/10159307011/",
  "https://www.amazon.com/Best-Sellers-Books-Poetic-Erotica/zgbs/books/10159308011/",
  "https://www.amazon.com/Best-Sellers-Books-Romantic-Erotica/zgbs/books/10159309011/",
  "https://www.amazon.com/Best-Sellers-Books-Science-Fiction-Erotica/zgbs/books/10159310011/",
  "https://www.amazon.com/Best-Sellers-Books-Erotic-Suspense/zgbs/books/10159311011/",
  "https://www.amazon.com/Best-Sellers-Books-Erotic-Thrillers/zgbs/books/10159312011/",
  "https://www.amazon.com/Best-Sellers-Books-Urban-Erotica/zgbs/books/10159313011/",
  "https://www.amazon.com/Best-Sellers-Books-Victorian-Erotica/zgbs/books/10159314011/",
  "https://www.amazon.com/Best-Sellers-Books-Erotic-Westerns/zgbs/books/10159315011/"
];
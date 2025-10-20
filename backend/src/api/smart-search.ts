// @ts-nocheck
import express from 'express';
import { db } from '../db';
import { 
  books,
  bookPrices,
  bookCategories,
  bookCategoryAssignments,
  // DISABLED: Tables do not exist in database
  // savedSearchFilters,
  // searchAnalytics,
  type Book,
  type BookPrice,
  type BookCategory
  // DISABLED: Type doesn't exist in schema
  // type SavedSearchFilter
} from '../../shared/schema';
import { eq, desc, asc, like, ilike, or, and, sql, between, gte, lte, count, avg, min, max, inArray } from 'drizzle-orm';

const router = express.Router();

// Vietnamese diacritics normalization map
const VIETNAMESE_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'đ': 'd'
};

// =====================================================
// 🔍 SMART SEARCH ENGINE
// =====================================================

// Main smart search endpoint
router.get('/books', async (req, res) => {
  try {
    const {
      q = '',                    // Main search query
      categories = '',           // Category IDs (comma-separated)
      authors = '',              // Authors (comma-separated)
      formats = '',              // Book formats (comma-separated)
      minPrice,                  // Minimum price
      maxPrice,                  // Maximum price
      minRating,                 // Minimum rating
      maxRating,                 // Maximum rating
      sources = '',              // Price sources (comma-separated)
      sortBy = 'relevance',      // Sort field
      sortOrder = 'desc',        // Sort order
      page = 1,                  // Page number
      limit = 20,                // Results per page
      includeOutOfStock = 'false', // Include out of stock
      language = '',             // Book language
      publishedAfter,            // Published after date
      publishedBefore,           // Published before date
      userId                     // User ID for personalization
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Parse search query for intelligent processing
    const searchContext = parseSearchQuery(q as string);
    
    // Build search conditions
    const conditions = await buildSearchConditions({
      searchContext,
      categories: categories as string,
      authors: authors as string,
      formats: formats as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      sources: sources as string,
      includeOutOfStock: includeOutOfStock === 'true',
      language: language as string,
      publishedAfter: publishedAfter as string,
      publishedBefore: publishedBefore as string
    });

    // Build the main query with intelligent joins
    const baseQuery = db
      .select({
        // Book data
        isbn: books.isbn,
        title: books.title,
        author: books.author,
        format: books.format,
        coverImageUrl: books.coverImageUrl,
        ranking: books.ranking,
        isTopSeller: books.isTopSeller,
        averageRating: books.averageRating,
        reviewCount: books.reviewCount,
        
        // Price aggregations
        lowestPrice: min(bookPrices.price),
        highestPrice: max(bookPrices.price),
        averagePrice: avg(bookPrices.price),
        priceCount: count(bookPrices.id),
        bestPriceSource: sql<string>`
          (SELECT source FROM book_prices bp 
           WHERE bp.book_isbn = ${books.isbn} 
           ORDER BY bp.price ASC LIMIT 1)
        `,
        
        // Categories
        primaryCategory: sql<string>`
          (SELECT bc.name FROM book_categories bc 
           JOIN book_category_assignments bca ON bc.id = bca.category_id 
           WHERE bca.book_isbn = ${books.isbn} AND bca.is_primary = true LIMIT 1)
        `,
        allCategories: sql<string[]>`
          ARRAY(SELECT bc.name FROM book_categories bc 
                JOIN book_category_assignments bca ON bc.id = bca.category_id 
                WHERE bca.book_isbn = ${books.isbn})
        `,
        
        // Relevance score for ranking
        relevanceScore: calculateRelevanceScore(searchContext)
      })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn))
      .leftJoin(bookCategoryAssignments, eq(books.isbn, bookCategoryAssignments.bookIsbn))
      .leftJoin(bookCategories, eq(bookCategoryAssignments.categoryId, bookCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(books.isbn);

    // For relevance sorting, get unsorted results and sort in JavaScript
    let results;
    if (sortBy === 'relevance') {
      const unsortedResults = await baseQuery
        .limit(Number(limit) * 2) // Get more results for better sorting
        .offset(offset);
      
      // Sort by relevance score in JavaScript
      results = unsortedResults.sort((a, b) => {
        const scoreA = Number(a.relevanceScore) || 0;
        const scoreB = Number(b.relevanceScore) || 0;
        if (scoreA !== scoreB) {
          return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        }
        // Secondary sort by title
        return a.title.localeCompare(b.title);
      }).slice(0, Number(limit));
    } else {
      // For other sorts, apply sorting in the database
      const sortedQuery = applySorting(baseQuery, sortBy as string, sortOrder as string, searchContext);
      results = await sortedQuery
        .limit(Number(limit))
        .offset(offset);
    }

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(DISTINCT ${books.isbn})` })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn))
      .leftJoin(bookCategoryAssignments, eq(books.isbn, bookCategoryAssignments.bookIsbn))
      .leftJoin(bookCategories, eq(bookCategoryAssignments.categoryId, bookCategories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalResult = await countQuery;
    const total = totalResult[0]?.count || 0;

    // Generate search suggestions if no results
    const suggestions = results.length === 0 ? 
      await generateSearchSuggestions(q as string) : [];

    // Log search analytics
    if (userId) {
      await logSearchAnalytics({
        userId: userId as string,
        query: q as string,
        filters: { categories, authors, formats, minPrice, maxPrice, minRating },
        resultsCount: results.length,
        totalResults: total
      });
    }

    res.json({
      results: results.map((book: any) => ({
        ...book,
        relevanceScore: book.relevanceScore || 0
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      searchContext: {
        query: q,
        parsedQuery: searchContext,
        appliedFilters: {
          categories: categories ? (categories as string).split(',') : [],
          authors: authors ? (authors as string).split(',') : [],
          formats: formats ? (formats as string).split(',') : [],
          priceRange: [minPrice, maxPrice].filter(Boolean),
          ratingRange: [minRating, maxRating].filter(Boolean),
          sources: sources ? (sources as string).split(',') : []
        }
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined
    });

  } catch (error) {
    console.error('Error in smart search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Auto-complete suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '', type = 'all', limit = 10 } = req.query;
    
    if (!q || (q as string).length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = normalizeVietnamese(q as string);
    const suggestions: any[] = [];

    // Get book title suggestions
    if (type === 'all' || type === 'titles') {
      const titleSuggestions = await db
        .select({
          type: sql<string>`'title'`,
          value: books.title,
          subtitle: books.author,
          count: sql<number>`1`,
          relevance: sql<number>`
            CASE 
              WHEN LOWER(${books.title}) LIKE ${searchTerm.toLowerCase() + '%'} THEN 3
              WHEN LOWER(${books.title}) LIKE ${'%' + searchTerm.toLowerCase() + '%'} THEN 2
              ELSE 1
            END
          `
        })
        .from(books)
        .where(ilike(books.title, `%${searchTerm}%`))
        .orderBy(desc(sql`relevance`), asc(books.title))
        .limit(Math.floor(Number(limit) / 3));

      suggestions.push(...titleSuggestions);
    }

    // Get author suggestions
    if (type === 'all' || type === 'authors') {
      const authorSuggestions = await db
        .select({
          type: sql<string>`'author'`,
          value: books.author,
          subtitle: sql<string>`COUNT(*) || ' books'`,
          count: count(),
          relevance: sql<number>`
            CASE 
              WHEN LOWER(${books.author}) LIKE ${searchTerm.toLowerCase() + '%'} THEN 3
              WHEN LOWER(${books.author}) LIKE ${'%' + searchTerm.toLowerCase() + '%'} THEN 2
              ELSE 1
            END
          `
        })
        .from(books)
        .where(ilike(books.author, `%${searchTerm}%`))
        .groupBy(books.author)
        .orderBy(desc(sql`relevance`), desc(count()), asc(books.author))
        .limit(Math.floor(Number(limit) / 3));

      suggestions.push(...authorSuggestions);
    }

    // Get category suggestions
    if (type === 'all' || type === 'categories') {
      const categorySuggestions = await db
        .select({
          type: sql<string>`'category'`,
          value: bookCategories.name,
          subtitle: sql<string>`'Category'`,
          count: sql<number>`1`,
          relevance: sql<number>`
            CASE 
              WHEN LOWER(${bookCategories.name}) LIKE ${searchTerm.toLowerCase() + '%'} THEN 3
              WHEN LOWER(${bookCategories.name}) LIKE ${'%' + searchTerm.toLowerCase() + '%'} THEN 2
              ELSE 1
            END
          `
        })
        .from(bookCategories)
        .where(and(
          ilike(bookCategories.name, `%${searchTerm}%`),
          eq(bookCategories.isActive, true)
        ))
        .orderBy(desc(sql`relevance`), asc(bookCategories.name))
        .limit(Math.floor(Number(limit) / 3));

      suggestions.push(...categorySuggestions);
    }

    // Sort all suggestions by relevance
    suggestions.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    res.json({
      suggestions: suggestions.slice(0, Number(limit)),
      query: q
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// =====================================================
// 📁 SAVED SEARCH FILTERS
// =====================================================

// Get user's saved filters
router.get('/saved-filters/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const filters = await db
      .select()
      .from(savedSearchFilters)
      .where(eq(savedSearchFilters.userId, userId))
      .orderBy(desc(savedSearchFilters.lastUsed), asc(savedSearchFilters.name));

    res.json(filters);
  } catch (error) {
    console.error('Error getting saved filters:', error);
    res.status(500).json({ error: 'Failed to get saved filters' });
  }
});

// Save search filter
router.post('/saved-filters', async (req, res) => {
  try {
    const { userId, name, description, filters } = req.body;

    const result = await db
      .insert(savedSearchFilters)
      .values({
        userId,
        name,
        description,
        filters: JSON.stringify(filters),
        isPublic: false,
        usageCount: 0,
        lastUsed: sql`now()`
      })
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error('Error saving filter:', error);
    res.status(400).json({ error: 'Failed to save filter' });
  }
});

// Update saved filter
router.put('/saved-filters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await db
      .update(savedSearchFilters)
      .set({
        ...updates,
        filters: updates.filters ? JSON.stringify(updates.filters) : undefined,
        updatedAt: sql`now()`
      })
      .where(eq(savedSearchFilters.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating saved filter:', error);
    res.status(500).json({ error: 'Failed to update filter' });
  }
});

// Delete saved filter
router.delete('/saved-filters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(savedSearchFilters)
      .where(eq(savedSearchFilters.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    res.json({ message: 'Filter deleted successfully' });
  } catch (error) {
    console.error('Error deleting saved filter:', error);
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

// Use saved filter (increment usage)
router.post('/saved-filters/:id/use', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .update(savedSearchFilters)
      .set({
        usageCount: sql`${savedSearchFilters.usageCount} + 1`,
        lastUsed: sql`now()`,
        updatedAt: sql`now()`
      })
      .where(eq(savedSearchFilters.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error using saved filter:', error);
    res.status(500).json({ error: 'Failed to update filter usage' });
  }
});

// Get popular public filters
router.get('/popular-filters', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const filters = await db
      .select()
      .from(savedSearchFilters)
      .where(eq(savedSearchFilters.isPublic, true))
      .orderBy(desc(savedSearchFilters.usageCount), desc(savedSearchFilters.lastUsed))
      .limit(Number(limit));

    res.json(filters);
  } catch (error) {
    console.error('Error getting popular filters:', error);
    res.status(500).json({ error: 'Failed to get popular filters' });
  }
});

// =====================================================
// 🔧 HELPER FUNCTIONS
// =====================================================

/**
 * Parse natural language search query
 */
interface SearchContext {
  originalQuery: string;
  normalizedQuery: string;
  terms: string[];
  exactPhrases: string[];
  excludedTerms: string[];
  filters: Record<string, any>;
}

function parseSearchQuery(query: string): SearchContext {
  const context: SearchContext = {
    originalQuery: query,
    normalizedQuery: normalizeVietnamese(query),
    terms: [],
    exactPhrases: [],
    excludedTerms: [],
    filters: {}
  };

  if (!query.trim()) {
    return context;
  }

  // Extract exact phrases (quoted strings)
  const exactPhraseRegex = /"([^"]+)"/g;
  let match;
  while ((match = exactPhraseRegex.exec(query)) !== null) {
    context.exactPhrases.push(match[1].trim());
    query = query.replace(match[0], ''); // Remove from main query
  }

  // Extract excluded terms (-term)
  const excludedRegex = /-(\w+)/g;
  while ((match = excludedRegex.exec(query)) !== null) {
    context.excludedTerms.push(match[1]);
    query = query.replace(match[0], ''); // Remove from main query
  }

  // Extract remaining terms
  context.terms = query
    .split(/\s+/)
    .map(term => term.trim().toLowerCase())
    .filter(term => term.length > 0);

  return context;
}

/**
 * Build search conditions from filters
 */
async function buildSearchConditions(filters: any): Promise<any[]> {
  const conditions: any[] = [];

  // Text search conditions
  if (filters.searchContext.terms.length > 0) {
    const textConditions = [];
    
    for (const term of filters.searchContext.terms) {
      textConditions.push(
        or(
          ilike(books.title, `%${term}%`),
          ilike(books.author, `%${term}%`),
          ilike(books.isbn, `%${term}%`)
        )
      );
    }
    
    if (textConditions.length > 0) {
      conditions.push(and(...textConditions));
    }
  }

  // Exact phrase search
  if (filters.searchContext.exactPhrases.length > 0) {
    for (const phrase of filters.searchContext.exactPhrases) {
      conditions.push(
        or(
          ilike(books.title, `%${phrase}%`),
          ilike(books.author, `%${phrase}%`)
        )
      );
    }
  }

  // Excluded terms
  if (filters.searchContext.excludedTerms.length > 0) {
    for (const term of filters.searchContext.excludedTerms) {
      conditions.push(
        and(
          sql`LOWER(${books.title}) NOT LIKE ${'%' + term.toLowerCase() + '%'}`,
          sql`LOWER(${books.author}) NOT LIKE ${'%' + term.toLowerCase() + '%'}`
        )
      );
    }
  }

  // Category filter
  if (filters.categories) {
    const categoryIds = filters.categories.split(',').filter(Boolean);
    if (categoryIds.length > 0) {
      conditions.push(
        sql`${books.isbn} IN (
          SELECT book_isbn FROM book_category_assignments 
          WHERE category_id IN (${categoryIds.map((id: string) => `'${id}'`).join(', ')})
        )`
      );
    }
  }

  // Author filter
  if (filters.authors) {
    const authorList = filters.authors.split(',').map((a: string) => a.trim()).filter(Boolean);
    if (authorList.length > 0) {
      conditions.push(inArray(books.author, authorList));
    }
  }

  // Format filter
  if (filters.formats) {
    const formatList = filters.formats.split(',').filter(Boolean);
    if (formatList.length > 0) {
      conditions.push(inArray(books.format, formatList));
    }
  }

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceConditions = [];
    
    if (filters.minPrice !== undefined) {
      priceConditions.push(gte(bookPrices.price, filters.minPrice.toString()));
    }
    
    if (filters.maxPrice !== undefined) {
      priceConditions.push(lte(bookPrices.price, filters.maxPrice.toString()));
    }
    
    if (priceConditions.length > 0) {
      conditions.push(and(...priceConditions));
    }
  }

  // Rating range filter
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    const ratingConditions = [];
    
    if (filters.minRating !== undefined) {
      ratingConditions.push(gte(books.averageRating, filters.minRating));
    }
    
    if (filters.maxRating !== undefined) {
      ratingConditions.push(lte(books.averageRating, filters.maxRating));
    }
    
    if (ratingConditions.length > 0) {
      conditions.push(and(...ratingConditions));
    }
  }

  // Source filter
  if (filters.sources) {
    const sourceList = filters.sources.split(',').filter(Boolean);
    if (sourceList.length > 0) {
      conditions.push(inArray(bookPrices.source, sourceList));
    }
  }

  // Stock filter
  if (!filters.includeOutOfStock) {
    conditions.push(sql`${bookPrices.status} LIKE '%Stock%' OR ${bookPrices.status} LIKE '%Available%'`);
  }

  return conditions;
}

/**
 * Calculate relevance score for search ranking
 */
function calculateRelevanceScore(searchContext: SearchContext) {
  if (!searchContext.terms.length && !searchContext.exactPhrases.length) {
    return sql<number>`0`;
  }

  const scoreComponents: any[] = [];

  // Title match scores
  for (const term of searchContext.terms) {
    const lowerTerm = term.toLowerCase();
    scoreComponents.push(sql`
      CASE 
        WHEN LOWER(${books.title}) = ${lowerTerm} THEN 100
        WHEN LOWER(${books.title}) LIKE ${lowerTerm + '%'} THEN 50
        WHEN LOWER(${books.title}) LIKE ${'%' + lowerTerm + '%'} THEN 20
        ELSE 0
      END
    `);
  }

  // Author match scores
  for (const term of searchContext.terms) {
    const lowerTerm = term.toLowerCase();
    scoreComponents.push(sql`
      CASE 
        WHEN LOWER(${books.author}) = ${lowerTerm} THEN 80
        WHEN LOWER(${books.author}) LIKE ${lowerTerm + '%'} THEN 40
        WHEN LOWER(${books.author}) LIKE ${'%' + lowerTerm + '%'} THEN 15
        ELSE 0
      END
    `);
  }

  // Exact phrase bonus
  for (const phrase of searchContext.exactPhrases) {
    const lowerPhrase = '%' + phrase.toLowerCase() + '%';
    scoreComponents.push(sql`
      CASE 
        WHEN LOWER(${books.title}) LIKE ${lowerPhrase} THEN 150
        WHEN LOWER(${books.author}) LIKE ${lowerPhrase} THEN 120
        ELSE 0
      END
    `);
  }

  // Quality signals
  scoreComponents.push(sql`
    CASE 
      WHEN ${books.isTopSeller} = true THEN 30
      ELSE 0
    END
  `);

  scoreComponents.push(sql`
    CASE 
      WHEN ${books.averageRating} >= 4.5 THEN 25
      WHEN ${books.averageRating} >= 4.0 THEN 15
      WHEN ${books.averageRating} >= 3.5 THEN 10
      ELSE 0
    END
  `);

  // Combine all score components
  if (scoreComponents.length === 0) {
    return sql<number>`0`;
  }
  
  if (scoreComponents.length === 1) {
    return scoreComponents[0];
  }
  
  // Properly combine SQL expressions by reducing with addition
  return scoreComponents.reduce((acc, component) => 
    sql<number>`${acc} + ${component}`
  );
}

/**
 * Apply sorting to search results
 */
function applySorting(query: any, sortBy: string, sortOrder: string, searchContext: SearchContext) {
  const isAsc = sortOrder.toLowerCase() === 'asc';
  
  switch (sortBy) {
    case 'relevance':
      const relevanceScoreForSort = calculateRelevanceScore(searchContext);
      return query.orderBy(desc(relevanceScoreForSort), asc(books.title));
      
    case 'title':
      return query.orderBy(isAsc ? asc(books.title) : desc(books.title));
      
    case 'author':
      return query.orderBy(isAsc ? asc(books.author) : desc(books.author));
      
    case 'rating':
      return query.orderBy(isAsc ? asc(books.averageRating) : desc(books.averageRating));
      
    case 'price':
      return query.orderBy(isAsc ? asc(sql`MIN(${bookPrices.price})`) : desc(sql`MIN(${bookPrices.price})`));
      
    case 'popularity':
      return query.orderBy(desc(books.reviewCount), desc(books.averageRating));
      
    case 'newest':
      return query.orderBy(desc(books.createdAt));
      
    default:
      const defaultRelevanceScore = calculateRelevanceScore(searchContext);
      return query.orderBy(desc(defaultRelevanceScore), asc(books.title));
  }
}

/**
 * Generate search suggestions when no results found
 */
async function generateSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim()) {
    return [];
  }

  const suggestions: string[] = [];
  
  // Get similar book titles
  const similarTitles = await db
    .select({ title: books.title })
    .from(books)
    .where(sql`SIMILARITY(LOWER(${books.title}), LOWER(${query})) > 0.3`)
    .orderBy(sql`SIMILARITY(LOWER(${books.title}), LOWER(${query})) DESC`)
    .limit(3);

  suggestions.push(...similarTitles.map(book => book.title));

  // Get similar authors
  const similarAuthors = await db
    .select({ author: books.author })
    .from(books)
    .where(sql`SIMILARITY(LOWER(${books.author}), LOWER(${query})) > 0.3`)
    .groupBy(books.author)
    .orderBy(sql`SIMILARITY(LOWER(${books.author}), LOWER(${query})) DESC`)
    .limit(2);

  suggestions.push(...similarAuthors.map(book => book.author));

  return suggestions.slice(0, 5);
}

/**
 * Normalize Vietnamese diacritics for search
 */
function normalizeVietnamese(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split('')
    .map(char => VIETNAMESE_MAP[char] || char)
    .join('');
}

/**
 * Log search analytics
 */
async function logSearchAnalytics(data: {
  userId: string;
  query: string;
  filters: any;
  resultsCount: number;
  totalResults: number;
}) {
  try {
    await db
      .insert(searchAnalytics)
      .values({
        userId: data.userId,
        query: data.query,
        filters: JSON.stringify(data.filters),
        resultsCount: data.resultsCount,
        totalResults: data.totalResults,
        searchTimestamp: sql`now()`
      });
  } catch (error) {
    console.error('Error logging search analytics:', error);
  }
}

export default router;
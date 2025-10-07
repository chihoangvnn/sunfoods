import express from 'express';
import { db } from '../db';
import { 
  books,
  bookPrices,
  bookCategories,
  bookCategoryAssignments,
  categoryPriceRules,
  type BookWithPrices,
  type CategoryPriceRule,
  type BookPriceSource,
  BOOK_PRICE_SOURCES
} from '../../shared/schema';
import { eq, desc, asc, like, or, and, sql, between, gte, lte, count, avg, min, max } from 'drizzle-orm';

const router = express.Router();

// =====================================================
// 💰 ADVANCED PRICE FILTERING SYSTEM
// =====================================================

// Get books with advanced price filtering
router.get('/books', async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      categoryId,
      priceSource,
      sortBy = 'price',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
      hasDiscount = false,
      inStock = true,
      condition,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build base query
    let whereConditions: any[] = [];
    let havingConditions: any[] = [];

    // Price range filtering
    if (minPrice) {
      havingConditions.push(gte(sql`MIN(${bookPrices.price})`, Number(minPrice)));
    }
    if (maxPrice) {
      havingConditions.push(lte(sql`MAX(${bookPrices.price})`, Number(maxPrice)));
    }

    // Search filtering
    if (search) {
      whereConditions.push(
        or(
          like(books.title, `%${search}%`),
          like(books.author, `%${search}%`),
          like(books.isbn, `%${search}%`)
        )
      );
    }

    // Category filtering
    if (categoryId) {
      whereConditions.push(
        sql`${books.isbn} IN (SELECT book_isbn FROM book_category_assignments WHERE category_id = ${categoryId})`
      );
    }

    // Price source filtering
    if (priceSource && priceSource !== 'all') {
      whereConditions.push(eq(bookPrices.source, priceSource as string));
    }

    // Stock status filtering
    if (inStock === 'true') {
      whereConditions.push(like(bookPrices.status, '%Stock%'));
    }

    // Get books with aggregated price data
    const booksQuery = db
      .select({
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
        // Best price details
        bestPriceSource: sql<string>`
          (SELECT source FROM book_prices bp WHERE bp.book_isbn = ${books.isbn} ORDER BY bp.price ASC LIMIT 1)
        `,
        bestPrice: sql<number>`
          (SELECT price FROM book_prices bp WHERE bp.book_isbn = ${books.isbn} ORDER BY bp.price ASC LIMIT 1)
        `,
        bestPriceStatus: sql<string>`
          (SELECT status FROM book_prices bp WHERE bp.book_isbn = ${books.isbn} ORDER BY bp.price ASC LIMIT 1)
        `,
        // Category info
        primaryCategory: sql<string>`
          (SELECT bc.name FROM book_categories bc 
           JOIN book_category_assignments bca ON bc.id = bca.category_id 
           WHERE bca.book_isbn = ${books.isbn} AND bca.is_primary = true LIMIT 1)
        `
      })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(books.isbn)
      .having(havingConditions.length > 0 ? and(...havingConditions) : undefined);

    // Apply sorting
    const sortColumn = sortBy === 'price' ? sql`MIN(${bookPrices.price})` :
                      sortBy === 'title' ? books.title :
                      sortBy === 'rating' ? books.averageRating :
                      sortBy === 'ranking' ? books.ranking :
                      books.title;

    const orderedQuery = booksQuery
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
      .limit(Number(limit))
      .offset(offset);

    const results = await orderedQuery;

    // Get total count for pagination
    const totalQuery = db
      .select({ count: count() })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(books.isbn)
      .having(havingConditions.length > 0 ? and(...havingConditions) : undefined);

    const totalResults = await totalQuery;
    const total = totalResults.length;

    res.json({
      books: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      },
      filters: {
        appliedFilters: {
          minPrice,
          maxPrice,
          categoryId,
          priceSource,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Error in advanced price filtering:', error);
    res.status(500).json({ error: 'Failed to filter books by price' });
  }
});

// Get price ranges for category
router.get('/price-ranges/:categoryId?', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { source } = req.query;

    let query = db
      .select({
        minPrice: min(bookPrices.price),
        maxPrice: max(bookPrices.price),
        avgPrice: avg(bookPrices.price),
        totalBooks: sql<number>`COUNT(DISTINCT ${books.isbn})`,
        totalPrices: count(bookPrices.id)
      })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn));

    let whereConditions: any[] = [];

    // Filter by category if specified
    if (categoryId) {
      whereConditions.push(
        sql`${books.isbn} IN (SELECT book_isbn FROM book_category_assignments WHERE category_id = ${categoryId})`
      );
    }

    // Filter by price source if specified
    if (source && source !== 'all') {
      whereConditions.push(eq(bookPrices.source, source as string));
    }

    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    const result = await query;
    const priceData = result[0] || {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      totalBooks: 0,
      totalPrices: 0
    };

    // Get price distribution (histogram)
    const distributionQuery = db
      .select({
        priceRange: sql<string>`
          CASE 
            WHEN ${bookPrices.price}::numeric < 10 THEN 'Under $10'
            WHEN ${bookPrices.price}::numeric < 25 THEN '$10-$25'  
            WHEN ${bookPrices.price}::numeric < 50 THEN '$25-$50'
            WHEN ${bookPrices.price}::numeric < 100 THEN '$50-$100'
            ELSE 'Over $100'
          END
        `,
        count: count()
      })
      .from(bookPrices)
      .leftJoin(books, eq(bookPrices.bookIsbn, books.isbn))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`
        CASE 
          WHEN ${bookPrices.price}::numeric < 10 THEN 'Under $10'
          WHEN ${bookPrices.price}::numeric < 25 THEN '$10-$25'  
          WHEN ${bookPrices.price}::numeric < 50 THEN '$25-$50'
          WHEN ${bookPrices.price}::numeric < 100 THEN '$50-$100'
          ELSE 'Over $100'
        END
      `)
      .orderBy(asc(sql`
        CASE 
          WHEN ${bookPrices.price}::numeric < 10 THEN 1
          WHEN ${bookPrices.price}::numeric < 25 THEN 2
          WHEN ${bookPrices.price}::numeric < 50 THEN 3
          WHEN ${bookPrices.price}::numeric < 100 THEN 4
          ELSE 5
        END
      `));

    const distribution = await distributionQuery;

    res.json({
      priceRange: {
        min: Number(priceData.minPrice || 0),
        max: Number(priceData.maxPrice || 0),
        average: Number(priceData.avgPrice || 0)
      },
      statistics: {
        totalBooks: priceData.totalBooks || 0,
        totalPrices: priceData.totalPrices || 0
      },
      distribution,
      categoryId: categoryId || null
    });

  } catch (error) {
    console.error('Error getting price ranges:', error);
    res.status(500).json({ error: 'Failed to get price ranges' });
  }
});

// Get price comparison across sources for a book
router.get('/compare/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;

    // Get book details
    const book = await db
      .select()
      .from(books)
      .where(eq(books.isbn, isbn))
      .limit(1);

    if (!book.length) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get all prices for this book
    const prices = await db
      .select()
      .from(bookPrices)
      .where(eq(bookPrices.bookIsbn, isbn))
      .orderBy(asc(bookPrices.price));

    // Calculate price statistics
    const priceValues = prices.map(p => Number(p.price));
    const stats = {
      lowest: Math.min(...priceValues),
      highest: Math.max(...priceValues),
      average: priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length,
      savings: Math.max(...priceValues) - Math.min(...priceValues),
      sourceCount: prices.length
    };

    // Group prices by source with metadata
    const pricesBySources = prices.map(price => ({
      ...price,
      sourceInfo: BOOK_PRICE_SOURCES[price.source as BookPriceSource],
      isLowest: Number(price.price) === stats.lowest,
      isHighest: Number(price.price) === stats.highest,
      savingsFromThis: stats.highest - Number(price.price)
    }));

    res.json({
      book: book[0],
      prices: pricesBySources,
      statistics: stats,
      recommendation: {
        bestDeal: pricesBySources.find(p => p.isLowest),
        potentialSavings: stats.savings,
        averageSavings: stats.highest - stats.average
      }
    });

  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

// =====================================================
// 🏷️ DYNAMIC PRICING RULES MANAGEMENT
// =====================================================

// Get price rules for category
router.get('/rules/:categoryId?', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { isActive = 'true' } = req.query;

    let query = db
      .select({
        rule: categoryPriceRules,
        category: bookCategories
      })
      .from(categoryPriceRules)
      .leftJoin(bookCategories, eq(categoryPriceRules.categoryId, bookCategories.id));

    let whereConditions: any[] = [];

    if (categoryId) {
      whereConditions.push(eq(categoryPriceRules.categoryId, categoryId));
    }

    if (isActive !== 'all') {
      whereConditions.push(eq(categoryPriceRules.isActive, isActive === 'true'));
    }

    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    const rules = await query.orderBy(desc(categoryPriceRules.priority), asc(categoryPriceRules.ruleName));

    res.json(rules);
  } catch (error) {
    console.error('Error fetching price rules:', error);
    res.status(500).json({ error: 'Failed to fetch price rules' });
  }
});

// Create price rule
router.post('/rules', async (req, res) => {
  try {
    const ruleData = req.body;

    const result = await db
      .insert(categoryPriceRules)
      .values(ruleData)
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error('Error creating price rule:', error);
    res.status(400).json({ error: 'Invalid price rule data' });
  }
});

// Update price rule
router.put('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const result = await db
      .update(categoryPriceRules)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(categoryPriceRules.id, ruleId))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Price rule not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating price rule:', error);
    res.status(500).json({ error: 'Failed to update price rule' });
  }
});

// Delete price rule
router.delete('/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;

    const result = await db
      .delete(categoryPriceRules)
      .where(eq(categoryPriceRules.id, ruleId))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Price rule not found' });
    }

    res.json({ message: 'Price rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting price rule:', error);
    res.status(500).json({ error: 'Failed to delete price rule' });
  }
});

// Apply price rules to category (bulk operation)
router.post('/rules/:categoryId/apply', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { dryRun = false } = req.body;

    // Get all active rules for this category
    const rules = await db
      .select()
      .from(categoryPriceRules)
      .where(and(
        eq(categoryPriceRules.categoryId, categoryId),
        eq(categoryPriceRules.isActive, true)
      ))
      .orderBy(desc(categoryPriceRules.priority));

    if (!rules.length) {
      return res.status(404).json({ error: 'No active price rules found for this category' });
    }

    // Get all books in this category
    const categoryBooks = await db
      .select({ isbn: bookCategoryAssignments.bookIsbn })
      .from(bookCategoryAssignments)
      .where(eq(bookCategoryAssignments.categoryId, categoryId));

    const results = [];
    let affectedBooks = 0;

    for (const book of categoryBooks) {
      // Get current prices for this book
      const currentPrices = await db
        .select()
        .from(bookPrices)
        .where(eq(bookPrices.bookIsbn, book.isbn));

      for (const price of currentPrices) {
        // Apply the highest priority rule that matches
        for (const rule of rules) {
          let newPrice = Number(price.price);
          let applied = false;

          // Apply rule based on type
          switch (rule.ruleType) {
            case 'discount':
              if (rule.discountPercentage) {
                newPrice = Number(price.price) * (1 - Number(rule.discountPercentage) / 100);
                applied = true;
              }
              break;
            
            case 'markup':
              if (rule.markupPercentage) {
                newPrice = Number(price.price) * (1 + Number(rule.markupPercentage) / 100);
                applied = true;
              }
              break;
            
            case 'fixed_price':
              if (rule.minPrice) {
                newPrice = Number(rule.minPrice);
                applied = true;
              }
              break;
            
            case 'price_range':
              if (rule.minPrice && Number(price.price) < Number(rule.minPrice)) {
                newPrice = Number(rule.minPrice);
                applied = true;
              } else if (rule.maxPrice && Number(price.price) > Number(rule.maxPrice)) {
                newPrice = Number(rule.maxPrice);
                applied = true;
              }
              break;
          }

          if (applied) {
            results.push({
              isbn: book.isbn,
              priceId: price.id,
              source: price.source,
              oldPrice: Number(price.price),
              newPrice: Number(newPrice.toFixed(2)),
              ruleName: rule.ruleName,
              ruleType: rule.ruleType
            });

            // Apply the change if not dry run
            if (!dryRun) {
              await db
                .update(bookPrices)
                .set({ 
                  price: newPrice.toFixed(2),
                  lastUpdatedAt: sql`now()`
                })
                .where(eq(bookPrices.id, price.id));
            }

            affectedBooks++;
            break; // Only apply the first matching rule
          }
        }
      }
    }

    res.json({
      success: true,
      dryRun,
      categoryId,
      rulesApplied: rules.length,
      affectedPrices: results.length,
      affectedBooks,
      changes: dryRun ? results : results.slice(0, 10), // Limit output for actual changes
      message: dryRun ? 'Dry run completed - no changes made' : 'Price rules applied successfully'
    });

  } catch (error) {
    console.error('Error applying price rules:', error);
    res.status(500).json({ error: 'Failed to apply price rules' });
  }
});

// Get price analytics for dashboard
router.get('/analytics/:categoryId?', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Base analytics query
    let query = db
      .select({
        totalBooks: sql<number>`COUNT(DISTINCT ${books.isbn})`,
        totalPrices: count(bookPrices.id),
        avgPrice: avg(bookPrices.price),
        minPrice: min(bookPrices.price),
        maxPrice: max(bookPrices.price),
        priceRange: sql<number>`MAX(${bookPrices.price}) - MIN(${bookPrices.price})`,
        sourceDistribution: sql<string>`json_object_agg(${bookPrices.source}, COUNT(*)) FILTER (WHERE ${bookPrices.source} IS NOT NULL)`
      })
      .from(books)
      .leftJoin(bookPrices, eq(books.isbn, bookPrices.bookIsbn));

    if (categoryId) {
      query = query.innerJoin(bookCategoryAssignments, eq(books.isbn, bookCategoryAssignments.bookIsbn));
      query = query.where(eq(bookCategoryAssignments.categoryId, categoryId));
    }

    const analytics = await query;
    
    // Get top sources by count
    const topSources = await db
      .select({
        source: bookPrices.source,
        count: count(),
        avgPrice: avg(bookPrices.price)
      })
      .from(bookPrices)
      .leftJoin(books, eq(bookPrices.bookIsbn, books.isbn))
      .where(categoryId ? 
        sql`${books.isbn} IN (SELECT book_isbn FROM book_category_assignments WHERE category_id = ${categoryId})` : 
        undefined
      )
      .groupBy(bookPrices.source)
      .orderBy(desc(count()))
      .limit(10);

    // Get price trends (mock data for now)
    const trends = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Average Price',
          data: [25.50, 24.80, 26.20, 25.90],
          trend: 'stable'
        }
      ]
    };

    res.json({
      overview: analytics[0] || {},
      topSources,
      trends,
      categoryId: categoryId || null,
      timeframe
    });

  } catch (error) {
    console.error('Error getting price analytics:', error);
    res.status(500).json({ error: 'Failed to get price analytics' });
  }
});

export default router;
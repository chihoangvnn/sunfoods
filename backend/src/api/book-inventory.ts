import express from 'express';
import { db } from '../db';
import { bookSellers, bookSellerInventory, products, categories } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// ==================== VIETNAMESE BOOK DATA GENERATORS ====================

// Define types for better TypeScript support
type BookCategoryKey = 'van-hoc-viet-nam' | 'sach-giao-khoa' | 'kinh-te-quan-ly' | 'khoa-hoc-cong-nghe' | 'lich-su-dia-ly' | 'tam-ly-ky-nang-song' | 'thieu-nhi' | 'ngoai-ngu';

type BookConditionKey = 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';

interface BookCategoryInfo {
  name: string;
  priceRange: [number, number];
  popularAuthors: string[];
  titleTemplates: string[];
  titlePrefixes: string[];
}

interface BookConditionInfo {
  name: string;
  priceModifier: number;
}

// Vietnamese Book Categories with metadata
const VIETNAMESE_BOOK_CATEGORIES: Record<BookCategoryKey, BookCategoryInfo> = {
  'van-hoc-viet-nam': {
    name: 'Văn học Việt Nam',
    priceRange: [80000, 350000],
    popularAuthors: [
      'Nguyễn Du', 'Nam Cao', 'Tô Hoài', 'Nguyễn Tuân', 'Kim Lân',
      'Nguyễn Huy Tưởng', 'Vũ Trọng Phụng', 'Thạch Lam', 'Xuân Diệu',
      'Huy Cận', 'Tố Hữu', 'Chế Lan Viên', 'Nguyễn Đình Thi'
    ],
    titleTemplates: [
      'Truyện Kiều', 'Chí Phèo', 'Dế Mèn phiêu lưu ký', 'Vợ Nhặt',
      'Hai đứa trẻ', 'Số Đỏ', 'Làng', 'Gió lạnh đầu mùa',
      'Những ngôi sao xa xôi', 'Đất rừng phương Nam', 'Tắt đèn'
    ],
    titlePrefixes: [
      'Truyện', 'Tiểu thuyết', 'Tập thơ', 'Văn xuôi', 'Hồi ký',
      'Ký sự', 'Tùy bút', 'Tác phẩm', 'Chuyện', 'Câu chuyện'
    ]
  },
  'sach-giao-khoa': {
    name: 'Sách giáo khoa',
    priceRange: [50000, 150000],
    popularAuthors: [
      'Bộ Giáo dục và Đào tạo', 'NXB Giáo dục Việt Nam',
      'Tập thể tác giả', 'GS.TS. Nguyễn Văn A', 'PGS.TS. Trần Thị B'
    ],
    titleTemplates: [
      'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học',
      'Sinh học', 'Lịch sử', 'Địa lý', 'Giáo dục công dân',
      'Tin học', 'Công nghệ', 'Thể dục'
    ],
    titlePrefixes: [
      'Sách giáo khoa', 'Bài tập', 'Sách bài tập', 'Tài liệu học tập',
      'Sách tham khảo', 'Sách giáo viên', 'Sách hướng dẫn'
    ]
  },
  'kinh-te-quan-ly': {
    name: 'Kinh tế - Quản lý',
    priceRange: [120000, 500000],
    popularAuthors: [
      'Philip Kotler', 'Peter Drucker', 'Jack Welch', 'Warren Buffett',
      'GS. Nguyễn Văn Cường', 'TS. Lê Thị Minh', 'Vũ Thành Tự Anh',
      'Phạm Chi Lan', 'Đặng Hùng Võ'
    ],
    titleTemplates: [
      'Marketing căn bản', 'Quản trị doanh nghiệp', 'Kế toán tài chính',
      'Kinh tế vĩ mô', 'Đầu tư chứng khoán', 'Khởi nghiệp thành công',
      'Lãnh đạo hiệu quả', 'Bán hàng chuyên nghiệp'
    ],
    titlePrefixes: [
      'Cẩm nang', 'Bí quyết', 'Hướng dẫn', 'Nghệ thuật', 'Khoa học',
      'Chiến lược', 'Phương pháp', 'Kỹ năng', 'Bài học'
    ]
  },
  'khoa-hoc-cong-nghe': {
    name: 'Khoa học công nghệ',
    priceRange: [100000, 400000],
    popularAuthors: [
      'Stephen Hawking', 'Bill Gates', 'Steve Jobs', 'Albert Einstein',
      'GS. Nguyễn Thanh Liêm', 'PGS. Phạm Văn Đức', 'TS. Lê Minh Hoàng'
    ],
    titleTemplates: [
      'Lập trình Python', 'Trí tuệ nhân tạo', 'An ninh mạng',
      'Vật lý lượng tử', 'Sinh học phân tử', 'Công nghệ blockchain',
      'Khoa học dữ liệu', 'Internet vạn vật'
    ],
    titlePrefixes: [
      'Giáo trình', 'Cẩm nang', 'Hướng dẫn', 'Từ cơ bản đến nâng cao',
      'Thực hành', 'Ứng dụng', 'Nguyên lý', 'Kỹ thuật'
    ]
  },
  'lich-su-dia-ly': {
    name: 'Lịch sử - Địa lý',
    priceRange: [80000, 300000],
    popularAuthors: [
      'Phan Bội Châu', 'Trần Trọng Kim', 'GS. Phan Huy Lê',
      'TS. Vũ Minh Giang', 'Nhà sử học Nguyễn Khắc Viện'
    ],
    titleTemplates: [
      'Lịch sử Việt Nam', 'Địa lý Việt Nam', 'Thế giới cổ đại',
      'Chiến tranh Việt Nam', 'Văn hóa dân tộc', 'Di sản văn hóa',
      'Danh nhân lịch sử', 'Cảnh quan thiên nhiên'
    ],
    titlePrefixes: [
      'Tìm hiểu', 'Khám phá', 'Nghiên cứu', 'Tổng quan', 'Hành trình',
      'Câu chuyện', 'Bí ẩn', 'Truyền thuyết', 'Sự thật'
    ]
  },
  'tam-ly-ky-nang-song': {
    name: 'Tâm lý - Kỹ năng sống',
    priceRange: [90000, 250000],
    popularAuthors: [
      'Dale Carnegie', 'Stephen Covey', 'Daniel Goleman',
      'TS. Tâm lý Nguyễn Thị Oanh', 'Vãn Như Cương', 'Tony Buzan'
    ],
    titleTemplates: [
      'Đắc nhân tâm', 'EQ - Trí tuệ cảm xúc', 'Tư duy tích cực',
      'Giao tiếp hiệu quả', 'Quản lý thời gian', 'Tự tin vượt khó',
      'Nuôi dạy con trẻ', 'Stress và cách đối phó'
    ],
    titlePrefixes: [
      'Bí quyết', 'Nghệ thuật', 'Cách thức', 'Phương pháp', 'Kỹ năng',
      'Hướng dẫn', '7 thói quen', 'Làm chủ', 'Vượt qua'
    ]
  },
  'thieu-nhi': {
    name: 'Thiếu nhi',
    priceRange: [60000, 200000],
    popularAuthors: [
      'Tô Hoài', 'Võ Quảng', 'Nguyễn Nhật Ánh', 'Nguyên Hồng',
      'Ma Văn Kháng', 'Nguyễn Phan Hách', 'Edmondo De Amicis'
    ],
    titleTemplates: [
      'Dế Mèn phiêu lưu ký', 'Hoàng tử bé', 'Cô bé bán diêm',
      'Những cuộc phiêu lưu của Tom Sawyer', 'Alice ở xứ sở thần tiên',
      'Chuyện cổ tích Việt Nam', 'Truyện tranh thiếu nhi'
    ],
    titlePrefixes: [
      'Truyện', 'Cổ tích', 'Chuyện kể', 'Phiêu lưu', 'Khám phá',
      'Bài học', 'Câu chuyện', 'Hành trình', 'Cuộc đời'
    ]
  },
  'ngoai-ngu': {
    name: 'Ngoại ngữ',
    priceRange: [70000, 300000],
    popularAuthors: [
      'Oxford University Press', 'Cambridge University Press',
      'Pearson Education', 'TS. Nguyễn Quốc Hùng', 'Th.S Lê Thu Trang'
    ],
    titleTemplates: [
      'English Grammar in Use', 'TOEFL Preparation', 'IELTS Complete',
      'Business English', 'Conversation Practice', 'Vocabulary Builder',
      'Pronunciation Power', 'Writing Skills'
    ],
    titlePrefixes: [
      'Học', 'Thành thạo', 'Cơ bản', 'Nâng cao', 'Thực hành',
      'Giao tiếp', 'Từ vựng', 'Ngữ pháp', 'Luyện thi'
    ]
  }
};

// Vietnamese Publishers
const VIETNAMESE_PUBLISHERS = [
  'NXB Trẻ', 'NXB Văn học', 'NXB Giáo dục Việt Nam', 'NXB Kim Đồng',
  'NXB Phụ nữ Việt Nam', 'NXB Lao động', 'NXB Chính trị Quốc gia Sự thật',
  'NXB Khoa học và Kỹ thuật', 'NXB Đại học Quốc gia Hà Nội',
  'NXB Thế giới', 'NXB Hội nhà văn', 'NXB Tổng hợp TP.HCM',
  'NXB Đại học Quốc gia TP.HCM', 'NXB Công thương', 'NXB Tài chính',
  'NXB Y học', 'NXB Nông nghiệp', 'NXB Xây dựng', 'NXB Giao thông vận tải',
  'NXB Thông tin và Truyền thông', 'NXB Văn hóa - Văn nghệ'
];

// Book Conditions with pricing modifiers
const BOOK_CONDITIONS: Record<BookConditionKey, BookConditionInfo> = {
  'new': { name: 'Mới', priceModifier: 1.0 },
  'like_new': { name: 'Như mới', priceModifier: 0.85 },
  'very_good': { name: 'Rất tốt', priceModifier: 0.75 },
  'good': { name: 'Tốt', priceModifier: 0.65 },
  'acceptable': { name: 'Chấp nhận được', priceModifier: 0.45 }
};

// ==================== UTILITY FUNCTIONS ====================

// Generate valid ISBN-13
function generateISBN13(): string {
  const prefix = '978';
  const registrationGroup = Math.floor(Math.random() * 10).toString();
  const registrant = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const publication = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Calculate check digit
  const partialISBN = prefix + registrationGroup + registrant + publication;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(partialISBN[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return partialISBN + checkDigit.toString();
}

// Generate Vietnamese book title
function generateVietnameseBookTitle(categoryKey: string): string {
  const category = VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey];
  if (!category) return 'Sách tiếng Việt';
  
  const prefix = category.titlePrefixes[Math.floor(Math.random() * category.titlePrefixes.length)];
  const template = category.titleTemplates[Math.floor(Math.random() * category.titleTemplates.length)];
  
  // 30% chance to use template as-is, 70% chance to combine with prefix
  if (Math.random() < 0.3) {
    return template;
  }
  
  return `${prefix} ${template}`;
}

// Generate author name (mix of Vietnamese and international)
function generateAuthorName(categoryKey: string): string {
  const category = VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey];
  if (!category) return 'Tác giả không rõ';
  
  // 60% chance Vietnamese author, 40% chance from category's popular authors
  if (Math.random() < 0.6) {
    const vietnameseFirstNames = [
      'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'
    ];
    const vietnameseMiddleNames = [
      'Văn', 'Thị', 'Công', 'Minh', 'Thanh', 'Hữu', 'Quốc', 'Duy', 'Tuấn', 'Hạnh'
    ];
    const vietnameseLastNames = [
      'Hùng', 'Linh', 'Long', 'Nam', 'An', 'Bình', 'Cường', 'Đức', 'Giang', 'Hải'
    ];
    
    const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
    const middleName = vietnameseMiddleNames[Math.floor(Math.random() * vietnameseMiddleNames.length)];
    const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
    
    return `${firstName} ${middleName} ${lastName}`;
  }
  
  return category.popularAuthors[Math.floor(Math.random() * category.popularAuthors.length)];
}

// Generate realistic pricing based on category and condition
function generatePrice(categoryKey: string, condition: string): number {
  const category = VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey];
  const conditionInfo = BOOK_CONDITIONS[condition as BookConditionKey];
  
  if (!category || !conditionInfo) return 100000;
  
  const [minPrice, maxPrice] = category.priceRange;
  const basePrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
  
  return Math.floor(basePrice * conditionInfo.priceModifier);
}

// Generate publication year
function generatePublicationYear(): number {
  const currentYear = new Date().getFullYear();
  const minYear = 1990;
  
  // 60% chance for recent books (last 10 years), 40% chance for older books
  if (Math.random() < 0.6) {
    return Math.floor(Math.random() * 10) + (currentYear - 10);
  }
  
  return Math.floor(Math.random() * (currentYear - minYear)) + minYear;
}

// Generate page count based on category
function generatePageCount(categoryKey: string): number {
  const ranges: Record<BookCategoryKey, [number, number]> = {
    'thieu-nhi': [50, 200],
    'sach-giao-khoa': [100, 300],
    'van-hoc-viet-nam': [150, 500],
    'tam-ly-ky-nang-song': [200, 400],
    'kinh-te-quan-ly': [250, 600],
    'khoa-hoc-cong-nghe': [300, 800],
    'lich-su-dia-ly': [200, 500],
    'ngoai-ngu': [150, 400]
  };
  
  const [min, max] = ranges[categoryKey as BookCategoryKey] || [200, 400];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate book description
function generateBookDescription(title: string, author: string, categoryKey: string): string {
  const category = VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey];
  const descriptions = [
    `"${title}" là tác phẩm nổi bật của ${author}, mang đến những kiến thức sâu sắc về ${category.name.toLowerCase()}.`,
    `Cuốn sách "${title}" của tác giả ${author} được đánh giá cao trong lĩnh vực ${category.name.toLowerCase()}.`,
    `${author} đã tạo nên một tác phẩm đặc sắc với "${title}", phù hợp cho những ai yêu thích ${category.name.toLowerCase()}.`,
    `"${title}" - một trong những cuốn sách hay nhất về ${category.name.toLowerCase()} do ${author} viết.`,
    `Tác phẩm "${title}" của ${author} là tài liệu tham khảo quý giá cho ${category.name.toLowerCase()}.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// ==================== API ENDPOINTS ====================

// Generate books for specific seller
router.post('/generate', async (req, res) => {
  try {
    const {
      sellerId,
      amount = 1000,
      categories: selectedCategories,
      forceGenerate = false
    } = req.body;

    // Validate seller exists
    if (sellerId) {
      const seller = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.id, sellerId))
        .limit(1);

      if (!seller.length) {
        return res.status(404).json({ error: 'Seller not found' });
      }
    }

    // Determine which sellers to generate for
    let targetSellers;
    if (sellerId) {
      targetSellers = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.id, sellerId));
    } else {
      targetSellers = await db
        .select()
        .from(bookSellers)
        .orderBy(desc(bookSellers.createdAt));
    }

    if (!targetSellers.length) {
      return res.status(404).json({ error: 'No sellers found' });
    }

    // Determine categories to generate
    const categoriesToUse = selectedCategories || Object.keys(VIETNAMESE_BOOK_CATEGORIES);
    
    const results = [];
    const totalBooksToGenerate = targetSellers.length * amount;
    let booksGenerated = 0;

    for (const seller of targetSellers) {
      // Check if seller already has books (unless force generate)
      if (!forceGenerate) {
        const existingBooks = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bookSellerInventory)
          .where(eq(bookSellerInventory.sellerId, seller.id));

        if (existingBooks[0]?.count > 0) {
          results.push({
            sellerId: seller.id,
            sellerName: seller.displayName,
            status: 'skipped',
            reason: 'Seller already has books. Use forceGenerate=true to override.',
            existingBooks: existingBooks[0].count
          });
          continue;
        }
      }

      // Generate books for this seller
      const booksForSeller = [];
      
      for (let i = 0; i < amount; i++) {
        const categoryKey = categoriesToUse[Math.floor(Math.random() * categoriesToUse.length)];
        const condition = Object.keys(BOOK_CONDITIONS)[Math.floor(Math.random() * Object.keys(BOOK_CONDITIONS).length)];
        
        const isbn = generateISBN13();
        const title = generateVietnameseBookTitle(categoryKey);
        const author = generateAuthorName(categoryKey);
        const publisher = VIETNAMESE_PUBLISHERS[Math.floor(Math.random() * VIETNAMESE_PUBLISHERS.length)];
        const price = generatePrice(categoryKey, condition);
        const publicationYear = generatePublicationYear();
        const pageCount = generatePageCount(categoryKey);
        const stock = Math.floor(Math.random() * 100) + 1;
        const description = generateBookDescription(title, author, categoryKey);

        // Create product entry first
        const productData = {
          name: title,
          description: description,
          price: price.toString(),
          sku: `BOOK-${isbn}`,
          category: VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey].name,
          stock: stock,
          images: [],
          isbn: isbn,
          isActive: true,
          isPromoted: Math.random() < 0.1, // 10% chance promoted
          tags: [categoryKey, condition, 'vietnamese-book']
        };

        const [product] = await db
          .insert(products)
          .values(productData)
          .returning();

        // Create book seller inventory entry
        const costPrice = Math.floor(price * 0.6); // Assume 60% cost ratio
        
        // Log the data we're trying to insert for debugging
        console.log('Attempting to insert inventory data:', {
          sellerId: seller.id,
          productId: product.id,
          stock,
          costPrice,
          price,
          basePrice: costPrice,
          sellerPrice: price,
          calculatedPrice: price
        });
        
        const inventoryData = {
          sellerId: seller.id,
          productId: product.id,
          stock: stock,
          basePrice: costPrice.toString(),
          sellerPrice: price.toString(),
          calculatedPrice: price.toString(),
          assignmentType: 'auto_random' as const,
          totalSold: 0,
          totalRevenue: '0.00'
        };

        const [inventoryItem] = await db
          .insert(bookSellerInventory)
          .values(inventoryData)
          .returning();

        booksForSeller.push({
          isbn,
          title,
          author,
          category: VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey].name,
          price,
          condition,
          stock,
          productId: product.id,
          inventoryId: inventoryItem.id
        });

        booksGenerated++;

        // Progress reporting every 100 books
        if (booksGenerated % 100 === 0) {
          console.log(`Progress: ${booksGenerated}/${totalBooksToGenerate} books generated`);
        }
      }

      // Update seller's book count
      await db
        .update(bookSellers)
        .set({ 
          currentBooks: sql`${bookSellers.currentBooks} + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(bookSellers.id, seller.id));

      results.push({
        sellerId: seller.id,
        sellerName: seller.displayName,
        status: 'success',
        booksGenerated: amount,
        categories: categoriesToUse,
        sampleBooks: booksForSeller.slice(0, 5) // Return first 5 as sample
      });
    }

    res.json({
      success: true,
      message: `Generated ${booksGenerated} books for ${targetSellers.length} seller(s)`,
      totalBooksGenerated: booksGenerated,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating book inventory:', error);
    res.status(500).json({ 
      error: 'Failed to generate book inventory',
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Generate books by category
router.post('/generate/by-category', async (req, res) => {
  try {
    const {
      categoryKey,
      amount = 100,
      sellerId
    } = req.body;

    if (!VIETNAMESE_BOOK_CATEGORIES[categoryKey as BookCategoryKey]) {
      return res.status(400).json({ 
        error: 'Invalid category',
        availableCategories: Object.keys(VIETNAMESE_BOOK_CATEGORIES)
      });
    }

    // Use single category generation
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/book-inventory/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId,
        amount,
        categories: [categoryKey],
        forceGenerate: true
      })
    });

    const result = await response.json();
    res.json(result);

  } catch (error) {
    console.error('Error generating books by category:', error);
    res.status(500).json({ 
      error: 'Failed to generate books by category',
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Get generation statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db
      .select({
        totalBooks: sql<number>`count(*)::int`,
        totalSellers: sql<number>`count(distinct ${bookSellerInventory.sellerId})::int`,
        avgBooksPerSeller: sql<number>`case when count(distinct ${bookSellerInventory.sellerId}) > 0 then round(count(*)::numeric / count(distinct ${bookSellerInventory.sellerId}), 2) else 0 end`,
        totalValue: sql<number>`coalesce(sum(${bookSellerInventory.sellerPrice}), 0)::bigint`
      })
      .from(bookSellerInventory);

    const categoryStats = await db
      .select({
        category: sql<string>`'General'`,
        count: sql<number>`count(*)::int`,
        avgPrice: sql<number>`round(avg(${bookSellerInventory.sellerPrice}), 2)`
      })
      .from(bookSellerInventory);

    const conditionStats = await db
      .select({
        condition: sql<string>`'new'`,
        count: sql<number>`count(*)::int`,
        percentage: sql<number>`100.0`
      })
      .from(bookSellerInventory);

    res.json({
      overview: stats[0] || {
        totalBooks: 0,
        totalSellers: 0,
        avgBooksPerSeller: 0,
        totalValue: 0
      },
      categoryBreakdown: categoryStats,
      conditionBreakdown: conditionStats,
      availableCategories: Object.keys(VIETNAMESE_BOOK_CATEGORIES).map(key => ({
        key,
        name: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].name,
        priceRange: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].priceRange
      }))
    });

  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ error: 'Failed to fetch inventory stats' });
  }
});

// Clear all generated inventory (admin only)
router.delete('/clear', async (req, res) => {
  try {
    const { confirmPassword } = req.body;
    
    // Simple password protection for destructive operation
    if (confirmPassword !== 'CLEAR_ALL_BOOKS_2024') {
      return res.status(403).json({ error: 'Invalid confirmation password' });
    }

    // Get all book products to delete
    const bookProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(sql`${products.isbn} IS NOT NULL`);

    // Delete from bookSellerInventory first
    const deletedInventory = await db
      .delete(bookSellerInventory)
      .returning({ count: sql<number>`1` });

    // Delete book products
    const deletedProducts = await db
      .delete(products)
      .where(sql`${products.isbn} IS NOT NULL`)
      .returning({ count: sql<number>`1` });

    // Reset seller book counts
    await db
      .update(bookSellers)
      .set({ currentBooks: 0, updatedAt: new Date() });

    res.json({
      success: true,
      message: 'All generated book inventory cleared',
      deletedInventory: deletedInventory.length,
      deletedProducts: deletedProducts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error clearing inventory:', error);
    res.status(500).json({ 
      error: 'Failed to clear inventory',
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Get available categories
router.get('/categories', (req, res) => {
  res.json({
    categories: Object.keys(VIETNAMESE_BOOK_CATEGORIES).map(key => ({
      key,
      name: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].name,
      priceRange: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].priceRange,
      sampleAuthors: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].popularAuthors.slice(0, 3),
      sampleTitles: VIETNAMESE_BOOK_CATEGORIES[key as BookCategoryKey].titleTemplates.slice(0, 3)
    }))
  });
});

export default router;
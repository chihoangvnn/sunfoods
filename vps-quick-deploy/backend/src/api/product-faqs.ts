import { Router } from 'express';
import { DatabaseStorage } from '../storage.js';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { products, categories, faqGenerationJobs, faqGenerationResults, productFaqs } from '../../shared/schema.js';
import { createHash } from 'crypto';

const router = Router();
const storage = new DatabaseStorage();

// 🔒 Simple auth middleware for development
const requireAuth = (req: any, res: any, next: any) => {
  // For development, allow all requests
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    next();
    return;
  }
  
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

// POST /api/product-faqs - Create new FAQ
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, question, answer, sortOrder, isActive } = req.body;
    
    if (!productId || !question || !answer) {
      return res.status(400).json({ 
        error: 'Product ID, question, and answer are required' 
      });
    }

    console.log('📝 Creating new FAQ for product:', productId);
    
    // Always use server-calculated sortOrder to prevent collisions
    // Client sortOrder is ignored to ensure consistent ordering
    const maxSortOrder = await storage.getMaxProductFAQSortOrder(productId);
    const serverSortOrder = maxSortOrder + 1;
    
    const newFAQ = await storage.createProductFAQ({
      productId,
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: serverSortOrder,
      isActive: isActive ?? true
    });

    res.status(201).json({
      success: true,
      faq: newFAQ,
      message: 'FAQ created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating FAQ:', error);
    res.status(500).json({ 
      error: 'Failed to create FAQ',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/product-faqs/:id - Update existing FAQ
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, sortOrder, isActive } = req.body;
    
    console.log('✏️ Updating FAQ:', id);
    
    const updateData: any = {};
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedFAQ = await storage.updateProductFAQ(id, updateData);
    
    if (!updatedFAQ) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({
      success: true,
      faq: updatedFAQ,
      message: 'FAQ updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating FAQ:', error);
    res.status(500).json({ 
      error: 'Failed to update FAQ',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/product-faqs/:id - Delete FAQ
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting FAQ:', id);
    
    const success = await storage.deleteProductFAQ(id);
    
    if (!success) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting FAQ:', error);
    res.status(500).json({ 
      error: 'Failed to delete FAQ',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/product-faqs/reorder/:productId - Update FAQ order
router.put('/reorder/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { faqIds } = req.body;
    
    if (!Array.isArray(faqIds)) {
      return res.status(400).json({ error: 'FAQ IDs array is required' });
    }

    console.log('🔄 Reordering FAQs for product:', productId);
    
    const success = await storage.updateProductFAQOrder(productId, faqIds);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update FAQ order' });
    }

    res.json({
      success: true,
      message: 'FAQ order updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating FAQ order:', error);
    res.status(500).json({ 
      error: 'Failed to update FAQ order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/product-faqs/all-for-rasa - Get all FAQs for RASA chatbot sync
router.get('/all-for-rasa', async (req, res) => {
  try {
    console.log('🤖 RASA: Getting all FAQs for chatbot sync');
    
    // Get all active FAQs with product information
    const allFaqs = await db.select({
      faqId: productFAQs.id,
      question: productFAQs.question,
      answer: productFAQs.answer,
      sortOrder: productFAQs.sortOrder,
      productId: productFAQs.productId,
      productName: products.name,
      productSlug: products.slug,
      categoryId: products.categoryId,
      updatedAt: productFAQs.updatedAt,
      createdAt: productFAQs.createdAt
    })
    .from(productFAQs)
    .innerJoin(products, eq(productFAQs.productId, products.id))
    .where(eq(productFAQs.isActive, true))
    .orderBy(productFAQs.updatedAt);
    
    // Format response for RASA
    const rasaData = {
      totalFaqs: allFaqs.length,
      lastUpdated: allFaqs.length > 0 ? allFaqs[allFaqs.length - 1].updatedAt : null,
      faqs: allFaqs.map(faq => ({
        id: faq.faqId,
        question: faq.question.trim(),
        answer: faq.answer.replace(/<[^>]*>/g, '').trim(), // Strip HTML tags for RASA
        productName: faq.productName,
        productSlug: faq.productSlug,
        category: faq.categoryId,
        lastModified: faq.updatedAt
      }))
    };
    
    res.json(rasaData);
  } catch (error) {
    console.error('❌ Error fetching FAQs for RASA:', error);
    res.status(500).json({ 
      error: 'Failed to fetch FAQs for RASA',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/product-faqs/:id - Get single FAQ (for editing)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📖 Getting FAQ:', id);
    
    const faq = await storage.getProductFAQ(id);
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({
      success: true,
      faq
    });
  } catch (error) {
    console.error('❌ Error fetching FAQ:', error);
    res.status(500).json({ 
      error: 'Failed to fetch FAQ',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/product-faqs/autogen/:productId - Generate FAQs using AI  
router.post('/autogen/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { prompt, categoryId } = req.body;
    
    if (!productId || !prompt || !categoryId) {
      return res.status(400).json({ 
        error: 'Product ID, prompt, and category ID are required' 
      });
    }

    console.log('🤖 Starting AI FAQ generation for product:', productId);
    
    // Import Gemini AI (dynamic import for better performance)
    const { GoogleGenAI } = await import('@google/genai');
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        code: 'MISSING_API_KEY'
      });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Get product and category details for context
    const product = await storage.getProduct(productId);
    const category = await storage.getCategory(categoryId);
    
    if (!product || !category) {
      return res.status(404).json({ 
        error: 'Product or category not found' 
      });
    }

    console.log('📝 Generating FAQs with prompt:', prompt);
    console.log('🏷️ Product:', product.name, '| Category:', category.name);

    // Enhanced prompt with structured output request
    const enhancedPrompt = `${prompt}

Vui lòng trả lời theo định dạng JSON chính xác sau:
{
  "faqs": [
    {
      "question": "Câu hỏi ngắn gọn về sản phẩm",
      "answer": "Câu trả lời ngắn gọn đủ ý"
    }
  ]
}

Yêu cầu:
- Tạo ĐÚNG 5 câu hỏi
- Câu hỏi phải ngắn gọn, dễ hiểu
- Câu trả lời phải đầy đủ thông tin nhưng ngắn gọn
- Phù hợp với sản phẩm "${product.name}" thuộc danh mục "${category.name}"
- Sử dụng tiếng Việt tự nhiên`;

    // Call Gemini AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            faqs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["faqs"]
        }
      },
      contents: enhancedPrompt,
    });

    const rawResponse = response.text;
    console.log('🤖 Raw AI response:', rawResponse);

    if (!rawResponse) {
      return res.status(500).json({
        error: 'Empty response from AI',
        code: 'AI_EMPTY_RESPONSE'
      });
    }

    // Parse AI response
    let aiData;
    try {
      aiData = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      return res.status(500).json({
        error: 'Invalid AI response format',
        code: 'AI_PARSE_ERROR',
        rawResponse: rawResponse.substring(0, 500) // First 500 chars for debugging
      });
    }

    // Validate response structure
    if (!aiData.faqs || !Array.isArray(aiData.faqs) || aiData.faqs.length === 0) {
      return res.status(500).json({
        error: 'AI response does not contain valid FAQs',
        code: 'AI_INVALID_STRUCTURE',
        received: aiData
      });
    }

    // Enforce exactly 5 FAQs as per user requirement
    if (aiData.faqs.length !== 5) {
      return res.status(500).json({
        error: `AI generated ${aiData.faqs.length} FAQs but expected exactly 5`,
        code: 'AI_INCORRECT_COUNT',
        expected: 5,
        received: aiData.faqs.length,
        suggestion: 'Please try again or adjust the prompt'
      });
    }

    // Process and validate each FAQ
    const processedFaqs = aiData.faqs.map((faq: any, index: number) => {
      if (!faq.question || !faq.answer) {
        throw new Error(`FAQ ${index + 1} missing question or answer`);
      }
      
      return {
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        order: index + 1,
        confidence: 0.85, // Default confidence for Gemini
        status: 'pending'
      };
    });

    // Create generation job record
    const generationJob = {
      id: crypto.randomUUID(),
      productId,
      categoryId,
      prompt: prompt.trim(),
      aiModel: 'gemini',
      status: 'completed',
      rawResponse: rawResponse,
      processingStartedAt: new Date(),
      processingCompletedAt: new Date(),
      requestedBy: (req.session as any)?.userId || 'anonymous'
    };

    console.log('✅ AI FAQ generation completed successfully');
    console.log('📊 Generated', processedFaqs.length, 'FAQs');

    res.json({
      success: true,
      job: generationJob,
      faqs: processedFaqs,
      product: {
        id: product.id,
        name: product.name
      },
      category: {
        id: category.id,
        name: category.name
      },
      message: `Successfully generated ${processedFaqs.length} FAQs using AI`
    });

  } catch (error) {
    console.error('❌ Error in AI FAQ generation:', error);
    
    // Enhanced error response with more details
    const errorResponse: any = {
      error: 'Failed to generate FAQs with AI',
      code: 'AI_GENERATION_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    // Add specific error context for debugging
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorResponse.code = 'INVALID_API_KEY';
        errorResponse.suggestion = 'Check GEMINI_API_KEY environment variable';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorResponse.code = 'API_QUOTA_EXCEEDED';
        errorResponse.suggestion = 'AI service quota exceeded, try again later';
      } else if (error.message.includes('timeout')) {
        errorResponse.code = 'AI_TIMEOUT';
        errorResponse.suggestion = 'AI service timeout, try with shorter prompt';
      }
    }

    res.status(500).json(errorResponse);
  }
});

// ===========================
// 🚀 BULK AI GENERATION APIs
// ===========================

// POST /api/product-faqs/bulk-autogen - Generate FAQs for multiple products
router.post('/bulk-autogen', requireAuth, async (req, res) => {
  try {
    const { 
      productIds, // Array of product IDs, or "all" for all products
      categoryId, // Optional: filter by category  
      prompt, // Custom prompt or use default
      overwriteExisting = false // Whether to regenerate if FAQs exist
    } = req.body;
    
    if (!productIds) {
      return res.status(400).json({ 
        error: 'Product IDs are required (array of IDs or "all")' 
      });
    }

    console.log('🚀 Starting bulk AI FAQ generation...');
    console.log('📝 Products:', productIds === "all" ? "ALL PRODUCTS" : `${productIds.length} selected`);
    
    // Get products to process
    let targetProducts;
    if (productIds === "all") {
      // Get all active products, optionally filtered by category
      const baseQuery = db.select().from(products).where(eq(products.status, 'active'));
      if (categoryId) {
        targetProducts = await baseQuery.where(eq(products.categoryId, categoryId)).limit(100);
      } else {
        targetProducts = await baseQuery.limit(100);
      }
    } else {
      // Get specific products
      targetProducts = await db.select()
        .from(products)
        .where(inArray(products.id, productIds));
    }

    if (targetProducts.length === 0) {
      return res.status(404).json({ 
        error: 'No products found to process' 
      });
    }

    // Check if FAQs already exist (unless overwrite is enabled)
    if (!overwriteExisting) {
      const existingFaqCounts = await db.select({
        productId: productFAQs.productId,
        count: sql<number>`count(*)::int`
      })
      .from(productFAQs)
      .where(inArray(productFAQs.productId, targetProducts.map(p => p.id)))
      .groupBy(productFAQs.productId);
      
      if (existingFaqCounts.length > 0) {
        const productsWithFaqs = existingFaqCounts.map(p => {
          const product = targetProducts.find(tp => tp.id === p.productId);
          return { id: p.productId, name: product?.name || 'Unknown', faqCount: p.count };
        });
        
        return res.json({
          success: false,
          error: 'Some products already have FAQs',
          code: 'FAQS_EXIST',
          productsWithFaqs,
          suggestion: 'Set overwriteExisting=true to regenerate'
        });
      }
    }

    // Create bulk generation job
    const bulkJobId = createHash('md5').update(`bulk-${Date.now()}-${Math.random()}`).digest('hex');
    const bulkJob = {
      id: bulkJobId,
      type: 'bulk_faq_generation',
      status: 'started',
      totalProducts: targetProducts.length,
      completedProducts: 0,
      failedProducts: 0,
      startedAt: new Date(),
      requestedBy: (req.session as any)?.userId || 'anonymous',
      settings: { prompt, overwriteExisting, categoryId }
    };

    console.log('📊 Created bulk job:', bulkJobId, 'for', targetProducts.length, 'products');

    // Start background processing (don't wait for completion)
    setImmediate(() => processBulkGeneration(bulkJob, targetProducts, prompt));

    // Return job info immediately
    res.status(202).json({
      success: true,
      bulkJob,
      message: `Started bulk FAQ generation for ${targetProducts.length} products`,
      statusUrl: `/api/product-faqs/bulk-status/${bulkJobId}`,
      resultsUrl: `/api/product-faqs/bulk-results/${bulkJobId}`
    });

  } catch (error) {
    console.error('❌ Error in bulk AI FAQ generation:', error);
    res.status(500).json({
      error: 'Failed to start bulk FAQ generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/product-faqs/bulk-status/:jobId - Get bulk generation progress
router.get('/bulk-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job progress from database
    const generationJobs = await db.select()
      .from(faqGenerationJobs)
      .where(sql`${faqGenerationJobs.rawResponse}->>'bulk_job_id' = ${jobId}`)
      .limit(100);

    if (generationJobs.length === 0) {
      return res.status(404).json({ 
        error: 'Bulk job not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    // Calculate progress
    const totalJobs = generationJobs.length;
    const completedJobs = generationJobs.filter(j => j.status === 'completed').length;
    const failedJobs = generationJobs.filter(j => j.status === 'failed').length;
    const inProgressJobs = generationJobs.filter(j => j.status === 'processing').length;

    const progress = {
      jobId,
      status: failedJobs === totalJobs ? 'failed' : 
              completedJobs === totalJobs ? 'completed' : 
              inProgressJobs > 0 ? 'processing' : 'pending',
      totalProducts: totalJobs,
      completedProducts: completedJobs,
      failedProducts: failedJobs,
      inProgressProducts: inProgressJobs,
      progressPercentage: Math.round((completedJobs / totalJobs) * 100),
      estimatedTimeRemaining: inProgressJobs > 0 ? `${inProgressJobs * 30}s` : null,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      progress,
      jobs: generationJobs.map(job => ({
        productId: job.productId,
        status: job.status,
        error: job.error,
        completedAt: job.processingCompletedAt
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching bulk status:', error);
    res.status(500).json({
      error: 'Failed to fetch bulk generation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/product-faqs/bulk-results/:jobId - Get bulk generation results
router.get('/bulk-results/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get all results for this bulk job
    const jobs = await db.select({
      jobId: faqGenerationJobs.id,
      productId: faqGenerationJobs.productId,
      status: faqGenerationJobs.status,
      errorMessage: faqGenerationJobs.error,
      completedAt: faqGenerationJobs.processingCompletedAt,
      results: sql`JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ${faqGenerationResults.id},
          'question', ${faqGenerationResults.question},
          'answer', ${faqGenerationResults.answer},
          'status', ${faqGenerationResults.status}
        )
      )`
    })
    .from(faqGenerationJobs)
    .leftJoin(faqGenerationResults, eq(faqGenerationJobs.id, faqGenerationResults.jobId))
    .where(sql`${faqGenerationJobs.rawResponse}->>'bulk_job_id' = ${jobId}`)
    .groupBy(faqGenerationJobs.id, faqGenerationJobs.productId, 
             faqGenerationJobs.status, faqGenerationJobs.error, 
             faqGenerationJobs.processingCompletedAt);

    if (jobs.length === 0) {
      return res.status(404).json({ 
        error: 'Bulk job results not found' 
      });
    }

    // Get product details
    const productIds = jobs.map(j => j.productId);
    const productsData = await db.select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productsMap = Object.fromEntries(productsData.map(p => [p.id, p]));

    // Format results
    const results = jobs.map(job => ({
      productId: job.productId,
      productName: productsMap[job.productId]?.name || 'Unknown Product',
      status: job.status,
      error: job.errorMessage,
      completedAt: job.completedAt,
      generatedFaqs: job.results || []
    }));

    res.json({
      success: true,
      bulkJobId: jobId,
      totalProducts: results.length,
      completedProducts: results.filter(r => r.status === 'completed').length,
      failedProducts: results.filter(r => r.status === 'failed').length,
      results
    });

  } catch (error) {
    console.error('❌ Error fetching bulk results:', error);
    res.status(500).json({
      error: 'Failed to fetch bulk generation results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===========================
// 🔄 BACKGROUND PROCESSING
// ===========================

// Background job processing function
async function processBulkGeneration(bulkJob: any, products: any[], customPrompt?: string) {
  console.log('🔄 Starting background bulk processing for', products.length, 'products');
  
  try {
    // Import Gemini AI
    const { GoogleGenAI } = await import('@google/genai');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ Gemini API key not configured');
      return;
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Process each product sequentially (to avoid API rate limits)
    for (const product of products) {
      try {
        console.log('🤖 Processing product:', product.name);
        
        // Get category for context
        const category = await storage.getCategory(product.categoryId);
        
        // Use custom prompt or default
        const prompt = customPrompt || 
          `Tạo 5 câu hỏi ngắn gọn về sản phẩm ${product.name} danh mục ${category?.name || 'Tổng hợp'}, và trả lời ngắn gọn đủ ý cho 5 câu hỏi đó`;

        // Call single product generation (reuse existing logic)
        await generateFAQsForProduct(product.id, prompt, category?.id || product.categoryId, bulkJob.id, ai);
        
        console.log('✅ Completed product:', product.name);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('❌ Failed to process product:', product.name, error);
        
        // Record failure in database
        await db.insert(faqGenerationJobs).values({
          id: createHash('md5').update(`job-${Date.now()}-${Math.random()}`).digest('hex'),
          productId: product.id,
          categoryId: product.categoryId,
          prompt: customPrompt || 'Bulk generation failed',
          aiModel: 'gemini',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          rawResponse: JSON.stringify({ 
            bulk_job_id: bulkJob.id,
            error: 'Processing failed'
          }),
          requestedBy: bulkJob.requestedBy
        });
      }
    }
    
    console.log('✅ Bulk processing completed for job:', bulkJob.id);
    
  } catch (error) {
    console.error('❌ Critical error in bulk processing:', error);
  }
}

// Helper function to generate FAQs for single product (extracted from existing logic)
async function generateFAQsForProduct(productId: string, prompt: string, categoryId: string, bulkJobId: string, ai: any) {
  // Get product details
  const product = await storage.getProduct(productId);
  const category = await storage.getCategory(categoryId);
  
  if (!product || !category) {
    throw new Error('Product or category not found');
  }

  // Enhanced prompt with structured output
  const enhancedPrompt = `${prompt}

Vui lòng trả lời theo định dạng JSON chính xác sau:
{
  "faqs": [
    {
      "question": "Câu hỏi ngắn gọn về sản phẩm",
      "answer": "Câu trả lời ngắn gọn đủ ý"
    }
  ]
}

Yêu cầu:
- Tạo ĐÚNG 5 câu hỏi
- Câu hỏi phải ngắn gọn, dễ hiểu
- Câu trả lời phải đầy đủ thông tin nhưng ngắn gọn
- Phù hợp với sản phẩm "${product.name}" thuộc danh mục "${category.name}"
- Sử dụng tiếng Việt tự nhiên`;

  // Call Gemini AI
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          faqs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string" }
              },
              required: ["question", "answer"]
            }
          }
        },
        required: ["faqs"]
      }
    },
    contents: enhancedPrompt,
  });

  const rawResponse = response.text;
  
  if (!rawResponse) {
    throw new Error('Empty response from AI');
  }

  // Parse and validate AI response
  const aiData = JSON.parse(rawResponse);
  
  if (!aiData.faqs || !Array.isArray(aiData.faqs) || aiData.faqs.length !== 5) {
    throw new Error(`AI generated ${aiData.faqs?.length || 0} FAQs but expected exactly 5`);
  }

  // Create generation job record
  const jobId = createHash('md5').update(`job-${Date.now()}-${productId}`).digest('hex');
  await db.insert(faqGenerationJobs).values({
    id: jobId,
    productId,
    categoryId,
    prompt: prompt.trim(),
    aiModel: 'gemini',
    status: 'completed',
    rawResponse: JSON.stringify({ 
      bulk_job_id: bulkJobId,
      ...aiData 
    }),
    processingStartedAt: new Date(),
    processingCompletedAt: new Date(),
    requestedBy: 'bulk_job'
  });

  // Create result records
  const results = aiData.faqs.map((faq: any, index: number) => ({
    id: createHash('md5').update(`result-${jobId}-${index}`).digest('hex'),
    jobId,
    question: faq.question.trim(),
    answer: faq.answer.trim(),
    questionOrder: index + 1,
    status: 'generated' as const
  }));

  await db.insert(faqGenerationResults).values(results);
  
  console.log('✅ Generated', results.length, 'FAQs for product:', product.name);
}

export default router;
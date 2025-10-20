import { GoogleGenAI } from "@google/genai";
import { db } from '../db';
import { productFaqs, faqLibrary } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProductContext {
  id: string;
  name: string;
  description?: string;
  category?: string;
  categoryName?: string;
  ingredients?: string;
  benefits?: string;
  usageInstructions?: string;
  productStory?: string;
}

export interface GeneratedFAQ {
  question: string;
  answer: string;
  priority: 'cao' | 'trung_binh' | 'thap';
  keywords: string[];
  
  // 🔥 Rich FAQ Data
  category?: string;
  subcategory?: string;
  questionVariations?: {
    primary: string;
    alternatives: string[];
    dialects?: {
      north?: string[];
      central?: string[];
      south?: string[];
    };
  };
  channels?: {
    website?: string;
    mobile?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
    };
    voice_assistant?: {
      question_audio?: string;
      answer_audio?: string;
    };
  };
  keywordWeights?: Array<{
    keyword: string;
    weight: number;
  }>;
  tags?: string[];
  automation?: {
    trigger_conditions?: Array<{
      type: 'keyword_match' | 'context_similarity' | 'user_intent';
      threshold: number;
      keywords?: string[];
    }>;
  };
  upsellSuggestions?: {
    related_products?: Array<{
      product_id: string;
      relevance: number;
      display_text?: string;
    }>;
  };
}

export interface FAQGenerationResult {
  success: boolean;
  productId: string;
  generatedFAQs: GeneratedFAQ[];
  totalGenerated: number;
  savedToDatabase: boolean;
  generationTime: number;
  error?: string;
}

export class AIFAQGenerator {
  /**
   * 🤖 Auto-generate FAQs for Vietnamese incense business
   * Analyzes product context and creates relevant Q&A pairs
   */
  async generateProductFAQs(productContext: ProductContext): Promise<FAQGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Starting AI FAQ generation for product: ${productContext.name}`);

      // Generate FAQs using AI
      const generatedFAQs = await this.generateFAQsWithAI(productContext);
      
      // Save to database
      const savedToDatabase = await this.saveFAQsToDatabase(productContext.id, generatedFAQs);
      
      const generationTime = Date.now() - startTime;
      
      console.log(`✅ AI FAQ generation completed in ${generationTime}ms - Generated ${generatedFAQs.length} FAQs`);
      
      return {
        success: true,
        productId: productContext.id,
        generatedFAQs,
        totalGenerated: generatedFAQs.length,
        savedToDatabase,
        generationTime
      };

    } catch (error) {
      console.error('❌ AI FAQ generation failed:', error);
      
      return {
        success: false,
        productId: productContext.id,
        generatedFAQs: [],
        totalGenerated: 0,
        savedToDatabase: false,
        generationTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🧠 Generate FAQs using Gemini AI with Vietnamese business context
   */
  private async generateFAQsWithAI(productContext: ProductContext): Promise<GeneratedFAQ[]> {
    const systemPrompt = `Bạn là chuyên gia tư vấn sản phẩm trầm hương và nến thơm tại Việt Nam.

🏮 VIETNAMESE INCENSE BUSINESS CONTEXT:
- Khách hàng quan tâm: chất lượng, xuất xứ, cách sử dụng, bảo quản
- Văn hóa: tâm linh, phong thủy, thờ cúng tổ tiên
- Mối quan tâm: an toàn, thiên nhiên, authentic experience
- Search intent: "cách dùng", "có tốt không", "bao lâu cháy", "mùi thế nào"

📝 NHIỆM VỤ:
Phân tích sản phẩm "${productContext.name}" và tạo 5-7 câu hỏi FAQ thực tế mà khách hàng Việt Nam thường hỏi.

🎯 CONTENT GUIDELINES (QUAN TRỌNG):
✅ FACTUAL: Chỉ nói về sản phẩm này, không so sánh giá thị trường
✅ CONCISE: Câu trả lời 2-3 câu, ngắn gọn, đủ thông tin
✅ NO EXAGGERATION: Không dùng "siêu", "cực", "tuyệt vời nhất", "rẻ nhất"
✅ REALISTIC: Thông tin có căn cứ, không claims quá lố
✅ PROFESSIONAL: Tông giọng chuyên nghiệp, thân thiện

📋 FAQ CATEGORIES TO COVER:
1. 🏷️ Mùi hương & đặc điểm: "Mùi thế nào? Hương thanh hay nồng?"
2. 🕐 Cách sử dụng: "Dùng như thế nào? Cháy trong bao lâu?"
3. 🌿 Chất lượng & an toàn: "Có an toàn không? Thành phần gì?"
4. 📦 Bảo quản & lưu trữ: "Cất giữ thế nào? Hạn sử dụng?"
5. 🎯 Tác dụng thực tế: "Có tác dụng gì? Dùng khi nào?"

PRODUCT CONTEXT:
- Name: "${productContext.name}"
${productContext.description ? `- Description: "${productContext.description}"` : ''}
${productContext.categoryName ? `- Category: "${productContext.categoryName}"` : ''}
${productContext.ingredients ? `- Ingredients: "${productContext.ingredients}"` : ''}
${productContext.benefits ? `- Benefits: "${productContext.benefits}"` : ''}
${productContext.usageInstructions ? `- Usage: "${productContext.usageInstructions}"` : ''}
${productContext.productStory ? `- Story: "${productContext.productStory}"` : ''}

🔥 RICH FAQ GENERATION:
Tạo FAQ với cấu trúc phong phú bao gồm:
- Question variations (các cách hỏi khác nhau)
- Multi-channel content (web, mobile, social)
- Keyword weights (trọng số từ khóa)
- Automation triggers
- Tags & metadata

Trả về JSON array với format:`;

    const responseSchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
          priority: { 
            type: "string",
            enum: ["cao", "trung_binh", "thap"]
          },
          keywords: {
            type: "array",
            items: { type: "string" }
          },
          // Rich FAQ fields
          category: { type: "string" },
          subcategory: { type: "string" },
          questionVariations: {
            type: "object",
            properties: {
              primary: { type: "string" },
              alternatives: {
                type: "array",
                items: { type: "string" }
              },
              dialects: {
                type: "object",
                properties: {
                  north: { type: "array", items: { type: "string" } },
                  central: { type: "array", items: { type: "string" } },
                  south: { type: "array", items: { type: "string" } }
                }
              }
            }
          },
          channels: {
            type: "object",
            properties: {
              website: { type: "string" },
              mobile: { type: "string" },
              social: {
                type: "object",
                properties: {
                  facebook: { type: "string" },
                  instagram: { type: "string" },
                  tiktok: { type: "string" }
                }
              },
              voice_assistant: {
                type: "object",
                properties: {
                  question_audio: { type: "string" },
                  answer_audio: { type: "string" }
                }
              }
            }
          },
          keywordWeights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                weight: { type: "number" }
              },
              required: ["keyword", "weight"]
            }
          },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          automation: {
            type: "object",
            properties: {
              trigger_conditions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["keyword_match", "context_similarity", "user_intent"] },
                    threshold: { type: "number" },
                    keywords: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        },
        required: ["question", "answer", "priority", "keywords"]
      }
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema
        },
        contents: `
        Hãy tạo 5-7 FAQs RICH DATA cho sản phẩm này theo format sau:

        📋 VÍ DỤ RICH FAQ:
        {
          "question": "Mùi hương nhang trầm như thế nào?",
          "answer": "Nhang trầm có hương thiên nhiên dịu nhẹ, thanh thoát. Lan tỏa đều trong phòng 15-20m² và duy trì 45-60 phút.",
          "priority": "cao",
          "category": "Mùi & hương",
          "subcategory": "Mô tả đặc trưng",
          "questionVariations": {
            "primary": "Mùi hương nhang trầm như thế nào?",
            "alternatives": ["Thơm không?", "Hương thanh hay nồng?", "Mùi ra sao?"],
            "dialects": {
              "north": ["thơm không", "mùi ra sao"],
              "central": ["thơm ko", "mùi làm sao"], 
              "south": ["thơm hông", "mùi ra làm sao"]
            }
          },
          "channels": {
            "website": "Nhang trầm có hương thiên nhiên dịu nhẹ, thanh thoát. Lan tỏa đều trong phòng 15-20m² và duy trì 45-60 phút.",
            "mobile": "Hương dịu nhẹ, lan tỏa 15-20m², duy trì 45-60 phút.",
            "social": {
              "facebook": "🌸 Nhang trầm hương thiên nhiên dịu nhẹ, tạo không gian thư giãn",
              "instagram": "✨ Trầm hương thanh thoát 🌿 #NhangTramHuong",
              "tiktok": "Nhang trầm thơm dịu! Ai dùng rồi đều khen 😊"
            }
          },
          "keywordWeights": [
            {"keyword": "thơm", "weight": 3.0},
            {"keyword": "mùi", "weight": 2.5},
            {"keyword": "hương", "weight": 2.8},
            {"keyword": "dịu", "weight": 2.0}
          ],
          "tags": ["thơm", "mùi", "hương", "dịu nhẹ"],
          "automation": {
            "trigger_conditions": [
              {
                "type": "keyword_match",
                "threshold": 0.8,
                "keywords": ["thơm", "mùi", "hương"]
              }
            ]
          },
          "keywords": ["thơm", "mùi", "hương", "dịu nhẹ"]
        }

        🎯 YÊU CẦU CHI TIẾT:
        1. **Category**: Phân loại chính (Mùi & hương, Cách sử dụng, Bảo quản, Tác dụng)
        2. **Question Variations**: Tối thiểu 3 cách hỏi khác nhau + dialect variations
        3. **Multi-channel Content**: Website (full), Mobile (ngắn), Social (emoji + hashtag)
        4. **Keyword Weights**: Assign trọng số 1.0-3.0 cho từ khóa quan trọng
        5. **Tags**: 3-5 tags chính từ content
        6. **Automation**: Trigger conditions cho keyword matching

        ⚠️ TUÂN THỦ GUIDELINES:
        - FACTUAL: Chỉ nói về sản phẩm, không so sánh giá
        - CONCISE: Answers 2-3 câu, đủ thông tin
        - NO EXAGGERATION: Không "siêu", "cực", "tuyệt vời nhất"
        - PROFESSIONAL: Tông giọng chuyên nghiệp, thân thiện
        `
      });

      const rawJson = response.text;
      
      if (rawJson) {
        try {
          const faqs: GeneratedFAQ[] = JSON.parse(rawJson);
          
          // Validate and clean the results
          const validatedFAQs = faqs
            .filter(faq => faq.question && faq.answer && faq.priority)
            .map(faq => ({
              ...faq,
              question: faq.question.trim(),
              answer: faq.answer.trim(),
              keywords: Array.isArray(faq.keywords) ? faq.keywords.slice(0, 5) : []
            }))
            .slice(0, 10); // Max 10 FAQs

          console.log(`🧠 AI generated ${validatedFAQs.length} FAQs for ${productContext.name}`);
          return validatedFAQs;

        } catch (parseError) {
          console.error('Failed to parse AI FAQ response:', parseError);
          throw new Error('Invalid AI response format');
        }
      } else {
        throw new Error('Empty response from Gemini API');
      }

    } catch (error) {
      console.error('AI FAQ generation failed:', error);
      throw new Error(`Failed to generate FAQs: ${error}`);
    }
  }

  /**
   * 💾 Save generated FAQs to database with Rich FAQ Data
   */
  private async saveFAQsToDatabase(productId: string, faqs: GeneratedFAQ[]): Promise<boolean> {
    try {
      console.log(`💾 Saving ${faqs.length} Rich FAQs to database for product ${productId}`);

      // CRITICAL FIX: Only delete auto-generated FAQs, preserve manual ones
      await db.delete(productFaqs).where(
        and(
          eq(productFaqs.productId, productId),
          eq(productFaqs.isAutoGenerated, true)
        )
      );

      // Save each Rich FAQ directly to product_faqs (no more faq_library dependency)
      for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i];
        
        // Convert priority from Vietnamese to English for database
        const priorityMap = {
          'cao': 'high' as const,
          'trung_binh': 'medium' as const,
          'thap': 'low' as const
        };

        // 🔥 Save Rich FAQ Data directly to product_faqs
        const insertData: any = {
          productId,
          // Legacy fields
          question: faq.question,
          answer: faq.answer,
          sortOrder: i,
          isActive: true,
          isAutoGenerated: true,
          
          // 🚀 New Rich FAQ Fields  
          category: faq.category || null,
          subcategory: faq.subcategory || null,
          questionVariations: faq.questionVariations || {},
          channels: faq.channels || {},
          multimediaContent: {}, // Will be populated by form later
          keywordWeights: faq.keywordWeights || {},
          automation: faq.automation || {},
          upsellSuggestions: {}, // Will be populated by form later
          tags: faq.tags || [],
          relatedQuestionIds: []
        };

        await db.insert(productFaqs).values(insertData);
      }

      console.log(`✅ Successfully saved ${faqs.length} Rich FAQs to database`);
      return true;

    } catch (error) {
      console.error('❌ Failed to save Rich FAQs to database:', error);
      console.error('Error details:', error);
      return false;
    }
  }

  /**
   * 🔄 Check if product needs FAQ regeneration
   */
  async shouldRegenerateFAQs(productId: string): Promise<boolean> {
    try {
      // Check if product has existing auto-generated FAQs
      const existingFAQs = await db
        .select()
        .from(productFaqs)
        .where(eq(productFaqs.productId, productId))
        .limit(1);

      // Generate if no FAQs exist yet
      return existingFAQs.length === 0;

    } catch (error) {
      console.error('Error checking FAQ regeneration status:', error);
      return false;
    }
  }

  /**
   * 🧹 Clean up old auto-generated FAQs
   */
  async cleanupOldFAQs(productId: string): Promise<void> {
    try {
      await db.delete(productFaqs).where(eq(productFaqs.productId, productId));
      console.log(`🧹 Cleaned up old FAQs for product ${productId}`);
    } catch (error) {
      console.error('Error cleaning up old FAQs:', error);
    }
  }
}

// Export singleton instance
export const aiFAQGenerator = new AIFAQGenerator();
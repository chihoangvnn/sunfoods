import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export interface GenerateProductContentParams {
  productName?: string;
  description?: string;
  category?: string;
  keywords?: string[];
}

export interface GeneratedProductContent {
  name?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  shortDescription?: string;
}

export async function generateProductContent(
  params: GenerateProductContentParams,
  contentType: 'name' | 'description' | 'seo' | 'all' = 'all'
): Promise<GeneratedProductContent> {
  if (!genAI) {
    throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let prompt = "";
  
  switch (contentType) {
    case 'name':
      prompt = `Generate a catchy Vietnamese product name based on this information:
Category: ${params.category || 'General'}
Current description: ${params.description || 'N/A'}
Keywords: ${params.keywords?.join(', ') || 'N/A'}

Requirements:
- Must be in Vietnamese
- Catchy and memorable
- Short (2-5 words)
- Focus on benefits or uniqueness

Return ONLY the product name, nothing else.`;
      break;

    case 'description':
      prompt = `Generate a compelling Vietnamese product description based on:
Product name: ${params.productName || 'Product'}
Category: ${params.category || 'General'}
Current info: ${params.description || 'N/A'}

Requirements:
- Must be in Vietnamese
- 2-3 paragraphs
- Highlight benefits and features
- Persuasive and engaging tone
- Use bullet points for key features

Return ONLY the description text.`;
      break;

    case 'seo':
      prompt = `Generate SEO-optimized content in Vietnamese for:
Product: ${params.productName || 'Product'}
Description: ${params.description || 'N/A'}
Category: ${params.category || 'General'}

Generate TWO items (separated by "|||"):
1. SEO Title (50-60 characters, include keywords)
2. Meta Description (150-160 characters, compelling with CTA)

Format: SEO_TITLE|||META_DESCRIPTION
Example: Nhang Trầm Hương Cao Cấp - Thanh Lọc Tâm Linh|||Khám phá nhang trầm hương thiên nhiên 100%, giúp thanh lọc không gian, mang lại bình an. Miễn phí ship toàn quốc. Đặt ngay!

Return ONLY in the format above.`;
      break;

    case 'all':
      prompt = `Generate complete Vietnamese e-commerce content based on:
Product: ${params.productName || 'New Product'}
Description: ${params.description || 'N/A'}
Category: ${params.category || 'General'}

Generate ALL of the following (separated by "###"):
1. Product Name (catchy, 2-5 words)
2. Full Description (2-3 paragraphs with benefits)
3. Short Description (1 sentence, max 100 chars)
4. SEO Title (50-60 chars)
5. Meta Description (150-160 chars)

Format:
PRODUCT_NAME###FULL_DESCRIPTION###SHORT_DESCRIPTION###SEO_TITLE###META_DESCRIPTION

Return ONLY in the format above, no additional text.`;
      break;
  }

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  const generated: GeneratedProductContent = {};

  switch (contentType) {
    case 'name':
      generated.name = text;
      break;

    case 'description':
      generated.description = text;
      break;

    case 'seo':
      const [seoTitle, seoDesc] = text.split('|||').map(s => s.trim());
      generated.seoTitle = seoTitle;
      generated.seoDescription = seoDesc;
      break;

    case 'all':
      const [name, desc, shortDesc, title, metaDesc] = text.split('###').map(s => s.trim());
      generated.name = name;
      generated.description = desc;
      generated.shortDescription = shortDesc;
      generated.seoTitle = title;
      generated.seoDescription = metaDesc;
      break;
  }

  return generated;
}

export async function generateProductSuggestions(
  existingData: Partial<GenerateProductContentParams>
): Promise<string[]> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Based on this Vietnamese product:
Name: ${existingData.productName || 'N/A'}
Category: ${existingData.category || 'N/A'}
Description: ${existingData.description || 'N/A'}

Generate 5 creative marketing taglines in Vietnamese (one per line).
Keep each tagline under 50 characters.
Return ONLY the taglines, one per line.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  return text.split('\n').filter(line => line.trim().length > 0);
}

export async function generateProductDescription(
  productName: string,
  category: string,
  industry?: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contextInfo = industry ? `${category} - ${industry}` : category;
  
  const prompt = `Tạo mô tả sản phẩm tiếng Việt chi tiết cho:
Tên sản phẩm: ${productName}
Ngành hàng/Danh mục: ${contextInfo}

Yêu cầu format CHÍNH XÁC:
Giới thiệu:
[Viết 2-3 câu giới thiệu tổng quan về sản phẩm, điểm nổi bật và lợi ích chính]

Tính năng:
• [Tính năng 1]
• [Tính năng 2]
• [Tính năng 3]
• [Tính năng 4]

Lưu ý:
- Sử dụng tiếng Việt tự nhiên, chuyên nghiệp
- Tập trung vào lợi ích người dùng
- Mỗi tính năng ngắn gọn, súc tích (1 dòng)
- Phù hợp với ngành ${contextInfo}
- KHÔNG dùng markdown bold (**), chỉ dùng text thuần

Chỉ trả về nội dung mô tả theo format trên, không thêm gì khác.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateSEOContent(
  productName: string,
  category: string,
  industry?: string
): Promise<{ title: string; description: string }> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contextInfo = industry ? `${category} - ${industry}` : category;

  const prompt = `Tạo nội dung SEO tiếng Việt cho sản phẩm:
Tên: ${productName}
Ngành hàng: ${contextInfo}

Yêu cầu:
1. SEO Title: 50-60 ký tự, có từ khóa chính, hấp dẫn
2. SEO Description: 150-160 ký tự, có CTA, thu hút click

Format trả về: TITLE|||DESCRIPTION
Ví dụ: Nhang Trầm Hương Cao Cấp - Thanh Lọc Tâm Linh|||Khám phá nhang trầm hương thiên nhiên 100%, giúp thanh lọc không gian, mang lại bình an. Miễn phí ship toàn quốc. Đặt ngay!

Chỉ trả về theo format trên, không thêm text khác.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  const [title, description] = text.split('|||').map(s => s.trim());
  
  return {
    title: title || '',
    description: description || ''
  };
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export async function generateProductFAQs(
  productName: string,
  description: string,
  category: string,
  industry?: string
): Promise<ProductFAQ[]> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contextInfo = industry ? `${category} - ${industry}` : category;

  const prompt = `Tạo 7 câu hỏi thường gặp (FAQ) tiếng Việt cho sản phẩm:
Tên sản phẩm: ${productName}
Mô tả: ${description || 'Chưa có mô tả'}
Ngành hàng: ${contextInfo}

Yêu cầu:
- Tạo CHÍNH XÁC 7 cặp câu hỏi - trả lời
- Câu hỏi ngắn gọn, dễ hiểu (10-20 từ)
- Câu trả lời chi tiết, hữu ích (30-60 từ)
- Bao gồm các chủ đề: Đặc điểm sản phẩm, Cách sử dụng, Bảo quản, Vận chuyển, Giá cả, Chính sách đổi trả, Liên hệ
- Tiếng Việt tự nhiên, phù hợp với khách hàng

Format trả về (mỗi FAQ trên 1 dòng):
Q1|||A1
Q2|||A2
Q3|||A3
Q4|||A4
Q5|||A5
Q6|||A6
Q7|||A7

Ví dụ:
Sản phẩm này có nguồn gốc từ đâu?|||Sản phẩm được nhập khẩu chính hãng từ Nhật Bản, có đầy đủ giấy tờ chứng nhận chất lượng và nguồn gốc xuất xứ rõ ràng.
Làm thế nào để sử dụng hiệu quả?|||Bạn chỉ cần rửa sạch, cắt nhỏ và chế biến theo công thức yêu thích. Nên bảo quản trong ngăn mát tủ lạnh để giữ được độ tươi lâu nhất.

Chỉ trả về 7 dòng theo format trên, không thêm text khác.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  const faqs: ProductFAQ[] = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines) {
    const [question, answer] = line.split('|||').map(s => s.trim());
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }
  
  return faqs;
}

export async function generateProductTags(
  productName: string,
  category: string,
  industry?: string
): Promise<string[]> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const contextInfo = industry ? `${category} - ${industry}` : category;

  const prompt = `Tạo danh sách tags/keywords tiếng Việt cho sản phẩm:
Tên sản phẩm: ${productName}
Ngành hàng: ${contextInfo}

Yêu cầu:
- Tạo 8-12 tags liên quan
- Mỗi tag ngắn gọn (1-3 từ)
- Bao gồm: tên sản phẩm, ngành hàng, đặc điểm, lợi ích, từ khóa SEO
- Tiếng Việt không dấu và có dấu
- Phân tách bằng dấu phay

Ví dụ: nhang trầm, trầm hương, incense, sản phẩm thiên nhiên, thư giãn, meditation, Việt Nam, cao cấp, organic

Chỉ trả về danh sách tags, không thêm text khác.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  return text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

export interface BasicInfoContent {
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

export async function generateBasicInfo(
  productName: string,
  category: string,
  industry?: string
): Promise<BasicInfoContent> {
  if (!genAI) {
    throw new Error("Gemini API key not configured.");
  }

  const [description, seoContent, tags] = await Promise.all([
    generateProductDescription(productName, category, industry),
    generateSEOContent(productName, category, industry),
    generateProductTags(productName, category, industry)
  ]);

  const lines = description.split('\n').filter(line => line.trim().length > 0);
  const shortDescription = lines.find(line => 
    !line.includes(':') && 
    !line.startsWith('•') && 
    line.length > 30
  )?.substring(0, 200) || lines[1]?.substring(0, 200) || description.substring(0, 200);

  return {
    description,
    shortDescription,
    seoTitle: seoContent.title,
    seoDescription: seoContent.description,
    tags
  };
}

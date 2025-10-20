/**
 * 🎯 APPROACH 2: DYNAMIC PRODUCT FIELDS
 * Central Product Description Service - System-wide Integration
 * Serves Admin Panel, Storefront, RASA Chatbot, Social Media, SEO
 */

// @ts-nocheck
import { db } from '../db';
import { products, customDescriptionTemplates } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Local types to align with current usage
type CustomDescriptionField = {
  key: string;
  value: string | string[];
  category?: string;
  priority?: 'high' | 'medium' | 'low' | string | number;
  type?: string;
  contexts?: string[];
  displayOrder?: number;
};

type CustomDescriptionData = {
  version?: number;
  fields: Record<string, Omit<CustomDescriptionField, 'key'>> | { [key: string]: any };
};

type FieldCategory = string;

type CustomDescriptionTemplate = {
  templateName: string;
  fieldTemplate: Record<string, any>;
};

export interface DisplayDescriptionsOptions {
  context: 'mobile' | 'desktop' | 'admin';
  category?: FieldCategory;
  includeEmpty?: boolean;
}

export interface ConsultationDescriptionsOptions {
  intent: string;
  category?: FieldCategory;
  priority?: 'high' | 'medium' | 'low';
}

export interface SocialDescriptionsOptions {
  platform: 'facebook' | 'instagram' | 'tiktok';
  format: 'post' | 'story' | 'reel';
  maxLength?: number;
}

export interface SEODescriptionsOptions {
  type: 'meta_description' | 'schema_markup' | 'keywords';
  maxLength?: number;
}

/**
 * Central Product Description Service
 * Unified API for all system components
 */
export class ProductDescriptionService {
  
  /**
   * Get raw custom descriptions for a product
   */
  async getRawDescriptions(productId: string): Promise<CustomDescriptionData | null> {
    try {
      const product = await db.select({
        customDescriptions: products.customDescriptions
      }).from(products)
        .where(eq(products.id, productId))
        .limit(1);

      const data = product[0]?.customDescriptions;
      if (!data) return null;
      const fields = (data as any).fields ?? {};
      return { version: (data as any).version ?? 1, fields } as CustomDescriptionData;
    } catch (error) {
      console.error('Error fetching raw descriptions:', error);
      return null;
    }
  }

  /**
   * 📱 STOREFRONT: Get descriptions optimized for display
   */
  async getDisplayDescriptions(
    productId: string, 
    options: DisplayDescriptionsOptions = { context: 'mobile' }
  ): Promise<{ [category: string]: CustomDescriptionField[] }> {
    try {
      const rawData = await this.getRawDescriptions(productId);
      if (!rawData?.fields) return {};

      const fields = Object.entries(rawData.fields as Record<string, any>)
        .map(([key, field]) => ({ ...(typeof field === 'object' && field ? field : {}), key }))
        .filter(field => {
          // Filter by category if specified
          if (options.category && field.category !== options.category) return false;
          
          // Filter by context
          if (field.contexts && !field.contexts.includes('storefront')) return false;
          
          // Filter empty values unless includeEmpty is true
          if (!options.includeEmpty && this.isEmpty(field.value)) return false;
          
          return true;
        })
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      // Group by category
      return this.groupByCategory(fields);
    } catch (error) {
      console.error('Error fetching display descriptions:', error);
      return {};
    }
  }

  /**
   * 🤖 RASA CHATBOT: Get descriptions for consultation
   */
  async getConsultationDescriptions(
    productId: string, 
    options: ConsultationDescriptionsOptions
  ): Promise<CustomDescriptionField[]> {
    try {
      const rawData = await this.getRawDescriptions(productId);
      if (!rawData?.fields) return [];

      return Object.values(rawData.fields as Record<string, any>)
        .filter((field: any) => {
          // Must support chatbot context
          if (field.contexts && !field.contexts.includes('chatbot')) return false;
          
          // Filter by category for intent-based recommendations
          if (options.category && field.category !== options.category) return false;
          
          // 🎯 FIXED: Only filter by priority if explicitly specified
          // For Vietnamese incense, include ALL priorities (high, medium, low) by default
          if (options.priority !== undefined && field.priority !== options.priority) return false;
          
          return !this.isEmpty(field.value);
        })
        .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    } catch (error) {
      console.error('Error fetching consultation descriptions:', error);
      return [];
    }
  }

  /**
   * 📱 SOCIAL MEDIA: Generate content for platforms
   */
  async getSocialDescriptions(
    productId: string, 
    options: SocialDescriptionsOptions
  ): Promise<string> {
    try {
      const rawData = await this.getRawDescriptions(productId);
      if (!rawData?.fields) return '';

      const socialFields = Object.values(rawData.fields as Record<string, any>)
        .filter((field: any) => {
          if (field.contexts && !field.contexts.includes('social')) return false;
          if (field.category === 'sales') return true; // Always include sales points
          if (field.category === 'spiritual' && options.platform === 'facebook') return true;
          if (field.category === 'main' && field.priority === 'high') return true;
          return false;
        })
        .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      return this.formatForSocial(socialFields, options);
    } catch (error) {
      console.error('Error fetching social descriptions:', error);
      return '';
    }
  }

  /**
   * 🔍 SEO: Generate SEO-optimized content
   */
  async getSEODescriptions(
    productId: string, 
    options: SEODescriptionsOptions
  ): Promise<string> {
    try {
      const rawData = await this.getRawDescriptions(productId);
      if (!rawData?.fields) return '';

      const seoFields = Object.values(rawData.fields as Record<string, any>)
        .filter((field: any) => {
          if (field.contexts && !field.contexts.includes('seo')) return false;
          if (field.type === 'rich_text' || field.type === 'textarea') return true;
          return false;
        })
        .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      return this.formatForSEO(seoFields, options);
    } catch (error) {
      console.error('Error fetching SEO descriptions:', error);
      return '';
    }
  }

  /**
   * 👨‍💼 ADMIN: Get editable descriptions with templates
   */
  async getEditableDescriptions(productId: string): Promise<{
    current: CustomDescriptionData;
    templates: CustomDescriptionTemplate[];
  }> {
    try {
      const [current, templates] = await Promise.all([
        this.getRawDescriptions(productId),
        this.getAvailableTemplates()
      ]);

      return {
        current: current || { version: 1, fields: {} },
        templates
      };
    } catch (error) {
      console.error('Error fetching editable descriptions:', error);
      return {
        current: { version: 1, fields: {} },
        templates: []
      };
    }
  }

  /**
   * Update custom descriptions for a product
   */
  async updateDescriptions(productId: string, data: CustomDescriptionData): Promise<boolean> {
    try {
      await db.update(products)
        .set({ customDescriptions: data })
        .where(eq(products.id, productId));
      
      return true;
    } catch (error) {
      console.error('Error updating descriptions:', error);
      return false;
    }
  }

  /**
   * Get available templates for categories
   */
  private async getAvailableTemplates(): Promise<CustomDescriptionTemplate[]> {
    try {
      const templates = await db.select()
        .from(customDescriptionTemplates)
        .where(eq(customDescriptionTemplates.isActive, true));

      return (templates as any[]).map((t: any) => ({
        templateName: t.templateName,
        fieldTemplate: t.fieldTemplate || {}
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  /**
   * Helper: Check if value is empty
   */
  private isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) return value.length === 0;
    return !value || value.trim() === '';
  }

  /**
   * Helper: Group fields by category
   */
  private groupByCategory(fields: (CustomDescriptionField & { key: string })[]): { [category: string]: CustomDescriptionField[] } {
    return fields.reduce((acc, field) => {
      const cat = (field.category ?? 'general') as string;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(field);
      return acc;
    }, {} as { [category: string]: CustomDescriptionField[] });
  }

  /**
   * Helper: Format content for social media
   */
  private formatForSocial(fields: CustomDescriptionField[], options: SocialDescriptionsOptions): string {
    let content = '';
    
    fields.forEach(field => {
      if (Array.isArray(field.value)) {
        content += field.value.join(' • ') + '\n';
      } else {
        content += field.value + '\n';
      }
    });

    // Apply platform-specific formatting
    if (options.platform === 'instagram') {
      content += '\n#nhang #nhangsach #thiền #vietnam';
    } else if (options.platform === 'facebook') {
      content = '🔥 ' + content;
    }

    // Trim to max length if specified
    if (options.maxLength && content.length > options.maxLength) {
      content = content.substring(0, options.maxLength - 3) + '...';
    }

    return content.trim();
  }

  /**
   * Helper: Format content for SEO
   */
  private formatForSEO(fields: CustomDescriptionField[], options: SEODescriptionsOptions): string {
    if (options.type === 'meta_description') {
      const mainText = fields
        .filter(f => f.category === 'main' || f.category === 'cultural')
        .map(f => Array.isArray(f.value) ? f.value.join(', ') : f.value)
        .join('. ');
      
      return mainText.substring(0, options.maxLength || 160);
    }

    return fields
      .map(f => Array.isArray(f.value) ? f.value.join(' ') : f.value)
      .join(' ');
  }
}

// Export singleton instance
export const productDescriptionService = new ProductDescriptionService();
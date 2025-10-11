import { db } from '../db';
import { bookPricingRules, bookSellers, bookSellerInventory, products } from '../../shared/schema';
import { eq, and, or, sql, desc } from 'drizzle-orm';
import type { BookPricingRule, BookSeller, Product } from '../../shared/schema';

// Pricing automation engine for 20+ virtual book sellers
export class BookPricingAutomationEngine {
  
  /**
   * Apply pricing rules to a product for all active sellers
   * @param productId Product to price
   * @param basePrice Original product price
   * @returns Map of seller ID to calculated price
   */
  async calculatePricesForAllSellers(productId: string, basePrice: number): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    
    // Get product details for rule evaluation
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    
    // Get all active book sellers
    const activeSellers = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.isActive, true))
      .orderBy(bookSellers.tier);
    
    // Get applicable pricing rules
    const applicableRules = await this.getApplicablePricingRules(product);
    
    // Calculate price for each seller
    for (const seller of activeSellers) {
      const calculatedPrice = await this.calculatePriceForSeller(
        seller, 
        product, 
        basePrice, 
        applicableRules
      );
      results.set(seller.id, calculatedPrice);
    }
    
    return results;
  }
  
  /**
   * Calculate price for a specific seller based on their tier and rules
   */
  private async calculatePriceForSeller(
    seller: BookSeller, 
    product: Product, 
    basePrice: number, 
    rules: BookPricingRule[]
  ): Promise<number> {
    let finalPrice = basePrice;
    
    // Apply seller tier-based pricing
    if (seller.pricingTier === 'standard_price') {
      // Standard sellers use automated pricing rules
      finalPrice = this.applyPricingRules(basePrice, product, rules);
    } else if (seller.pricingTier === 'markup_price') {
      // Custom sellers may have specific inventory pricing
      const customPrice = await this.getSellerCustomPrice(seller.id, product.id);
      if (customPrice) {
        finalPrice = customPrice;
      } else {
        // Fallback to rules if no custom price set
        finalPrice = this.applyPricingRules(basePrice, product, rules);
      }
    }
    
    // Apply any additional seller-specific adjustments
    // Note: globalPriceMultiplier not in current schema, can be added later
    // if (seller.globalPriceMultiplier && seller.globalPriceMultiplier !== 1.0) {
    //   finalPrice = finalPrice * seller.globalPriceMultiplier;
    // }
    
    // Ensure minimum profit margins
    const minPrice = basePrice * 0.7; // 30% minimum discount
    const maxPrice = basePrice * 1.5; // 50% maximum markup
    
    return Math.max(minPrice, Math.min(maxPrice, finalPrice));
  }
  
  /**
   * Get pricing rules applicable to a specific product
   */
  private async getApplicablePricingRules(product: Product): Promise<BookPricingRule[]> {
    // Get all active pricing rules
    const allRules = await db
      .select()
      .from(bookPricingRules)
      .where(eq(bookPricingRules.isActive, true))
      .orderBy(desc(bookPricingRules.priority));
    
    return allRules.filter(rule => this.isRuleApplicable(rule, product));
  }
  
  /**
   * Check if a pricing rule applies to a specific product
   */
  private isRuleApplicable(rule: BookPricingRule, product: Product): boolean {
    const conditions = rule.conditions as any || {};
    
    // Check category match (null category = applies to all)
    if (rule.categoryId && rule.categoryId !== product.categoryId) {
      return false;
    }
    
    // Check ISBN pattern
    if (conditions.isbn_pattern && product.isbn) {
      const pattern = new RegExp(conditions.isbn_pattern);
      if (!pattern.test(product.isbn)) {
        return false;
      }
    }
    
    // Check price range
    if (conditions.price_range) {
      const price = parseFloat(product.price);
      if (price < conditions.price_range.min || price > conditions.price_range.max) {
        return false;
      }
    }
    
    // Check stock threshold
    if (conditions.stock_threshold && product.stock < conditions.stock_threshold) {
      return false;
    }
    
    // Check tags (if product has tag system)
    if (conditions.tags && product.tagIds) {
      const productTags = Array.isArray(product.tagIds) ? product.tagIds : [];
      const hasMatchingTag = conditions.tags.some((tag: string) => productTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate prices for test product (without database lookup)
   */
  async calculatePricesForTestProduct(testProduct: any, basePrice: number): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    
    try {
      // Get all active book sellers
      const activeSellers = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.isActive, true))
        .orderBy(bookSellers.tier);
      
      // Get applicable pricing rules (using test product)
      const applicableRules = await this.getApplicablePricingRules(testProduct);
      
      // Calculate price for each seller
      for (const seller of activeSellers) {
        const calculatedPrice = await this.calculatePriceForSeller(
          seller, 
          testProduct, 
          basePrice, 
          applicableRules
        );
        results.set(seller.id, calculatedPrice);
      }
      
    } catch (error) {
      console.error('Error calculating prices for test product:', error);
    }
    
    return results;
  }

  /**
   * Apply pricing rules to calculate adjusted price
   */
  private applyPricingRules(basePrice: number, product: Product, rules: BookPricingRule[]): number {
    let adjustedPrice = basePrice;
    
    for (const rule of rules) {
      const adjustment = rule.priceAdjustment as any || {};
      
      if (adjustment.type === 'fixed_discount') {
        adjustedPrice -= adjustment.amount;
      } else if (adjustment.type === 'fixed_markup') {
        adjustedPrice += adjustment.amount;
      } else if (adjustment.type === 'percentage_discount') {
        adjustedPrice = adjustedPrice * (1 - adjustment.percentage / 100);
      } else if (adjustment.type === 'percentage_markup') {
        adjustedPrice = adjustedPrice * (1 + adjustment.percentage / 100);
      } else if (adjustment.type === 'set_price') {
        adjustedPrice = adjustment.price;
      }
      
      // Apply only the first matching rule (highest priority)
      if (adjustment.stop_on_match) {
        break;
      }
    }
    
    return Math.max(0, adjustedPrice);
  }
  
  /**
   * Get custom price for a seller's specific product inventory
   */
  private async getSellerCustomPrice(sellerId: string, productId: string): Promise<number | null> {
    try {
      const [inventory] = await db
        .select()
        .from(bookSellerInventory)
        .where(and(
          eq(bookSellerInventory.sellerId, sellerId),
          eq(bookSellerInventory.productId, productId)
        ));
      
      return inventory?.sellerPrice ? parseFloat(inventory.sellerPrice) : null;
    } catch (error) {
      console.error('Error getting seller custom price:', error);
      return null;
    }
  }
  
  /**
   * Update pricing for all sellers when a product changes
   */
  async updatePricingForProduct(productId: string): Promise<void> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      throw new Error(`Product ${productId} not found for pricing update`);
    }
      
      const basePrice = parseFloat(product.price);
      const sellerPrices = await this.calculatePricesForAllSellers(productId, basePrice);
      
      // Update or create seller inventory records with calculated prices
      for (const [sellerId, calculatedPrice] of Array.from(sellerPrices.entries())) {
        await this.updateSellerInventoryPrice(sellerId, productId, calculatedPrice);
      }
      
      console.log(`Updated pricing for product ${productId} across ${sellerPrices.size} sellers`);
  }
  
  /**
   * Update seller inventory with calculated price
   */
  private async updateSellerInventoryPrice(sellerId: string, productId: string, price: number): Promise<void> {
    try {
      // Try to update existing inventory record
      const [existingRecord] = await db
        .select()
        .from(bookSellerInventory)
        .where(and(
          eq(bookSellerInventory.sellerId, sellerId),
          eq(bookSellerInventory.productId, productId)
        ));
      
      if (existingRecord) {
        // Update existing record
        await db
          .update(bookSellerInventory)
          .set({
            calculatedPrice: price.toFixed(2),
            updatedAt: new Date()
          })
          .where(eq(bookSellerInventory.id, existingRecord.id));
      } else {
        // Create new inventory record
        await db
          .insert(bookSellerInventory)
          .values({
            sellerId,
            productId,
            basePrice: price.toFixed(2),
            sellerPrice: price.toFixed(2),
            calculatedPrice: price.toFixed(2),
            stock: 100 // Default stock for new products
          });
      }
    } catch (error) {
      console.error('Error updating seller inventory price:', error);
    }
  }
  
  /**
   * Get pricing summary for all sellers
   */
  async getPricingSummary() {
    try {
      const summary = await db
        .select({
          sellerId: bookSellers.id,
          sellerName: bookSellers.displayName,
          tier: bookSellers.pricingTier,
          totalProducts: sql<number>`count(${bookSellerInventory.id})::int`,
          avgPrice: sql<number>`avg(${bookSellerInventory.calculatedPrice}::numeric)::numeric`,
          minPrice: sql<number>`min(${bookSellerInventory.calculatedPrice}::numeric)::numeric`,
          maxPrice: sql<number>`max(${bookSellerInventory.calculatedPrice}::numeric)::numeric`
        })
        .from(bookSellers)
        .leftJoin(bookSellerInventory, eq(bookSellers.id, bookSellerInventory.sellerId))
        .where(eq(bookSellers.isActive, true))
        .groupBy(bookSellers.id, bookSellers.displayName, bookSellers.pricingTier);
      
      return summary;
    } catch (error) {
      console.error('Error getting pricing summary:', error);
      return [];
    }
  }
}

// Export singleton instance
export const pricingEngine = new BookPricingAutomationEngine();
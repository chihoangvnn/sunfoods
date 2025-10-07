import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

const QUANTITY_PRECISION = 100;
const PRICE_PRECISION = 100;

export const CartManager = {
  toIntegerQuantity(quantity: number): number {
    return Math.round(quantity * QUANTITY_PRECISION);
  },

  fromIntegerQuantity(intQuantity: number): number {
    return intQuantity / QUANTITY_PRECISION;
  },

  toIntegerPrice(price: string | number): number {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return Math.round(numPrice * PRICE_PRECISION);
  },

  fromIntegerPrice(intPrice: number): number {
    return intPrice / PRICE_PRECISION;
  },

  validateQuantity(quantity: number): { valid: boolean; error?: string } {
    if (isNaN(quantity)) {
      return { valid: false, error: 'Số lượng không hợp lệ' };
    }

    if (quantity < 0.01) {
      return { valid: false, error: 'Số lượng tối thiểu là 0.01' };
    }

    if (quantity > 999999.99) {
      return { valid: false, error: 'Số lượng tối đa là 999,999.99' };
    }

    const decimalPart = quantity.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      return { valid: false, error: 'Số lượng chỉ cho phép 2 chữ số thập phân' };
    }

    return { valid: true };
  },

  normalizeQuantity(quantity: number): number {
    return Math.round(quantity * 100) / 100;
  },

  calculateItemTotal(price: string | number, quantity: number): number {
    const intPrice = this.toIntegerPrice(price);
    const intQuantity = this.toIntegerQuantity(quantity);
    
    const totalCents = Math.round((intPrice * intQuantity) / QUANTITY_PRECISION);
    return this.fromIntegerPrice(totalCents);
  },

  calculateCartTotal(items: CartItem[]): number {
    const totalCents = items.reduce((sum, item) => {
      const intPrice = this.toIntegerPrice(item.product.price);
      const intQuantity = this.toIntegerQuantity(item.quantity);
      const itemTotalCents = Math.round((intPrice * intQuantity) / QUANTITY_PRECISION);
      return sum + itemTotalCents;
    }, 0);

    return this.fromIntegerPrice(totalCents);
  },

  calculateCartItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },

  addToCart(
    cart: CartItem[],
    product: Product,
    quantity: number
  ): { cart: CartItem[]; error?: string } {
    const validation = this.validateQuantity(quantity);
    if (!validation.valid) {
      return { cart, error: validation.error };
    }

    const normalizedQty = this.normalizeQuantity(quantity);
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex !== -1) {
      const newCart = [...cart];
      const newQuantity = newCart[existingIndex].quantity + normalizedQty;
      
      const qtyValidation = this.validateQuantity(newQuantity);
      if (!qtyValidation.valid) {
        return { cart, error: qtyValidation.error };
      }

      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: this.normalizeQuantity(newQuantity)
      };
      return { cart: newCart };
    }

    return {
      cart: [...cart, { product, quantity: normalizedQty }]
    };
  },

  updateQuantity(
    cart: CartItem[],
    productId: string,
    newQuantity: number
  ): { cart: CartItem[]; error?: string } {
    if (newQuantity <= 0) {
      return {
        cart: cart.filter(item => item.product.id !== productId)
      };
    }

    const validation = this.validateQuantity(newQuantity);
    if (!validation.valid) {
      return { cart, error: validation.error };
    }

    const normalizedQty = this.normalizeQuantity(newQuantity);
    const newCart = cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: normalizedQty }
        : item
    );

    return { cart: newCart };
  },

  removeFromCart(cart: CartItem[], productId: string): CartItem[] {
    return cart.filter(item => item.product.id !== productId);
  },

  clearCart(): CartItem[] {
    return [];
  }
};

export default CartManager;

export type PaymentModel = 'deposit' | 'monthly' | 'upfront' | 'revenue_share';

export interface PaymentModelTerms {
  id: PaymentModel;
  name: string;
  nameVi: string;
  icon: string;
  description: string;
  
  depositRequired?: number;
  creditLimit?: number;
  commissionRate?: number;
  revenueShareVendor?: number;
  revenueShareShop?: number;
  
  settlementPeriod?: string;
  returnPolicy?: string;
  
  requirements: string[];
  benefits: string[];
  
  available: boolean;
  currentlyUsing?: boolean;
}

export interface Vendor {
  id: string;
  shopId: string;
  name: string;
  email: string;
  phone: string;
  warehouseAddress: string;
  depositBalance: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  paymentModel: PaymentModel;
  creditLimit?: number;
  creditUsed?: number;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  productId: string;
  quantity: number;
  
  consignmentPrice?: number;
  discountPercent?: number;
  
  wholesalePrice?: number;
  shopMarkup?: number;
  
  suggestedRetailPrice?: number;
  revenueShareVendor?: number;
  revenueShareShop?: number;
  
  status: 'active' | 'out_of_stock' | 'expired' | 'pending_approval';
  expiryDate?: Date;
}

export interface VendorOrder {
  id: string;
  vendorId: string;
  orderId: string;
  maskedCustomerName: string;
  maskedCustomerPhone: string;
  maskedAddress: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  vendorName: string;
  shippingCarrier: string;
  trackingCode: string;
  shippingLabel: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  codAmount: number;
  depositDeducted: number;
  totalAmount: number;
  orderDate: Date;
  paymentStatus: 'cod' | 'paid' | 'pending';
  notes?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

export interface ConsignmentRequest {
  id: string;
  vendorId: string;
  productName: string;
  quantity: number;
  proposedPrice: number;
  discountPercent: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
}

export interface DepositTransaction {
  id: string;
  vendorId: string;
  type: 'deposit' | 'deduction' | 'refund';
  amount: number;
  orderId?: string;
  description: string;
  createdAt: Date;
}

export interface ReturnRequest {
  id: string;
  vendorId: string;
  productId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
}

export interface VendorReturnRequest {
  id: string;
  orderId: string;
  vendorOrderId: string;
  productId: string;
  productName: string;
  productImage: string;
  maskedCustomer: string;
  reason: 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';
  reasonDetail?: string;
  quantity: number;
  refundAmount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  images?: string[];
  approvedBy?: string;
  rejectedReason?: string;
  rejectedNote?: string;
  processedDate?: string;
  trackingNumber?: string;
  shippingProvider?: 'ghn' | 'ghtk' | 'viettel';
  shippingNote?: string;
  shippingFeePayer?: 'vendor' | 'customer' | 'shop';
}

export function maskCustomerName(name: string): string {
  const parts = name.trim().split(' ');
  
  if (parts.length === 0) return '***';
  if (parts.length === 1) return parts[0].charAt(0) + '**';
  
  const firstName = parts[0];
  const lastParts = parts.slice(1);
  
  const maskedLastParts = lastParts.map(part => {
    if (part.length === 0) return '';
    return part.charAt(0) + '**';
  });
  
  return `${firstName} ${maskedLastParts.join(' ')}`;
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 4) return '***';
  
  const prefix = cleaned.substring(0, 3);
  const suffix = cleaned.substring(cleaned.length - 4);
  
  return `${prefix}***${suffix}`;
}

export function maskAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim());
  
  if (parts.length === 0) return '***';
  if (parts.length === 1) return parts[0];
  
  const firstPart = parts[0];
  
  const maskedParts = parts.slice(1).map(part => {
    const words = part.trim().split(' ');
    if (words.length === 0) return '**';
    
    const prefix = words[0];
    return `${prefix}.**`;
  });
  
  return `${firstPart}, ${maskedParts.join(', ')}`;
}

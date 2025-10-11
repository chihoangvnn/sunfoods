import {
  Vendor,
  VendorProduct,
  VendorOrder,
  ConsignmentRequest,
  DepositTransaction,
  ReturnRequest,
  VendorReturnRequest,
  PaymentModelTerms,
  maskCustomerName,
  maskPhone,
  maskAddress
} from '../types/vendor';

export const paymentModelTerms: PaymentModelTerms[] = [
  {
    id: 'deposit',
    name: 'Consignment + Deposit',
    nameVi: 'Ký gửi có ký quỹ',
    icon: '🏦',
    description: 'Gửi hàng ký gửi với số dư ký quỹ. COD tự động trừ từ ký quỹ.',
    
    depositRequired: 5000000,
    commissionRate: 30,
    settlementPeriod: 'Tức thì (auto-deduct)',
    returnPolicy: 'Hoàn hàng miễn phí khi hết hạn',
    
    requirements: [
      'Ký quỹ tối thiểu 5.000.000đ',
      'Duy trì số dư đủ để trừ COD',
      'Hợp đồng ký gửi 6-12 tháng'
    ],
    benefits: [
      'Không rủi ro nợ',
      'Thanh toán tự động',
      'Hoàn ký quỹ khi kết thúc',
      'Phù hợp vendor nhỏ/mới'
    ],
    available: true,
    currentlyUsing: true
  },
  {
    id: 'monthly',
    name: 'Monthly Settlement',
    nameVi: 'Thanh toán cuối tháng',
    icon: '📅',
    description: 'Không cần ký quỹ. Đối soát và thanh toán định kỳ hàng tháng.',
    
    creditLimit: 20000000,
    commissionRate: 25,
    settlementPeriod: 'Hàng tháng (ngày 5)',
    returnPolicy: 'Hoàn hàng trong 30 ngày',
    
    requirements: [
      'Doanh nghiệp đăng ký hợp pháp',
      'Lịch sử giao dịch tốt ≥3 tháng',
      'Hạn mức công nợ 20.000.000đ',
      'Hóa đơn VAT đầy đủ'
    ],
    benefits: [
      'Không cần ký quỹ',
      'Hạn mức cao',
      'Phí thấp hơn (25%)',
      'Thanh toán chuyển khoản'
    ],
    available: false
  },
  {
    id: 'upfront',
    name: 'Upfront Purchase',
    nameVi: 'Mua đứt bán đoạn',
    icon: '💰',
    description: 'Shop mua hàng trước, vendor nhận tiền ngay. Shop tự chịu rủi ro tồn kho.',
    
    commissionRate: 40,
    settlementPeriod: 'Ngay khi giao hàng',
    returnPolicy: 'Không hoàn hàng',
    
    requirements: [
      'Sản phẩm độc quyền hoặc giá tốt',
      'Số lượng lớn (≥100 units/SKU)',
      'Cam kết không bán kênh khác',
      'Chất lượng ổn định'
    ],
    benefits: [
      'Nhận tiền ngay lập tức',
      'Không theo dõi COD',
      'Không cần quản lý ký quỹ',
      'Phù hợp vendor cần vốn nhanh'
    ],
    available: true
  },
  {
    id: 'revenue_share',
    name: 'Revenue Sharing',
    nameVi: 'Chia doanh thu',
    icon: '🤝',
    description: 'Ký gửi miễn phí, chia % doanh thu khi bán được. Hoàn hàng không bán.',
    
    revenueShareVendor: 70,
    revenueShareShop: 30,
    settlementPeriod: '2 lần/tháng (ngày 10 & 25)',
    returnPolicy: 'Hoàn hàng miễn phí sau 90 ngày',
    
    requirements: [
      'Sản phẩm mới/test thị trường',
      'Giá bán lẻ đề xuất hợp lý',
      'Cam kết hỗ trợ marketing',
      'Cho phép shop chụp ảnh/video'
    ],
    benefits: [
      'Không cần ký quỹ',
      'Không rủi ro tồn kho',
      'Chia lợi nhuận công bằng',
      'Phù hợp sản phẩm mới'
    ],
    available: true
  }
];

export const mockMonthlyStats = {
  creditLimit: 20000000,
  creditUsed: 8500000,
  nextSettlementDate: '05/11/2024'
};

export const mockUpfrontStats = {
  totalPurchased: 15000000,
  totalPaid: 15000000,
  thisMonthPurchases: 5,
  nextPayment: null as { amount: number; dueDate: string } | null
};

export const mockRevenueStats = {
  totalRevenue: 12000000,
  vendorShare: 8400000,
  shopShare: 3600000,
  thisMonthSales: 18
};

export const mockMonthlyInvoices = [
  {
    id: 'INV-2024-10',
    period: 'Tháng 10/2024',
    totalDue: 8500000,
    dueDate: '05/11/2024',
    status: 'pending' as const
  },
  {
    id: 'INV-2024-09',
    period: 'Tháng 9/2024',
    totalDue: 7200000,
    dueDate: '05/10/2024',
    status: 'paid' as const,
    paidDate: '03/10/2024'
  },
  {
    id: 'INV-2024-08',
    period: 'Tháng 8/2024',
    totalDue: 6900000,
    dueDate: '05/09/2024',
    status: 'paid' as const,
    paidDate: '04/09/2024'
  },
  {
    id: 'INV-2024-07',
    period: 'Tháng 7/2024',
    totalDue: 5500000,
    dueDate: '05/08/2024',
    status: 'overdue' as const
  }
];

export const mockMonthlyPayments = [
  {
    id: 'PAY-001',
    paymentDate: '03/10/2024',
    invoiceId: 'INV-2024-09',
    amount: 7200000,
    method: 'Chuyển khoản',
    reference: 'TXN123456'
  },
  {
    id: 'PAY-002',
    paymentDate: '04/09/2024',
    invoiceId: 'INV-2024-08',
    amount: 6900000,
    method: 'Chuyển khoản',
    reference: 'TXN123789'
  },
  {
    id: 'PAY-003',
    paymentDate: '02/08/2024',
    invoiceId: 'INV-2024-07',
    amount: 3000000,
    method: 'Chuyển khoản',
    reference: 'TXN122345'
  }
];

export const mockUpfrontPurchases = [
  {
    id: 'PO-001',
    date: '01/10/2024',
    productsCount: 50,
    totalAmount: 15000000,
    status: 'paid' as const,
    paidDate: '01/10/2024',
    receiptUrl: '#'
  },
  {
    id: 'PO-002',
    date: '15/10/2024',
    productsCount: 30,
    totalAmount: 9000000,
    status: 'pending' as const
  },
  {
    id: 'PO-003',
    date: '20/09/2024',
    productsCount: 75,
    totalAmount: 22500000,
    status: 'paid' as const,
    paidDate: '20/09/2024',
    receiptUrl: '#'
  },
  {
    id: 'PO-004',
    date: '05/09/2024',
    productsCount: 40,
    totalAmount: 12000000,
    status: 'paid' as const,
    paidDate: '06/09/2024',
    receiptUrl: '#'
  }
];

export const mockUpfrontPayments = [
  {
    id: 'UPAY-001',
    datePaid: '01/10/2024',
    poNumber: 'PO-001',
    amount: 15000000,
    method: 'Chuyển khoản ngân hàng',
    reference: 'REF789012'
  },
  {
    id: 'UPAY-002',
    datePaid: '20/09/2024',
    poNumber: 'PO-003',
    amount: 22500000,
    method: 'Chuyển khoản ngân hàng',
    reference: 'REF789013'
  },
  {
    id: 'UPAY-003',
    datePaid: '06/09/2024',
    poNumber: 'PO-004',
    amount: 12000000,
    method: 'Chuyển khoản ngân hàng',
    reference: 'REF789014'
  }
];

export const mockRevenueReports = [
  {
    id: 'REV-10-2024-2',
    period: '16-31/10/2024',
    totalRevenue: 5500000,
    vendorShare: 3850000,
    shopShare: 1650000,
    ordersCount: 8,
    status: 'pending' as const
  },
  {
    id: 'REV-10-2024-1',
    period: '01-15/10/2024',
    totalRevenue: 6500000,
    vendorShare: 4550000,
    shopShare: 1950000,
    ordersCount: 12,
    status: 'paid' as const,
    payoutDate: '18/10/2024'
  },
  {
    id: 'REV-09-2024-2',
    period: '16-30/09/2024',
    totalRevenue: 4800000,
    vendorShare: 3360000,
    shopShare: 1440000,
    ordersCount: 10,
    status: 'paid' as const,
    payoutDate: '03/10/2024'
  },
  {
    id: 'REV-09-2024-1',
    period: '01-15/09/2024',
    totalRevenue: 7200000,
    vendorShare: 5040000,
    shopShare: 2160000,
    ordersCount: 15,
    status: 'paid' as const,
    payoutDate: '18/09/2024'
  }
];

export const mockPayoutHistory = [
  {
    id: 'PAYOUT-001',
    payoutDate: '18/10/2024',
    periodCovered: '01-15/10/2024',
    revenueShareAmount: 4550000,
    bankTransferRef: 'BT20241018001',
    status: 'completed' as const
  },
  {
    id: 'PAYOUT-002',
    payoutDate: '03/10/2024',
    periodCovered: '16-30/09/2024',
    revenueShareAmount: 3360000,
    bankTransferRef: 'BT20241003001',
    status: 'completed' as const
  },
  {
    id: 'PAYOUT-003',
    payoutDate: '18/09/2024',
    periodCovered: '01-15/09/2024',
    revenueShareAmount: 5040000,
    bankTransferRef: 'BT20240918001',
    status: 'completed' as const
  },
  {
    id: 'PAYOUT-004',
    payoutDate: null,
    periodCovered: '16-31/10/2024',
    revenueShareAmount: 3850000,
    bankTransferRef: null,
    status: 'pending' as const
  }
];

export const mockVendor: Vendor = {
  id: 'v1',
  shopId: 'shop-001',
  name: 'Nhà cung cấp Thiên Nhiên',
  email: 'contact@thiennhien.vn',
  phone: '0901234567',
  warehouseAddress: '123 Đường Lê Lợi, Phường 4, Quận 3, TP.HCM',
  depositBalance: 5000000,
  status: 'active',
  createdAt: new Date('2024-01-15'),
  paymentModel: 'deposit',
  creditLimit: 20000000,
  creditUsed: 8500000
};

export const mockVendorProducts: VendorProduct[] = [
  {
    id: 'vp1',
    vendorId: 'v1',
    productId: 'PROD001',
    quantity: 150,
    consignmentPrice: 45000,
    discountPercent: 15,
    wholesalePrice: 30000,
    shopMarkup: 40,
    suggestedRetailPrice: 50000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'active',
    expiryDate: new Date('2025-12-31')
  },
  {
    id: 'vp2',
    vendorId: 'v1',
    productId: 'PROD002',
    quantity: 200,
    consignmentPrice: 32000,
    discountPercent: 10,
    wholesalePrice: 22000,
    shopMarkup: 35,
    suggestedRetailPrice: 38000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'active',
    expiryDate: new Date('2025-11-30')
  },
  {
    id: 'vp3',
    vendorId: 'v1',
    productId: 'PROD003',
    quantity: 0,
    consignmentPrice: 78000,
    discountPercent: 20,
    wholesalePrice: 55000,
    shopMarkup: 45,
    suggestedRetailPrice: 95000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'out_of_stock'
  },
  {
    id: 'vp4',
    vendorId: 'v1',
    productId: 'PROD004',
    quantity: 85,
    consignmentPrice: 125000,
    discountPercent: 25,
    wholesalePrice: 85000,
    shopMarkup: 50,
    suggestedRetailPrice: 150000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'active',
    expiryDate: new Date('2026-03-15')
  },
  {
    id: 'vp5',
    vendorId: 'v1',
    productId: 'PROD005',
    quantity: 50,
    consignmentPrice: 95000,
    discountPercent: 12,
    wholesalePrice: 65000,
    shopMarkup: 42,
    suggestedRetailPrice: 110000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'pending_approval'
  },
  {
    id: 'vp6',
    vendorId: 'v1',
    productId: 'PROD006',
    quantity: 30,
    consignmentPrice: 55000,
    discountPercent: 8,
    wholesalePrice: 38000,
    shopMarkup: 38,
    suggestedRetailPrice: 62000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'expired',
    expiryDate: new Date('2024-09-30')
  },
  {
    id: 'vp7',
    vendorId: 'v1',
    productId: 'PROD007',
    quantity: 120,
    consignmentPrice: 88000,
    discountPercent: 18,
    wholesalePrice: 60000,
    shopMarkup: 43,
    suggestedRetailPrice: 105000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'active',
    expiryDate: new Date('2025-08-20')
  },
  {
    id: 'vp8',
    vendorId: 'v1',
    productId: 'PROD008',
    quantity: 95,
    consignmentPrice: 67000,
    discountPercent: 14,
    wholesalePrice: 46000,
    shopMarkup: 40,
    suggestedRetailPrice: 78000,
    revenueShareVendor: 70,
    revenueShareShop: 30,
    status: 'active',
    expiryDate: new Date('2025-10-10')
  }
];

export const mockVendorOrders: VendorOrder[] = [
  {
    id: 'vo1',
    vendorId: 'v1',
    orderId: 'ORD20241001001',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0987654321',
    shippingAddress: '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    maskedCustomerName: maskCustomerName('Nguyễn Văn An'),
    maskedCustomerPhone: maskPhone('0987654321'),
    maskedAddress: maskAddress('456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'GHN',
    trackingCode: 'GHN123456789',
    shippingLabel: 'https://example.com/label1.pdf',
    status: 'delivered',
    codAmount: 450000,
    depositDeducted: 45000,
    totalAmount: 450000,
    orderDate: new Date('2024-10-01'),
    paymentStatus: 'cod',
    notes: 'Giao hàng trong giờ hành chính',
    items: [
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 3, price: 150000 }
    ],
    createdAt: new Date('2024-10-01')
  },
  {
    id: 'vo2',
    vendorId: 'v1',
    orderId: 'ORD20241002002',
    customerName: 'Trần Thị Bình',
    customerPhone: '0912345678',
    shippingAddress: '789 Lê Văn Việt, Phường Tăng Nhơn Phú A, Quận 9, TP.HCM',
    maskedCustomerName: maskCustomerName('Trần Thị Bình'),
    maskedCustomerPhone: maskPhone('0912345678'),
    maskedAddress: maskAddress('789 Lê Văn Việt, Phường Tăng Nhơn Phú A, Quận 9, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'Viettel Post',
    trackingCode: 'VTP987654321',
    shippingLabel: 'https://example.com/label2.pdf',
    status: 'shipped',
    codAmount: 320000,
    depositDeducted: 32000,
    totalAmount: 320000,
    orderDate: new Date('2024-10-02'),
    paymentStatus: 'cod',
    notes: 'Gọi trước khi giao',
    items: [
      { productName: 'Nhang Quế Thơm', quantity: 2, price: 80000 },
      { productName: 'Nhang Trầm Bông', quantity: 1, price: 160000 }
    ],
    createdAt: new Date('2024-10-02')
  },
  {
    id: 'vo3',
    vendorId: 'v1',
    orderId: 'ORD20241003003',
    customerName: 'Lê Minh Cường',
    customerPhone: '0909876543',
    shippingAddress: '321 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, TP.HCM',
    maskedCustomerName: maskCustomerName('Lê Minh Cường'),
    maskedCustomerPhone: maskPhone('0909876543'),
    maskedAddress: maskAddress('321 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'J&T Express',
    trackingCode: 'JNT456789123',
    shippingLabel: 'https://example.com/label3.pdf',
    status: 'confirmed',
    codAmount: 780000,
    depositDeducted: 78000,
    totalAmount: 780000,
    orderDate: new Date('2024-10-03'),
    paymentStatus: 'cod',
    notes: 'Hàng dễ vỡ, xin cẩn thận',
    items: [
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 2, price: 150000 },
      { productName: 'Nhang Dâu Tằm', quantity: 3, price: 160000 }
    ],
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'vo4',
    vendorId: 'v1',
    orderId: 'ORD20241003004',
    customerName: 'Phạm Thu Hà',
    customerPhone: '0938765432',
    shippingAddress: '567 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM',
    maskedCustomerName: maskCustomerName('Phạm Thu Hà'),
    maskedCustomerPhone: maskPhone('0938765432'),
    maskedAddress: maskAddress('567 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'Ninja Van',
    trackingCode: 'NV789123456',
    shippingLabel: 'https://example.com/label4.pdf',
    status: 'pending',
    codAmount: 1250000,
    depositDeducted: 125000,
    totalAmount: 1250000,
    orderDate: new Date('2024-10-03'),
    paymentStatus: 'cod',
    items: [
      { productName: 'Bộ Nhang Tâm Linh Deluxe', quantity: 1, price: 950000 },
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 2, price: 150000 }
    ],
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'vo5',
    vendorId: 'v1',
    orderId: 'ORD20241004005',
    customerName: 'Hoàng Văn Đức',
    customerPhone: '0945678901',
    shippingAddress: '890 Trường Chinh, Phường 12, Quận Tân Bình, TP.HCM',
    maskedCustomerName: maskCustomerName('Hoàng Văn Đức'),
    maskedCustomerPhone: maskPhone('0945678901'),
    maskedAddress: maskAddress('890 Trường Chinh, Phường 12, Quận Tân Bình, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'GHN',
    trackingCode: 'GHN234567890',
    shippingLabel: 'https://example.com/label5.pdf',
    status: 'shipped',
    codAmount: 950000,
    depositDeducted: 95000,
    totalAmount: 950000,
    orderDate: new Date('2024-10-04'),
    paymentStatus: 'cod',
    notes: 'Để ở bảo vệ nếu không có người',
    items: [
      { productName: 'Bộ Nhang Tâm Linh Deluxe', quantity: 1, price: 950000 }
    ],
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'vo6',
    vendorId: 'v1',
    orderId: 'ORD20241004006',
    customerName: 'Đặng Thị Em',
    customerPhone: '0956789012',
    shippingAddress: '234 Cách Mạng Tháng Tám, Phường 10, Quận 3, TP.HCM',
    maskedCustomerName: maskCustomerName('Đặng Thị Em'),
    maskedCustomerPhone: maskPhone('0956789012'),
    maskedAddress: maskAddress('234 Cách Mạng Tháng Tám, Phường 10, Quận 3, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'Viettel Post',
    trackingCode: 'VTP345678901',
    shippingLabel: 'https://example.com/label6.pdf',
    status: 'delivered',
    codAmount: 320000,
    depositDeducted: 32000,
    totalAmount: 320000,
    orderDate: new Date('2024-10-04'),
    paymentStatus: 'cod',
    items: [
      { productName: 'Nhang Quế Thơm', quantity: 4, price: 80000 }
    ],
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'vo7',
    vendorId: 'v1',
    orderId: 'ORD20241005007',
    customerName: 'Bùi Quốc Gia',
    customerPhone: '0967890123',
    shippingAddress: '678 Phan Văn Trị, Phường 5, Quận Gò Vấp, TP.HCM',
    maskedCustomerName: maskCustomerName('Bùi Quốc Gia'),
    maskedCustomerPhone: maskPhone('0967890123'),
    maskedAddress: maskAddress('678 Phan Văn Trị, Phường 5, Quận Gò Vấp, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'J&T Express',
    trackingCode: 'JNT567890123',
    shippingLabel: 'https://example.com/label7.pdf',
    status: 'confirmed',
    codAmount: 880000,
    depositDeducted: 88000,
    totalAmount: 880000,
    orderDate: new Date('2024-10-05'),
    paymentStatus: 'cod',
    notes: 'Giao buổi chiều',
    items: [
      { productName: 'Nhang Dâu Tằm', quantity: 2, price: 160000 },
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 4, price: 150000 }
    ],
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo8',
    vendorId: 'v1',
    orderId: 'ORD20241005008',
    customerName: 'Vũ Thị Hương',
    customerPhone: '0978901234',
    shippingAddress: '912 Lê Hồng Phong, Phường 1, Quận 10, TP.HCM',
    maskedCustomerName: maskCustomerName('Vũ Thị Hương'),
    maskedCustomerPhone: maskPhone('0978901234'),
    maskedAddress: maskAddress('912 Lê Hồng Phong, Phường 1, Quận 10, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'Ninja Van',
    trackingCode: 'NV678901234',
    shippingLabel: 'https://example.com/label8.pdf',
    status: 'delivered',
    codAmount: 670000,
    depositDeducted: 67000,
    totalAmount: 670000,
    orderDate: new Date('2024-10-05'),
    paymentStatus: 'paid',
    items: [
      { productName: 'Nhang Trầm Bông', quantity: 3, price: 160000 },
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 1, price: 150000 }
    ],
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo9',
    vendorId: 'v1',
    orderId: 'ORD20241005009',
    customerName: 'Mai Xuân Khải',
    customerPhone: '0989012345',
    shippingAddress: '345 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM',
    maskedCustomerName: maskCustomerName('Mai Xuân Khải'),
    maskedCustomerPhone: maskPhone('0989012345'),
    maskedAddress: maskAddress('345 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'GHN',
    trackingCode: 'GHN345678901',
    shippingLabel: 'https://example.com/label9.pdf',
    status: 'shipped',
    codAmount: 450000,
    depositDeducted: 45000,
    totalAmount: 450000,
    orderDate: new Date('2024-10-05'),
    paymentStatus: 'cod',
    notes: 'Không giao vào ngày lễ',
    items: [
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 3, price: 150000 }
    ],
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo10',
    vendorId: 'v1',
    orderId: 'ORD20241005010',
    customerName: 'Đinh Thị Lan',
    customerPhone: '0990123456',
    shippingAddress: '567 Xô Viết Nghệ Tĩnh, Phường 21, Quận Bình Thạnh, TP.HCM',
    maskedCustomerName: maskCustomerName('Đinh Thị Lan'),
    maskedCustomerPhone: maskPhone('0990123456'),
    maskedAddress: maskAddress('567 Xô Viết Nghệ Tĩnh, Phường 21, Quận Bình Thạnh, TP.HCM'),
    vendorName: 'Nhà cung cấp Thiên Nhiên',
    shippingCarrier: 'Viettel Post',
    trackingCode: 'VTP456789012',
    shippingLabel: 'https://example.com/label10.pdf',
    status: 'pending',
    codAmount: 320000,
    depositDeducted: 32000,
    totalAmount: 320000,
    orderDate: new Date('2024-10-05'),
    paymentStatus: 'cod',
    items: [
      { productName: 'Nhang Quế Thơm', quantity: 2, price: 80000 },
      { productName: 'Nhang Trầm Hương Cao Cấp', quantity: 1, price: 150000 }
    ],
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo11',
    vendorId: 'v1',
    orderId: 'ORD20241005011',
    maskedCustomerName: maskCustomerName('Trương Văn Minh'),
    maskedCustomerPhone: maskPhone('0901234567'),
    maskedAddress: maskAddress('789 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM'),
    shippingCarrier: 'J&T Express',
    trackingCode: 'JNT678901234',
    shippingLabel: 'https://example.com/label11.pdf',
    status: 'delivered',
    codAmount: 1250000,
    depositDeducted: 125000,
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo12',
    vendorId: 'v1',
    orderId: 'ORD20241005012',
    maskedCustomerName: maskCustomerName('Ngô Thị Nga'),
    maskedCustomerPhone: maskPhone('0912345678'),
    maskedAddress: maskAddress('123 Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM'),
    shippingCarrier: 'Ninja Van',
    trackingCode: 'NV789012345',
    shippingLabel: 'https://example.com/label12.pdf',
    status: 'cancelled',
    codAmount: 0,
    depositDeducted: 0,
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo13',
    vendorId: 'v1',
    orderId: 'ORD20241005013',
    maskedCustomerName: maskCustomerName('Phan Quốc Oai'),
    maskedCustomerPhone: maskPhone('0923456789'),
    maskedAddress: maskAddress('456 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM'),
    shippingCarrier: 'Giao Hàng Nhanh',
    trackingCode: 'GHN456789012',
    shippingLabel: 'https://example.com/label13.pdf',
    status: 'confirmed',
    codAmount: 950000,
    depositDeducted: 95000,
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo14',
    vendorId: 'v1',
    orderId: 'ORD20241005014',
    maskedCustomerName: maskCustomerName('Lý Thị Phương'),
    maskedCustomerPhone: maskPhone('0934567890'),
    maskedAddress: maskAddress('789 Pasteur, Phường 6, Quận 3, TP.HCM'),
    shippingCarrier: 'Viettel Post',
    trackingCode: 'VTP567890123',
    shippingLabel: 'https://example.com/label14.pdf',
    status: 'shipped',
    codAmount: 670000,
    depositDeducted: 67000,
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'vo15',
    vendorId: 'v1',
    orderId: 'ORD20241005015',
    maskedCustomerName: maskCustomerName('Dương Văn Quang'),
    maskedCustomerPhone: maskPhone('0945678901'),
    maskedAddress: maskAddress('234 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP.HCM'),
    shippingCarrier: 'J&T Express',
    trackingCode: 'JNT789012345',
    shippingLabel: 'https://example.com/label15.pdf',
    status: 'delivered',
    codAmount: 880000,
    depositDeducted: 88000,
    createdAt: new Date('2024-10-05')
  }
];

export const mockConsignmentRequests: ConsignmentRequest[] = [
  {
    id: 'cr1',
    vendorId: 'v1',
    productName: 'Nhang trầm hương cao cấp',
    quantity: 100,
    proposedPrice: 85000,
    discountPercent: 15,
    status: 'approved',
    notes: 'Sản phẩm chất lượng cao, đã kiểm nghiệm',
    createdAt: new Date('2024-09-20')
  },
  {
    id: 'cr2',
    vendorId: 'v1',
    productName: 'Tinh dầu sả chanh organic',
    quantity: 50,
    proposedPrice: 120000,
    discountPercent: 20,
    status: 'pending',
    notes: 'Chờ kiểm tra chất lượng',
    createdAt: new Date('2024-10-01')
  },
  {
    id: 'cr3',
    vendorId: 'v1',
    productName: 'Nến thơm lavender',
    quantity: 75,
    proposedPrice: 65000,
    discountPercent: 10,
    status: 'approved',
    notes: 'Đã được phê duyệt, sẵn sàng ký gửi',
    createdAt: new Date('2024-09-25')
  },
  {
    id: 'cr4',
    vendorId: 'v1',
    productName: 'Bột trầm hương',
    quantity: 30,
    proposedPrice: 150000,
    discountPercent: 18,
    status: 'rejected',
    notes: 'Giá đề xuất quá cao so với thị trường',
    createdAt: new Date('2024-09-15')
  },
  {
    id: 'cr5',
    vendorId: 'v1',
    productName: 'Tinh dầu bạc hà',
    quantity: 60,
    proposedPrice: 95000,
    discountPercent: 12,
    status: 'pending',
    notes: 'Đang chờ xem xét',
    createdAt: new Date('2024-10-03')
  }
];

export const mockDepositTransactions: DepositTransaction[] = [
  {
    id: 'dt1',
    vendorId: 'v1',
    type: 'deposit',
    amount: 10000000,
    description: 'Nạp tiền ký quỹ ban đầu',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'dt2',
    vendorId: 'v1',
    type: 'deduction',
    amount: 45000,
    orderId: 'ORD20241001001',
    description: 'Khấu trừ phí COD đơn hàng ORD20241001001',
    createdAt: new Date('2024-10-01')
  },
  {
    id: 'dt3',
    vendorId: 'v1',
    type: 'deduction',
    amount: 32000,
    orderId: 'ORD20241002002',
    description: 'Khấu trừ phí COD đơn hàng ORD20241002002',
    createdAt: new Date('2024-10-02')
  },
  {
    id: 'dt4',
    vendorId: 'v1',
    type: 'deduction',
    amount: 78000,
    orderId: 'ORD20241003003',
    description: 'Khấu trừ phí COD đơn hàng ORD20241003003',
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'dt5',
    vendorId: 'v1',
    type: 'deposit',
    amount: 5000000,
    description: 'Nạp thêm tiền ký quỹ',
    createdAt: new Date('2024-09-01')
  },
  {
    id: 'dt6',
    vendorId: 'v1',
    type: 'deduction',
    amount: 125000,
    orderId: 'ORD20241003004',
    description: 'Khấu trừ phí COD đơn hàng ORD20241003004',
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'dt7',
    vendorId: 'v1',
    type: 'deduction',
    amount: 95000,
    orderId: 'ORD20241004005',
    description: 'Khấu trừ phí COD đơn hàng ORD20241004005',
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'dt8',
    vendorId: 'v1',
    type: 'deduction',
    amount: 32000,
    orderId: 'ORD20241004006',
    description: 'Khấu trừ phí COD đơn hàng ORD20241004006',
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'dt9',
    vendorId: 'v1',
    type: 'refund',
    amount: 78000,
    orderId: 'ORD20241003003',
    description: 'Hoàn tiền do hàng trả lại',
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'dt10',
    vendorId: 'v1',
    type: 'deduction',
    amount: 88000,
    orderId: 'ORD20241005007',
    description: 'Khấu trừ phí COD đơn hàng ORD20241005007',
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'dt11',
    vendorId: 'v1',
    type: 'deduction',
    amount: 67000,
    orderId: 'ORD20241005008',
    description: 'Khấu trừ phí COD đơn hàng ORD20241005008',
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'dt12',
    vendorId: 'v1',
    type: 'deposit',
    amount: 3000000,
    description: 'Nạp tiền bổ sung tháng 10',
    createdAt: new Date('2024-10-01')
  },
  {
    id: 'dt13',
    vendorId: 'v1',
    type: 'deduction',
    amount: 45000,
    orderId: 'ORD20241005009',
    description: 'Khấu trừ phí COD đơn hàng ORD20241005009',
    createdAt: new Date('2024-10-05')
  },
  {
    id: 'dt14',
    vendorId: 'v1',
    type: 'deduction',
    amount: 125000,
    orderId: 'ORD20241005011',
    description: 'Khấu trừ phí COD đơn hàng ORD20241005011',
    createdAt: new Date('2024-10-05')
  }
];

export const mockReturnRequests: ReturnRequest[] = [
  {
    id: 'rr1',
    vendorId: 'v1',
    productId: 'PROD003',
    quantity: 5,
    reason: 'Sản phẩm bị hư hỏng trong quá trình vận chuyển',
    status: 'approved',
    createdAt: new Date('2024-09-28')
  },
  {
    id: 'rr2',
    vendorId: 'v1',
    productId: 'PROD001',
    quantity: 3,
    reason: 'Khách hàng đổi ý, không muốn mua nữa',
    status: 'pending',
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'rr3',
    vendorId: 'v1',
    productId: 'PROD007',
    quantity: 2,
    reason: 'Sản phẩm không đúng mô tả',
    status: 'completed',
    createdAt: new Date('2024-09-20')
  }
];

export const mockVendorReturnRequests: VendorReturnRequest[] = [
  {
    id: 'RET-001',
    orderId: 'ORD-2024-001',
    vendorOrderId: 'VO-001',
    productId: 'PROD001',
    productName: 'Bộ trầm hương Kỳ Nam cao cấp',
    productImage: '/placeholder-product.jpg',
    maskedCustomer: 'Nguyễn V.A',
    reason: 'defective',
    reasonDetail: 'Sản phẩm bị nứt',
    quantity: 1,
    refundAmount: 450000,
    requestDate: '28/10/2024',
    status: 'pending',
    images: ['/return-image1.jpg', '/return-image2.jpg']
  },
  {
    id: 'RET-002',
    orderId: 'ORD-2024-005',
    vendorOrderId: 'VO-002',
    productId: 'PROD002',
    productName: 'Sách Kinh Phật Bà',
    productImage: '/placeholder-product.jpg',
    maskedCustomer: 'Trần T.B',
    reason: 'wrong_item',
    reasonDetail: 'Gửi nhầm phiên bản',
    quantity: 2,
    refundAmount: 180000,
    requestDate: '27/10/2024',
    status: 'pending'
  },
  {
    id: 'RET-003',
    orderId: 'ORD-2024-003',
    vendorOrderId: 'VO-003',
    productId: 'PROD003',
    productName: 'Tượng Phật Di Lặc',
    productImage: '/placeholder-product.jpg',
    maskedCustomer: 'Lê V.C',
    reason: 'not_as_described',
    quantity: 1,
    refundAmount: 890000,
    requestDate: '25/10/2024',
    status: 'approved',
    approvedBy: 'Admin',
    processedDate: '26/10/2024',
    trackingNumber: 'GHN-RET-12345678',
    shippingProvider: 'ghn',
    shippingFeePayer: 'vendor'
  },
  {
    id: 'RET-004',
    orderId: 'ORD-2024-007',
    vendorOrderId: 'VO-004',
    productId: 'PROD004',
    productName: 'Nhang trầm hương 30cm',
    productImage: '/placeholder-product.jpg',
    maskedCustomer: 'Phạm T.D',
    reason: 'changed_mind',
    quantity: 3,
    refundAmount: 270000,
    requestDate: '20/10/2024',
    status: 'rejected',
    rejectedReason: 'Quá thời gian đổi trả (>7 ngày)',
    processedDate: '21/10/2024'
  }
];

export const mockProductSales: Record<string, number> = {
  'PROD001': 150,
  'PROD002': 90,
  'PROD003': 45,
  'PROD004': 180
};

export const returnReasonLabels = {
  defective: 'Lỗi sản phẩm',
  wrong_item: 'Gửi nhầm hàng',
  not_as_described: 'Không đúng mô tả',
  changed_mind: 'Đổi ý',
  other: 'Lý do khác'
};

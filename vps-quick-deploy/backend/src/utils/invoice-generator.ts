import QRCode from 'qrcode';
import { db } from '../db';
import { orders, customers, shopSettings, InvoiceTemplateConfig } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Lazy-load canvas only when needed (optional dependency)
let createCanvas: any;
let loadImage: any;
async function ensureCanvas() {
  if (!createCanvas) {
    try {
      const canvas = await import('canvas');
      createCanvas = canvas.createCanvas;
      loadImage = canvas.loadImage;
    } catch (error) {
      throw new Error('Canvas module not available. Install canvas with: pnpm rebuild canvas');
    }
  }
}

interface InvoiceData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  createdAt: Date;
  shopName: string;
  shopPhone?: string;
  shopAddress?: string;
  bankAccount?: string;
  bankName?: string;
  accountName?: string;
}

const DEFAULT_CONFIG: InvoiceTemplateConfig = {
  layout: {
    orientation: 'portrait',
    paperSize: 'a4',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
  colors: {
    primary: '#6B8E23',
    secondary: '#556B2F',
    text: '#556B2F',
    background: '#F5F5DC',
    border: '#6B8E23',
  },
  fonts: {
    family: 'sans-serif',
    size: {
      heading: '21px',
      body: '9px',
      small: '8px',
    },
  },
  qr_settings: {
    enabled: true,
    position: 'bottom-right',
    size: 133,
  },
  header: {
    show_business_name: true,
    show_logo: true,
    show_contact_info: true,
  },
  footer: {
    show_terms: false,
    show_thank_you: true,
    custom_text: 'Cảm ơn bạn đã ủng hộ sản phẩm hữu cơ!',
  },
  fields: {
    show_customer_info: true,
    show_payment_method: true,
    show_notes: true,
    show_tax: true,
  },
};

export async function generateInvoiceImage(
  orderId: string,
  customConfig?: Partial<InvoiceTemplateConfig>
): Promise<Buffer> {
  // Ensure canvas is loaded before proceeding
  await ensureCanvas();
  
  const orderResult = await db
    .select()
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderResult.length) {
    throw new Error(`Order ${orderId} not found`);
  }

  const order = orderResult[0].orders;
  const customer = orderResult[0].customers;

  const shopResult = await db.select().from(shopSettings).limit(1);
  const shop = shopResult[0];

  const invoiceData: InvoiceData = {
    orderId: order.id,
    customerName: customer?.name || order.shippingInfo?.name || 'Khách hàng',
    customerPhone: customer?.phone || order.shippingInfo?.phone || '',
    items: order.items as any[],
    subtotal: parseFloat(order.subtotal as string),
    shippingFee: parseFloat(order.shippingFee as string),
    tax: parseFloat(order.tax as string),
    total: parseFloat(order.total as string),
    createdAt: order.createdAt,
    shopName: shop?.businessName || 'Cửa hàng',
    shopPhone: shop?.phone,
    shopAddress: shop?.address,
    bankAccount: process.env.SHB_BANK_ACCOUNT || '',
    bankName: 'SHB',
    accountName: process.env.SHB_ACCOUNT_NAME || '',
  };

  const config: InvoiceTemplateConfig = mergeConfig(DEFAULT_CONFIG, customConfig);

  return await renderInvoice(invoiceData, config);
}

function mergeConfig(
  defaultConfig: InvoiceTemplateConfig,
  customConfig?: Partial<InvoiceTemplateConfig>
): InvoiceTemplateConfig {
  if (!customConfig) {
    return defaultConfig;
  }

  return {
    layout: {
      ...defaultConfig.layout,
      ...customConfig.layout,
      margins: {
        ...defaultConfig.layout?.margins,
        ...customConfig.layout?.margins,
      },
    },
    colors: {
      ...defaultConfig.colors,
      ...customConfig.colors,
    },
    fonts: {
      ...defaultConfig.fonts,
      ...customConfig.fonts,
      size: {
        ...defaultConfig.fonts?.size,
        ...customConfig.fonts?.size,
      },
    },
    qr_settings: {
      ...defaultConfig.qr_settings,
      ...customConfig.qr_settings,
    },
    logo_url: customConfig.logo_url ?? defaultConfig.logo_url,
    header: {
      ...defaultConfig.header,
      ...customConfig.header,
    },
    footer: {
      ...defaultConfig.footer,
      ...customConfig.footer,
    },
    fields: {
      ...defaultConfig.fields,
      ...customConfig.fields,
    },
  };
}

function generateNumericOrderId(orderId: string): string {
  const digitsOnly = orderId.replace(/\D/g, '');
  return digitsOnly.slice(-8).padStart(8, '0');
}

function formatQuantity(qty: number): string {
  const rounded = Math.round(qty * 100) / 100;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '');
}

async function renderInvoice(data: InvoiceData, config: InvoiceTemplateConfig): Promise<Buffer> {
  const width = 400;
  const itemHeight = 20;
  const baseHeight = 567;
  const totalHeight = baseHeight + (data.items.length * itemHeight);
  
  const canvas = createCanvas(width, totalHeight);
  const ctx = canvas.getContext('2d');

  const colors = config.colors!;
  const fonts = config.fonts!;
  const margins = config.layout?.margins!;
  const qrSettings = config.qr_settings!;
  const header = config.header!;
  const footer = config.footer!;

  ctx.fillStyle = colors.background!;
  ctx.fillRect(0, 0, width, totalHeight);

  let yPos = 40;

  if (header.show_logo) {
    ctx.fillStyle = colors.background!;
    ctx.strokeStyle = colors.border!;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(47, yPos + 20, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    let logoRendered = false;

    if (config.logo_url) {
      try {
        const logoImage = await loadImage(config.logo_url);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(47, yPos + 20, 27, 0, Math.PI * 2);
        ctx.clip();
        
        const size = 54;
        const x = 47 - size / 2;
        const y = yPos + 20 - size / 2;
        
        ctx.drawImage(logoImage, x, y, size, size);
        ctx.restore();
        
        logoRendered = true;
      } catch (error) {
        logoRendered = false;
      }
    }

    if (!logoRendered) {
      ctx.font = '33px ' + fonts.family!;
      ctx.fillStyle = colors.primary!;
      ctx.textAlign = 'center';
      ctx.fillText('🌿', 47, yPos + 32);
    }
  }

  if (header.show_business_name) {
    ctx.fillStyle = colors.primary!;
    ctx.font = 'bold ' + fonts.size?.heading + ' ' + fonts.family!;
    ctx.textAlign = 'left';
    ctx.fillText('HÓA ĐƠN', 87, yPos + 23);

    ctx.font = 'italic 12px ' + fonts.family!;
    ctx.fillStyle = colors.primary!;
    ctx.fillText(`${data.shopName}`, 87, yPos + 40);
  }
  
  yPos += 60;

  ctx.strokeStyle = colors.border!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left!, yPos);
  ctx.lineTo(width - margins.right!, yPos);
  ctx.stroke();
  yPos += 20;

  ctx.fillStyle = colors.text!;
  ctx.font = 'bold 11px ' + fonts.family!;
  ctx.textAlign = 'left';
  ctx.fillText('Thông tin khách hàng', margins.left!, yPos);
  yPos += 17;

  ctx.strokeStyle = colors.border!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left!, yPos);
  ctx.lineTo(width - margins.right!, yPos);
  ctx.stroke();
  yPos += 17;

  ctx.font = 'bold 12px ' + fonts.family!;
  ctx.fillStyle = colors.text!;
  const numericOrderId = generateNumericOrderId(data.orderId);
  ctx.fillText(`Tên Khách: ${data.customerName}`, margins.left!, yPos);
  yPos += 15;
  
  ctx.font = fonts.size?.body + ' ' + fonts.family!;
  ctx.fillText(`Mã Đơn: #${numericOrderId}`, margins.left!, yPos);
  yPos += 12;

  ctx.fillText(`SĐT: ${data.customerPhone}  |  Ngày: ${data.createdAt.toLocaleDateString('vi-VN')}`, margins.left!, yPos);
  yPos += 20;

  ctx.strokeStyle = colors.border!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left!, yPos);
  ctx.lineTo(width - margins.right!, yPos);
  ctx.stroke();
  yPos += 17;

  ctx.font = 'bold ' + fonts.size?.body + ' ' + fonts.family!;
  ctx.fillStyle = colors.primary!;
  ctx.fillText('Sản phẩm', margins.left!, yPos);
  ctx.textAlign = 'center';
  ctx.fillText('SL', 200, yPos);
  ctx.fillText('Đơn giá', 250, yPos);
  ctx.textAlign = 'right';
  ctx.fillText('Thành tiền', 360, yPos);
  yPos += 13;

  ctx.strokeStyle = colors.border!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left!, yPos);
  ctx.lineTo(width - margins.right!, yPos);
  ctx.stroke();
  yPos += 17;

  ctx.fillStyle = colors.text!;
  ctx.font = fonts.size?.body + ' ' + fonts.family!;
  
  data.items.forEach((item) => {
    const itemTotal = item.quantity * item.price;
    
    ctx.textAlign = 'left';
    const maxNameWidth = 160;
    let productName = item.productName;
    ctx.font = fonts.size?.body + ' ' + fonts.family!;
    let nameWidth = ctx.measureText(productName).width;
    
    if (nameWidth > maxNameWidth) {
      while (nameWidth > maxNameWidth && productName.length > 3) {
        productName = productName.slice(0, -4) + '...';
        nameWidth = ctx.measureText(productName).width;
      }
    }
    
    ctx.fillText(productName, margins.left!, yPos);
    
    ctx.textAlign = 'center';
    ctx.fillText(formatQuantity(item.quantity), 200, yPos);
    ctx.fillText(formatCurrency(item.price), 250, yPos);
    
    ctx.textAlign = 'right';
    ctx.fillText(formatCurrency(itemTotal), 360, yPos);
    
    yPos += itemHeight;
  });

  yPos += 3;
  ctx.strokeStyle = colors.border!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margins.left!, yPos);
  ctx.lineTo(width - margins.right!, yPos);
  ctx.stroke();
  yPos += 17;

  ctx.font = fonts.size?.body + ' ' + fonts.family!;
  ctx.fillStyle = colors.text!;
  ctx.textAlign = 'left';
  
  ctx.fillText(`Tạm tính: ${formatCurrency(data.subtotal)}`, margins.left!, yPos);
  
  if (data.shippingFee > 0) {
    yPos += 13;
    ctx.fillText(`Phí vận chuyển: ${formatCurrency(data.shippingFee)}`, margins.left!, yPos);
  }
  
  yPos += 23;

  const pillWidth = 187;
  const pillHeight = 29;
  const pillX = (width - pillWidth) / 2;
  const pillRadius = pillHeight / 2;

  ctx.fillStyle = colors.secondary!;
  ctx.beginPath();
  ctx.moveTo(pillX + pillRadius, yPos);
  ctx.lineTo(pillX + pillWidth - pillRadius, yPos);
  ctx.arc(pillX + pillWidth - pillRadius, yPos + pillRadius, pillRadius, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(pillX + pillRadius, yPos + pillHeight);
  ctx.arc(pillX + pillRadius, yPos + pillRadius, pillRadius, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px ' + fonts.family!;
  ctx.textAlign = 'center';
  ctx.fillText(`TỔNG CỘNG: ${formatCurrency(data.total)}`, width / 2, yPos + 19);
  yPos += 47;

  if (qrSettings.enabled) {
    const qrNumericId = generateNumericOrderId(data.orderId);
    const qrContent = `970443|${data.bankAccount}|${Math.round(data.total)}|${qrNumericId}`;
    const qrDataUrl = await QRCode.toDataURL(qrContent, {
      width: qrSettings.size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    const qrImage = await loadImage(qrDataUrl);
    const qrSize = qrSettings.size!;
    const qrX = (width - qrSize) / 2;
    ctx.drawImage(qrImage, qrX, yPos, qrSize, qrSize);
    yPos += qrSize + 10;

    ctx.fillStyle = colors.text!;
    ctx.font = fonts.size?.small + ' ' + fonts.family!;
    ctx.textAlign = 'center';
    ctx.fillText('Quét mã QR để thanh toán', width / 2, yPos);
    yPos += 13;
    
    if (data.bankAccount && data.accountName) {
      const footerNumericId = generateNumericOrderId(data.orderId);
      ctx.fillText(`${data.bankName} - ${data.bankAccount}`, width / 2, yPos);
      yPos += 12;
      ctx.fillText(`Chủ TK: ${data.accountName}`, width / 2, yPos);
      yPos += 12;
      ctx.font = 'bold ' + fonts.size?.small + ' ' + fonts.family!;
      ctx.fillText(`Nội dung: ${footerNumericId}`, width / 2, yPos);
      yPos += 17;
    }
  }

  if (footer.show_thank_you && footer.custom_text) {
    ctx.font = 'italic ' + fonts.size?.body + ' ' + fonts.family!;
    ctx.fillStyle = colors.text!;
    ctx.fillText(footer.custom_text, width / 2, yPos);
  }

  return canvas.toBuffer('image/png');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
}

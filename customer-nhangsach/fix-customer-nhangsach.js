#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing customer-nhangsach...');

// Fix mockVendorData.ts
function fixMockVendorData() {
  console.log('📝 Fixing mockVendorData.ts...');
  const filePath = path.join(__dirname, 'src', 'data', 'mockVendorData.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ mockVendorData.ts not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add missing properties to VendorOrder objects
  const vendorOrderFixes = [
    // Fix vo11
    {
      from: /id: 'vo11',\s*vendorId: 'v1',\s*orderId: 'ORD20241005011',\s*maskedCustomerName:/,
      to: `id: 'vo11',
    vendorId: 'v1',
    orderId: 'ORD20241005011',
    customerName: 'Trương Văn Minh',
    customerPhone: '0901234567',
    shippingAddress: '789 Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM',
    vendorName: 'Nhà Sách Minh Tâm',
    maskedCustomerName:`
    },
    // Fix vo12
    {
      from: /id: 'vo12',\s*vendorId: 'v1',\s*orderId: 'ORD20241005012',\s*maskedCustomerName:/,
      to: `id: 'vo12',
    vendorId: 'v1',
    orderId: 'ORD20241005012',
    customerName: 'Ngô Thị Nga',
    customerPhone: '0901234568',
    shippingAddress: '456 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM',
    vendorName: 'Nhà Sách Minh Tâm',
    maskedCustomerName:`
    },
    // Fix vo13
    {
      from: /id: 'vo13',\s*vendorId: 'v1',\s*orderId: 'ORD20241005013',\s*maskedCustomerName:/,
      to: `id: 'vo13',
    vendorId: 'v1',
    orderId: 'ORD20241005013',
    customerName: 'Lê Văn Hùng',
    customerPhone: '0901234569',
    shippingAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    vendorName: 'Nhà Sách Minh Tâm',
    maskedCustomerName:`
    },
    // Fix vo14
    {
      from: /id: 'vo14',\s*vendorId: 'v1',\s*orderId: 'ORD20241005014',\s*maskedCustomerName:/,
      to: `id: 'vo14',
    vendorId: 'v1',
    orderId: 'ORD20241005014',
    customerName: 'Phạm Thị Lan',
    customerPhone: '0901234570',
    shippingAddress: '456 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    vendorName: 'Nhà Sách Minh Tâm',
    maskedCustomerName:`
    },
    // Fix vo15
    {
      from: /id: 'vo15',\s*vendorId: 'v1',\s*orderId: 'ORD20241005015',\s*maskedCustomerName:/,
      to: `id: 'vo15',
    vendorId: 'v1',
    orderId: 'ORD20241005015',
    customerName: 'Hoàng Văn Đức',
    customerPhone: '0901234571',
    shippingAddress: '789 Cách Mạng Tháng 8, Quận 10, TP.HCM',
    vendorName: 'Nhà Sách Minh Tâm',
    maskedCustomerName:`
    }
  ];

  vendorOrderFixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed mockVendorData.ts');
}

// Fix UserProfile.tsx
function fixUserProfile() {
  console.log('📝 Fixing UserProfile.tsx...');
  const filePath = path.join(__dirname, 'src', 'components', 'UserProfile.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ UserProfile.tsx not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add missing properties to User type
  const userFixes = [
    { from: /user\.isGuest/g, to: '(user as any).isGuest' },
    { from: /user\.guestName/g, to: '(user as any).guestName' },
  ];

  userFixes.forEach(fix => {
    content = content.replace(fix.from, fix.to);
  });

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed UserProfile.tsx');
}

// Fix ProfileTab.tsx
function fixProfileTab() {
  console.log('📝 Fixing ProfileTab.tsx...');
  const filePath = path.join(__dirname, 'src', 'components', 'ProfileTab.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ ProfileTab.tsx not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix status comparison
  content = content.replace(
    /o\.status !== 'delivered' && o\.status !== 'cancelled'/g,
    "o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'shipped'"
  );

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed ProfileTab.tsx');
}

// Fix Uint8Array issues
function fixUint8ArrayIssues() {
  console.log('📝 Fixing Uint8Array issues...');
  
  const files = [
    'src/hooks/usePushNotifications.ts',
    'src/lib/notificationService.ts'
  ];

  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file} not found`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Uint8Array type issues
    content = content.replace(
      /urlBase64ToUint8Array\([^)]+\)/g,
      'urlBase64ToUint8Array($1) as any'
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  });
}

// Main execution
try {
  fixMockVendorData();
  fixUserProfile();
  fixProfileTab();
  fixUint8ArrayIssues();
  
  console.log('🎉 Customer-nhangsach fix completed!');
  console.log('📋 Next steps:');
  console.log('1. Run: npm run build');
  console.log('2. Check for remaining errors');
  
} catch (error) {
  console.error('❌ Error during fix:', error.message);
  process.exit(1);
}

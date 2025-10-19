const fs = require('fs');
const path = require('path');

// Mapping các type names cần thay thế
const typeMappings = {
  // Singular to Plural mappings
  'Customer': 'Customers',
  'InsertCustomer': 'InsertCustomers',
  'Product': 'Products', 
  'InsertProduct': 'InsertProducts',
  'User': 'Users',
  'InsertUser': 'InsertUsers',
  'Order': 'Orders',
  'InsertOrder': 'InsertOrders',
  'OrderItem': 'OrderItems',
  'InsertOrderItem': 'InsertOrderItems',
  'SocialAccount': 'SocialAccounts',
  'InsertSocialAccount': 'InsertSocialAccounts',
  'PageTag': 'PageTags',
  'InsertPageTag': 'InsertPageTags',
  'UnifiedTag': 'UnifiedTags',
  'InsertUnifiedTag': 'InsertUnifiedTags',
  'TikTokBusinessAccount': 'TiktokBusinessAccounts',
  'InsertTikTokBusinessAccount': 'InsertTiktokBusinessAccounts',
  'FacebookApp': 'FacebookApps',
  'InsertFacebookApp': 'InsertFacebookApps',
  'TikTokShopOrder': 'TiktokShopOrders',
  'InsertTikTokShopOrder': 'InsertTiktokShopOrders',
  'TikTokShopProduct': 'TiktokShopProducts',
  'InsertTikTokShopProduct': 'InsertTiktokShopProducts',
  'TikTokVideo': 'TiktokVideos',
  'InsertTikTokVideo': 'InsertTiktokVideos',
  'ContentLibrary': 'ContentLibraries',
  'InsertContentLibrary': 'InsertContentLibraries',
  'BookSellerInventory': 'BookSellerInventories',
  'InsertBookSellerInventory': 'InsertBookSellerInventories',
  'FanpageBotConfigs': 'FanpageBotConfigs', // Keep as is
  'ContentLibraries': 'ContentLibraries', // Keep as is
  'BookSellerInventories': 'BookSellerInventories', // Keep as is
};

// Files to process
const filesToProcess = [
  'src/storage.ts',
  'shared/schema.ts'
];

function replaceTypesInFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;

    // Apply type mappings
    for (const [oldType, newType] of Object.entries(typeMappings)) {
      if (oldType !== newType) {
        const regex = new RegExp(`\\b${oldType}\\b`, 'g');
        const newContent = content.replace(regex, newType);
        if (newContent !== content) {
          content = newContent;
          hasChanges = true;
          console.log(`Replaced ${oldType} with ${newType} in ${filePath}`);
        }
      }
    }

    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }

  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🔄 Starting bulk type replacement...');
filesToProcess.forEach(replaceTypesInFile);
console.log('✅ Bulk type replacement completed!');




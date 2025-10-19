const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'storage.ts');

console.log('Reading storage.ts...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Replacing type references...');

// Replace singular types with plural types in method signatures and return types
const replacements = [
  // Product types
  { from: /Promise<Product\[\]>/g, to: 'Promise<Products[]>' },
  { from: /Promise<Product \| undefined>/g, to: 'Promise<Products | undefined>' },
  { from: /Promise<Product>/g, to: 'Promise<Products>' },
  { from: /Promise<\(Product &/g, to: 'Promise<(Products &' },
  { from: /Promise<\(FlashSales & \{ product: Product \}\) \| undefined>/g, to: 'Promise<(FlashSales & { product: Products }) | undefined>' },
  { from: /Promise<\(FlashSales & \{ product: Product \}\)\[\]>/g, to: 'Promise<(FlashSales & { product: Products })[]>' },
  { from: /Promise<PreorderProducts & \{ product\?: Product \}>/g, to: 'Promise<PreorderProducts & { product?: Products }>' },
  { from: /Promise<\(PreorderProducts & \{ product\?: Product \}\)\[\]>/g, to: 'Promise<(PreorderProducts & { product?: Products })[]>' },
  { from: /product: InsertProduct/g, to: 'product: InsertProducts' },
  { from: /Partial<InsertProduct>/g, to: 'Partial<InsertProducts>' },
  { from: /as Product\[\]/g, to: 'as Products[]' },
  { from: /as Product/g, to: 'as Products' },
  { from: /row\.product as Product/g, to: 'row.product as Products' },
  { from: /row\.product \? \(row\.product as Product\)/g, to: 'row.product ? (row.product as Products)' },
  
  // Customer types
  { from: /Promise<Customer\[\]>/g, to: 'Promise<Customers[]>' },
  { from: /Promise<Customer \| undefined>/g, to: 'Promise<Customers | undefined>' },
  { from: /Promise<Customer>/g, to: 'Promise<Customers>' },
  { from: /Promise<\(Customer &/g, to: 'Promise<(Customers &' },
  { from: /Promise<Customer \| null>/g, to: 'Promise<Customers | null>' },
  { from: /customer: InsertCustomer/g, to: 'customer: InsertCustomers' },
  { from: /Partial<InsertCustomer>/g, to: 'Partial<InsertCustomers>' },
  
  // User types
  { from: /Promise<User \| undefined>/g, to: 'Promise<Users | undefined>' },
  { from: /Promise<User>/g, to: 'Promise<Users>' },
  { from: /insertUser: InsertUser/g, to: 'insertUser: InsertUsers' },
  
  // BookSellerInventory types
  { from: /Promise<BookSellerInventory\[\]>/g, to: 'Promise<BookSellerInventories[]>' },
  
  // FanpageBotConfigs - replace with any for now since it doesn't exist in schema
  { from: /Promise<FanpageBotConfigs \| null>/g, to: 'Promise<any | null>' },
  { from: /botConfig: FanpageBotConfigs/g, to: 'botConfig: any' },
  { from: /as FanpageBotConfigs \| null \| undefined/g, to: 'as any | null | undefined' },
];

let totalReplacements = 0;
replacements.forEach(({ from, to }) => {
  const matches = content.match(from);
  if (matches) {
    content = content.replace(from, to);
    totalReplacements += matches.length;
    console.log(`Replaced ${matches.length} instances of ${from}`);
  }
});

console.log(`Total replacements made: ${totalReplacements}`);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated storage.ts successfully!');



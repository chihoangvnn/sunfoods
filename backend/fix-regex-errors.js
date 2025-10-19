const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'storage.ts');

console.log('Reading storage.ts...');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing regex replacement errors...');

// Fix regex replacement errors
const replacements = [
  // Fix Productss -> Products
  { from: /Productss/g, to: 'Products' },
  
  // Fix ProductsPolicies -> ProductPolicies
  { from: /ProductsPolicies/g, to: 'ProductPolicies' },
  
  // Fix remaining InsertUser -> InsertUsers
  { from: /InsertUser/g, to: 'InsertUsers' },
  
  // Fix remaining Product -> Products in type casting
  { from: /as Product\[\]/g, to: 'as Products[]' },
  { from: /as Product\}/g, to: 'as Products}' },
  { from: /as Product\)/g, to: 'as Products)' },
  { from: /as Product;//g, to: 'as Products;' },
  { from: /as Product,/g, to: 'as Products,' },
  { from: /as Product /g, to: 'as Products ' },
  { from: /as Product$/g, to: 'as Products' },
  
  // Fix remaining Customer -> Customers in type casting
  { from: /as Customer\[\]/g, to: 'as Customers[]' },
  { from: /as Customer\}/g, to: 'as Customers}' },
  { from: /as Customer\)/g, to: 'as Customers)' },
  { from: /as Customer;//g, to: 'as Customers;' },
  { from: /as Customer,/g, to: 'as Customers,' },
  { from: /as Customer /g, to: 'as Customers ' },
  { from: /as Customer$/g, to: 'as Customers' },
  
  // Fix remaining User -> Users in type casting
  { from: /as User\[\]/g, to: 'as Users[]' },
  { from: /as User\}/g, to: 'as Users}' },
  { from: /as User\)/g, to: 'as Users)' },
  { from: /as User;//g, to: 'as Users;' },
  { from: /as User,/g, to: 'as Users,' },
  { from: /as User /g, to: 'as Users ' },
  { from: /as User$/g, to: 'as Users' },
  
  // Fix type casting in return statements
  { from: /} as FlashSales & \{ product: Product \}/g, to: '} as FlashSales & { product: Products }' },
  { from: /\) as \(FlashSales & \{ product: Product \}\)\[\]/g, to: ') as (FlashSales & { product: Products })[]' },
  { from: /} as PreorderProducts & \{ product\?: Product \}/g, to: '} as PreorderProducts & { product?: Products }' },
  { from: /\) as \(PreorderProducts & \{ product\?: Product \}\)\[\]/g, to: ') as (PreorderProducts & { product?: Products })[]' },
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


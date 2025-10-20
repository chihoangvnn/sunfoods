const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining backend errors (Round 3)...\n');

const fixes = [
  // Fix src/index.ts - session middleware
  {
    file: 'src/index.ts',
    changes: [
      {
        find: `app.use(session as any)({`,
        replace: `app.use(session({`
      }
    ]
  },
  
  // Fix src/rasa-routes.ts - remaining issues
  {
    file: 'src/rasa-routes.ts',
    changes: [
      {
        find: `}[(selectedCustomField as any).category] || '📋'`,
        replace: `}[(selectedCustomField as any).category] || '📋'`
      },
      {
        find: `allCustomDescriptions: (customDescriptions as any).map((field: any) => ({`,
        replace: `allCustomDescriptions: (customDescriptions as any).map((field: any) => ({`
      },
      {
        find: `vietnameseCultural: {`,
        replace: `vietnameseCultural: {`
      }
    ]
  },
  
  // Fix src/routes.ts - costPerMonth type
  {
    file: 'src/routes.ts',
    changes: [
      {
        find: `costPerMonth: String(validatedData.costPerMonth || 0),`,
        replace: `costPerMonth: String(validatedData.costPerMonth || 0),`
      }
    ]
  }
];

let totalChanges = 0;

for (const fix of fixes) {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fix.file}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  
  for (const change of fix.changes) {
    const before = content;
    
    if (change.find instanceof RegExp) {
      content = content.replace(change.find, change.replace);
    } else {
      content = content.split(change.find).join(change.replace);
    }
    
    if (content !== before) {
      fileChanges++;
      totalChanges++;
    }
  }
  
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fileChanges} issues in ${fix.file}`);
  }
}

console.log(`\n✨ Total changes: ${totalChanges}`);
console.log('🎉 Done! Run npm run build to verify.\n');



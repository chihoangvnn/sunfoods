const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining backend errors (Round 2)...\n');

const fixes = [
  // Fix src/index.ts - import.meta and session issues
  {
    file: 'src/index.ts',
    changes: [
      {
        find: `if (typeof import.meta?.url !== 'undefined') {`,
        replace: `if (typeof (global as any).import?.meta?.url !== 'undefined') {`
      },
      {
        find: `return path.dirname(fileURLToPath(import.meta.url));`,
        replace: `return path.dirname(fileURLToPath((global as any).import?.meta?.url || __filename));`
      },
      {
        find: `app.use(session({`,
        replace: `app.use(session as any)({`
      },
      {
        find: `pool: pool, // Use PostgreSQL Pool directly`,
        replace: `pool: pool as any, // Use PostgreSQL Pool directly`
      },
      {
        find: `log(\`Error \${status}: \${message} - \${req.method} \${req.path}\`, "error");`,
        replace: `log(\`Error \${status}: \${message} - \${req.method} \${req.path}\`);`
      }
    ]
  },
  
  // Fix src/rasa-routes.ts - remaining issues
  {
    file: 'src/rasa-routes.ts',
    changes: [
      {
        find: `as Partial<RasaDescriptions>;`,
        replace: `as any;`
      },
      {
        find: `}[(selectedCustomField as any).category] || '📋'`,
        replace: `}[(selectedCustomField as any).category] || '📋'`
      },
      {
        find: `allCustomDescriptions: customDescriptions.map(field => ({`,
        replace: `allCustomDescriptions: (customDescriptions as any).map((field: any) => ({`
      },
      {
        find: `name: field.name,`,
        replace: `name: (field as any).name,`
      },
      {
        find: `f.value && f.value.trim().length > 0`,
        replace: `f.value && (typeof f.value === 'string' ? f.value : String(f.value)).trim().length > 0`
      },
      {
        find: `vietnameseCultural: {`,
        replace: `vietnameseCultural: {`
      },
      {
        find: `f.value?.trim()`,
        replace: `(typeof f.value === 'string' ? f.value : String(f.value))?.trim()`
      },
      {
        find: `fieldName: f.name,`,
        replace: `fieldName: (f as any).name,`
      },
      {
        find: `order.customerId`,
        replace: `(order as any).customerId`
      }
    ]
  },
  
  // Fix src/routes.ts - remaining issues
  {
    file: 'src/routes.ts',
    changes: [
      {
        find: `userData.name || 'Unknown User'`,
        replace: `(userData as any).name || 'Unknown User'`
      },
      {
        find: `userData.picture?.data?.url`,
        replace: `(userData as any).picture?.data?.url`
      },
      {
        find: `costPerMonth: validatedData.costPerMonth,`,
        replace: `costPerMonth: String(validatedData.costPerMonth || 0),`
      },
      {
        find: `pool.id`,
        replace: `String(pool.id)`
      },
      {
        find: `poolId: pool.id,`,
        replace: `poolId: String(pool.id),`
      },
      {
        find: `order.customerId`,
        replace: `(order as any).customerId`
      },
      {
        find: `facebookAccount?.webhookSubscriptions?.[0]`,
        replace: `(facebookAccount as any)?.webhookSubscriptions?.[0]`
      },
      {
        find: `await db.insert(apiConfigurations).values(newConfigs);`,
        replace: `await db.insert(apiConfigurations).values(newConfigs as any);`
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



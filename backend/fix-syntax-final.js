const fs = require('fs');
const path = require('path');

// Fix syntax errors in storage.ts
const filePath = path.join(__dirname, 'src/storage.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove any invisible characters or encoding issues
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Fix method syntax issues - ensure proper method declarations
  content = content.replace(
    /async (\w+)\(([^)]*)\): Promise<([^>]+)> \{/g,
    'async $1($2): Promise<$3> {'
  );
  
  // Fix return statements
  content = content.replace(
    /return ([^;]+);/g,
    'return $1;'
  );
  
  // Fix variable declarations
  content = content.replace(
    /const (\[[^\]]+\]) = await ([^;]+);/g,
    'const $1 = await $2;'
  );
  
  // Fix if statements
  content = content.replace(
    /if \(([^)]+)\) \{/g,
    'if ($1) {'
  );
  
  // Fix method calls
  content = content.replace(
    /\.(\w+)\(([^)]*)\)/g,
    '.$1($2)'
  );
  
  // Ensure proper closing braces
  const lines = content.split('\n');
  let braceCount = 0;
  let inClass = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('export class DatabaseStorage')) {
      inClass = true;
    }
    
    if (inClass) {
      // Count braces
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      // If we're at the end of the class and brace count is not 0, add missing braces
      if (line.includes('export const storage = new DatabaseStorage()') && braceCount !== 0) {
        for (let j = 0; j < braceCount; j++) {
          lines.splice(i, 0, '}');
          i++;
        }
        break;
      }
    }
  }
  
  content = lines.join('\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed syntax errors in storage.ts');
  
} catch (error) {
  console.error('Error fixing storage.ts:', error.message);
}




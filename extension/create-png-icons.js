// Create minimal PNG icons for Chrome Extension testing
// This creates valid 1x1 PNG files that Chrome will accept

const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG in base64 (valid PNG file)
const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Create icon directory if it doesn't exist
const iconDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir);
}

// Create PNG files for all required sizes
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const filePath = path.join(iconDir, `icon${size}.png`);
  fs.writeFileSync(filePath, Buffer.from(minimalPngBase64, 'base64'));
  console.log(`Created minimal PNG: icon${size}.png`);
});

console.log('✅ Created minimal PNG icons for Chrome Extension testing');
console.log('📝 Note: These are 1x1 placeholder PNGs for development');
console.log('🎨 For production, convert the SVG files to proper PNG icons');
console.log('📖 See convert-to-png.md for detailed conversion instructions');
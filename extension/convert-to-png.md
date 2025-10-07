# Converting SVG Icons to PNG for Chrome Extension

The Chrome Extension requires PNG icons, but we have created SVG versions. Here are several ways to convert them to PNG format:

## Method 1: Online Converters
1. Go to https://svgtopng.com/ or similar online converter
2. Upload each SVG file (icon16.svg, icon32.svg, icon48.svg, icon128.svg)
3. Convert to PNG at the same dimensions
4. Save as icon16.png, icon32.png, icon48.png, icon128.png

## Method 2: ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Ubuntu: sudo apt install imagemagick
# macOS: brew install imagemagick
# Windows: Download from https://imagemagick.org/

# Convert all icons
convert icons/icon16.svg icons/icon16.png
convert icons/icon32.svg icons/icon32.png  
convert icons/icon48.svg icons/icon48.png
convert icons/icon128.svg icons/icon128.png
```

## Method 3: Inkscape (Command Line)
```bash
# Install Inkscape first
inkscape --export-type=png --export-filename=icons/icon16.png icons/icon16.svg
inkscape --export-type=png --export-filename=icons/icon32.png icons/icon32.svg
inkscape --export-type=png --export-filename=icons/icon48.png icons/icon48.svg
inkscape --export-type=png --export-filename=icons/icon128.png icons/icon128.svg
```

## Method 4: Node.js Script (if sharp is available)
```javascript
const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng(inputPath, outputPath, size) {
  await sharp(inputPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
}

// Convert all sizes
const sizes = [16, 32, 48, 128];
Promise.all(sizes.map(size => 
  convertSvgToPng(`icons/icon${size}.svg`, `icons/icon${size}.png`, size)
)).then(() => console.log('All icons converted!'));
```

## After Converting to PNG

1. **Update manifest.json** to reference .png files:
```json
{
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png", 
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png", 
      "128": "icons/icon128.png"
    }
  }
}
```

2. **Update popup.html** to reference .png file:
```html
<img src="icons/icon32.png" alt="Cookie Sync" class="logo">
```

## Quick Test Icons (Base64 Embedded)

For immediate testing, you can create simple 1x1 PNG files using base64:

```javascript
// Create minimal PNG files for testing
const fs = require('fs');

// 1x1 transparent PNG in base64
const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  fs.writeFileSync(`icons/icon${size}.png`, Buffer.from(pngData, 'base64'));
});
```

This creates working PNG files that Chrome will accept, though they'll be minimal placeholders.
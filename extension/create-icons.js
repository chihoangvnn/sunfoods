// Script to create simple SVG icons for the Chrome Extension
// Run this script to generate icon files

const fs = require('fs');
const path = require('path');

// SVG icon template (cookie/sync theme)
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.15}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.3}" fill="#FFFFFF"/>
  <circle cx="${size * 0.35}" cy="${size * 0.4}" r="${size * 0.05}" fill="#3B82F6"/>
  <circle cx="${size * 0.65}" cy="${size * 0.4}" r="${size * 0.05}" fill="#3B82F6"/>
  <circle cx="${size * 0.5}" cy="${size * 0.65}" r="${size * 0.03}" fill="#3B82F6"/>
  <path d="M ${size * 0.75} ${size * 0.25} L ${size * 0.85} ${size * 0.35} L ${size * 0.75} ${size * 0.45}" 
        stroke="#FFFFFF" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
</svg>`;
}

// Create icon directory if it doesn't exist
const iconDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir);
}

// Generate SVG icons
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(iconDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});

console.log('Icons created successfully!');
console.log('Note: Convert SVG files to PNG format for production use.');
console.log('You can use online converters or tools like ImageMagick.');
const fs = require('node:fs');
const path = require('node:path');

// Simple PNG resize by creating a copy for now
// In production, use sharp or similar for proper resizing
const sourceIcon = path.resolve(__dirname, '..', 'public', 'icons', 'icon.png');
const icon192 = path.resolve(__dirname, '..', 'public', 'icons', 'icon-192.png');
const iconMaskable = path.resolve(__dirname, '..', 'public', 'icons', 'icon-maskable.png');

// Copy icon.png as icon-maskable.png (same source for now)
if (fs.existsSync(sourceIcon)) {
  if (!fs.existsSync(icon192)) {
    fs.copyFileSync(sourceIcon, icon192);
    console.log('Created icon-192.png (copy — resize manually or with sharp for production)');
  }

  if (!fs.existsSync(iconMaskable)) {
    fs.copyFileSync(sourceIcon, iconMaskable);
    console.log('Created icon-maskable.png (copy — adjust safe area for production)');
  }
}

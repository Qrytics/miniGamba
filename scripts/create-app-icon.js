#!/usr/bin/env node
/**
 * Creates app icon from source image - squishes vertically to fit square aspect ratio.
 * Run: npm run create-icon
 */

const path = require('path');
const fs = require('fs');

async function createIcon() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.error('Error: sharp not found. Run: npm install');
    process.exit(1);
  }

  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'assets', 'icon-source.png');
  const outPng = path.join(root, 'assets', 'icon.png');

  if (!fs.existsSync(src)) {
    console.error('Source image not found at:', src);
    process.exit(1);
  }

  // Squish vertically: resize to 256x256 (fill stretches to fit - portrait becomes square)
  await sharp(src)
    .resize(256, 256, { fit: 'fill' })
    .png()
    .toFile(outPng);

  console.log('Created', outPng);
  console.log('Done. Use assets/icon.png for tray and dashboard.');
}

createIcon().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Конвертирует крупные PNG в WebP для ускорения загрузки.
 * Требует: npm install sharp
 */
const fs = require('fs');
const path = require('path');

const PNGs = ['hero-bg', 'hero-collage', 'banner-bg', 'slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5', 'slide-6', 'slide-7'];
const srcDir = path.join(__dirname, '../public/images');
const outDir = process.env.OUT_DIR || path.join(__dirname, '../dist/images');

async function convert() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('sharp не установлен. Запустите: npm install sharp --save-dev');
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  for (const name of PNGs) {
    const src = path.join(srcDir, `${name}.png`);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(outDir, `${name}.webp`);
    await sharp(src).webp({ quality: 82 }).toFile(dest);
    console.log(`${name}.png → ${name}.webp`);
  }
}

convert().catch((e) => { console.error(e); process.exit(1); });

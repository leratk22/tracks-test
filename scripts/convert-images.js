#!/usr/bin/env node
/**
 * Конвертирует крупные PNG в WebP с несколькими размерами для responsive images.
 * Требует: npm install sharp
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../public/images');
const outDir = process.env.OUT_DIR || path.join(__dirname, '../dist/images');

const config = {
  'hero-bg': { widths: [800, 1600], quality: 82 },
  'hero-collage': { widths: [700, 1200], quality: 82 },
  'banner-bg': { widths: [800, 1400], quality: 82 },
  'slide-1': { widths: [400, 600], quality: 80 },
  'slide-2': { widths: [400, 600], quality: 80 },
  'slide-3': { widths: [400, 600], quality: 80 },
  'slide-4': { widths: [400, 600], quality: 80 },
  'slide-5': { widths: [400, 600], quality: 80 },
  'slide-6': { widths: [343, 496], quality: 80 },
  'slide-7': { widths: [400, 600], quality: 80 },
};

async function convert() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('sharp не установлен. Запустите: npm install sharp --save-dev');
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });

  for (const [name, cfg] of Object.entries(config)) {
    const src = path.join(srcDir, `${name}.png`);
    if (!fs.existsSync(src)) continue;

    const meta = await sharp(src).metadata();
    const maxW = Math.min(meta.width || 2000, ...cfg.widths.map((w) => Math.max(w, 100)));

    for (const w of cfg.widths) {
      const origW = meta.width || 2000;
      const targetW = Math.min(w, origW);
      const dest = path.join(outDir, `${name}-${targetW}w.webp`);
      await sharp(src).resize(targetW).webp({ quality: cfg.quality }).toFile(dest);
      console.log(`${name}.png → ${name}-${targetW}w.webp`);
    }
  }
}

convert().catch((e) => { console.error(e); process.exit(1); });

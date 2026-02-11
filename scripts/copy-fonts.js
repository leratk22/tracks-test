#!/usr/bin/env node
/**
 * Копирует Euclid Circular A из "../Euclid Circular A (1)/..." в public/fonts
 */
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..');
const srcDir = path.join(projectDir, '..', 'Euclid Circular A (1)', 'Euclid Circular A pack', 'web files');
const dstDir = path.join(projectDir, 'public', 'fonts');

const files = [
  'EuclidCircularA-Regular-WebS.woff2',
  'EuclidCircularA-Medium-WebM.woff2',
  'EuclidCircularA-Semibold-WebM.woff2',
  'EuclidCircularA-Semibold-WebS.woff2',
];

if (!fs.existsSync(srcDir)) {
  console.error('Папка с шрифтами не найдена:', srcDir);
  process.exit(1);
}

fs.mkdirSync(dstDir, { recursive: true });
let copied = 0;
for (const f of files) {
  const src = path.join(srcDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dstDir, f));
    console.log('Copied', f);
    copied++;
  }
}
console.log(`Скопировано ${copied} файлов в ${dstDir}`);

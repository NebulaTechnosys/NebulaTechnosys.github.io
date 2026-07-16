#!/usr/bin/env node
/** Copies only deployable site files into dist/ for GitHub Pages. */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const COPY = ['index.html', 'portfolio.html', 'css', 'js', 'images', 'gallery.json', '.nojekyll'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST);

for (const item of COPY) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  copyRecursive(src, path.join(DIST, item));
}

console.log('Prepared dist/ for deployment.');

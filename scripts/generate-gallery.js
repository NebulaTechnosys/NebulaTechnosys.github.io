#!/usr/bin/env node
/**
 * Scans images/prints/ and generates gallery.json with dimensions for masonry layout.
 * Run: node scripts/generate-gallery.js  (or npm run build)
 * Just drop images into images/prints/ — no manual listing needed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'site.config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const PRINTS_DIR = path.join(ROOT, config.imagesDir || 'images/prints');
const OUTPUT = path.join(ROOT, 'gallery.json');
const PUBLIC_CONFIG = path.join(ROOT, 'js', 'site-config.json');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function readUInt32BE(buf, offset) {
  return buf.readUInt32BE(offset);
}

function getImageSize(filePath) {
  const buf = fs.readFileSync(filePath);

  // PNG: IHDR chunk at byte 16
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: readUInt32BE(buf, 16), height: readUInt32BE(buf, 20) };
  }

  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  // JPEG: scan for SOF markers
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      const len = buf.readUInt16BE(i + 2);
      i += 2 + len;
    }
  }

  // WebP: RIFF....WEBP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') {
      const w = buf.readUInt16LE(26) & 0x3fff;
      const h = buf.readUInt16LE(28) & 0x3fff;
      return { width: w, height: h };
    }
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') {
      const w = 1 + buf.readUIntLE(24, 3);
      const h = 1 + buf.readUIntLE(27, 3);
      return { width: w, height: h };
    }
  }

  return null;
}

function scanImages(dir, basePath = '') {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(basePath, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      images.push(...scanImages(fullPath, relPath));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      images.push({ fullPath, relPath });
    }
  }

  return images;
}

function buildGallery() {
  const found = scanImages(PRINTS_DIR);
  const gallery = [];

  for (const { fullPath, relPath } of found) {
    try {
      const dims = getImageSize(fullPath);
      if (!dims || !dims.width || !dims.height) {
        console.warn(`Skipping ${relPath}: could not read dimensions`);
        continue;
      }
      const webPath = `${config.imagesDir}/${relPath}`.replace(/\\/g, '/');
      gallery.push({
        src: webPath,
        width: dims.width,
        height: dims.height,
        aspectRatio: +(dims.width / dims.height).toFixed(4),
        filename: path.basename(relPath)
      });
    } catch (err) {
      console.warn(`Skipping ${relPath}: ${err.message}`);
    }
  }

  gallery.sort((a, b) => a.filename.localeCompare(b.filename));

  fs.writeFileSync(OUTPUT, JSON.stringify(gallery, null, 2));
  console.log(`Generated gallery.json with ${gallery.length} image(s).`);

  const publicConfig = {
    companyName: config.companyName,
    tagline: config.tagline,
    description: config.description,
    email: config.email,
    phone: config.phone,
    whatsapp: config.whatsapp,
    web3formsAccessKey: config.web3formsAccessKey,
    logo: config.logo,
    map: config.map,
    social: config.social,
    galleryCount: gallery.length
  };

  fs.writeFileSync(PUBLIC_CONFIG, JSON.stringify(publicConfig, null, 2));
  console.log('Updated js/site-config.json');
}

buildGallery();

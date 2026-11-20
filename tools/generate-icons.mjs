// =====================================================
// توليد أيقونات التطبيق (PNG) دون مكتبات خارجية: شبكة وفق 3×3 على خلفية متدرجة
// التشغيل: node tools/generate-icons.mjs
// =====================================================
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// تغطية مضادة للتسنن: نسبة العينات داخل الشكل
function coverage(x, y, inside, samples = 4) {
  let hit = 0;
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < samples; j++) {
      if (inside(x + (i + 0.5) / samples, y + (j + 0.5) / samples)) {
        hit++;
      }
    }
  }
  return hit / (samples * samples);
}

function roundedRect(px, py, x0, y0, x1, y1, r) {
  const cx = Math.min(Math.max(px, x0 + r), x1 - r);
  const cy = Math.min(Math.max(py, y0 + r), y1 - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r && px >= x0 && px <= x1 && py >= y0 && py <= y1;
}

function icon(size, {padding = 0} = {}) {
  const s = size;
  const p = padding * s;
  const bg = (px, py) => roundedRect(px, py, p, p, s - p, s - p, s * 0.2);
  const inner = s - 2 * p;
  const gridX0 = p + inner * 0.2;
  const cell = inner * 0.6 / 3;
  const gap = cell * 0.14;
  const highlight = [1, 1];
  return encodePng(s, (x, y) => {
    const a = coverage(x, y, bg);
    if (a === 0) {
      return [0, 0, 0, 0];
    }
    // تدرج من الأزرق الفاتح إلى الداكن
    const t = (x + y) / (2 * s);
    let r = Math.round(14 + (2 - 14) * t);
    let g = Math.round(165 + (132 - 165) * t);
    let b = Math.round(233 + (199 - 233) * t);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cx0 = gridX0 + j * cell + gap / 2;
        const cy0 = gridX0 + i * cell + gap / 2;
        const inCell = (px, py) => roundedRect(px, py, cx0, cy0, cx0 + cell - gap, cy0 + cell - gap, cell * 0.18);
        const c = coverage(x, y, inCell);
        if (c > 0) {
          const isHi = i === highlight[0] && j === highlight[1];
          const fill = isHi ? [234, 179, 8] : [255, 255, 255];
          const alpha = (isHi ? 1 : 0.92) * c;
          r = Math.round(r * (1 - alpha) + fill[0] * alpha);
          g = Math.round(g * (1 - alpha) + fill[1] * alpha);
          b = Math.round(b * (1 - alpha) + fill[2] * alpha);
        }
      }
    }
    return [r, g, b, Math.round(255 * a)];
  });
}

const outputs = [
  ['frontend/public/pwa-192x192.png', icon(192)],
  ['frontend/public/pwa-512x512.png', icon(512)],
  ['frontend/public/apple-touch-icon.png', icon(180)],
  ['frontend/public/favicon.png', icon(64)],
  ['desktop/icon.png', icon(512)]
];
for (const [file, png] of outputs) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, png);
  console.log(`${file} (${png.length} bytes)`);
}

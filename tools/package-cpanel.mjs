// =====================================================
// حزمة النشر على cPanel: ملف zip من frontend/dist جاهز للرفع
// التشغيل: npm run package:cpanel  (يبني الموقع أولاً ثم يحزمه)
// الناتج: release/quran-numerical-studies-cpanel-<الإصدار>-<التاريخ>.zip
// دون مكتبات خارجية: كتابة zip بضغط deflate من zlib المدمجة في Node
// =====================================================
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'frontend', 'dist');
const outDir = path.join(root, 'release');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('frontend/dist غير موجود. شغّل: npm run build');
  process.exit(1);
}

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

// تاريخ ووقت بصيغة DOS المطلوبة في zip
function dosDateTime(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return {time: time, date: day};
}

function listFiles(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      out.push(...listFiles(full, base));
    } else {
      out.push({full: full, name: path.relative(base, full).split(path.sep).join('/')});
    }
  }
  return out;
}

const files = listFiles(distDir);
const now = dosDateTime(new Date());
const localParts = [];
const centralParts = [];
let offset = 0;

for (const file of files) {
  const data = fs.readFileSync(file.full);
  const compressed = zlib.deflateRawSync(data, {level: 9});
  const useDeflate = compressed.length < data.length;
  const body = useDeflate ? compressed : data;
  const nameBuf = Buffer.from(file.name, 'utf8');
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(useDeflate ? 8 : 0, 8);
  local.writeUInt16LE(now.time, 10);
  local.writeUInt16LE(now.date, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);
  local.writeUInt16LE(0, 28);
  localParts.push(local, nameBuf, body);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(useDeflate ? 8 : 0, 10);
  central.writeUInt16LE(now.time, 12);
  central.writeUInt16LE(now.date, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(body.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, nameBuf);

  offset += local.length + nameBuf.length + body.length;
}

const centralBuf = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);

const stamp = new Date().toISOString().slice(0, 10);
const zipName = `quran-numerical-studies-cpanel-${version}-${stamp}.zip`;
fs.mkdirSync(outDir, {recursive: true});
const zipPath = path.join(outDir, zipName);
fs.writeFileSync(zipPath, Buffer.concat([...localParts, centralBuf, end]));

const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`release/${zipName} (${files.length} files, ${sizeMb} MB)`);
console.log('ارفعه إلى مجلد الموقع في cPanel ثم فك ضغطه هناك (Extract).');

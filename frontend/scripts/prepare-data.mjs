// =====================================================
// تجهيز البيانات للواجهة: يحوّل ملفات data/*.js (المصدر الوحيد)
// إلى JSON في public/data/ ليحمّلها المتصفح ويحفظها للعمل دون إنترنت
// =====================================================
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseDataFile, DATA_FILES} from '../../packages/core/src/data-file.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '..', '..', 'data');
const outDir = path.resolve(here, '..', 'public', 'data');

fs.mkdirSync(outDir, {recursive: true});

for (const [key, file] of Object.entries(DATA_FILES)) {
  const source = path.join(dataDir, file);
  const target = path.join(outDir, `${key}.json`);
  const sourceTime = fs.statSync(source).mtimeMs;
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= sourceTime) {
    continue;
  }
  const rows = parseDataFile(fs.readFileSync(source, 'utf8'));
  fs.writeFileSync(target, JSON.stringify(rows));
  console.log(`data/${file} -> public/data/${key}.json (${rows.length} rows)`);
}

// =====================================================
// خادم API اختياري (للتطبيقات الخارجية والهاتف مستقبلاً)
// الموقع والبرنامج لا يحتاجانه: الحساب يجري في المتصفح من @jummal/core
// لا قاعدة بيانات: البيانات من ملفات data/ تُحمَّل في الذاكرة عند التشغيل
// =====================================================
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as core from '@jummal/core';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '..', 'data');
const distDir = path.resolve(here, '..', 'frontend', 'dist');
const port = Number(process.env.PORT) || 3000;

const loadData = (file) => core.parseDataFile(fs.readFileSync(path.join(dataDir, file), 'utf8'));

console.log('Loading data files into memory...');
const swar = loadData(core.DATA_FILES.swar);
const ayat = loadData(core.DATA_FILES.ayat);
const words = loadData(core.DATA_FILES.words);
console.log(`Loaded ${swar.length} surahs, ${ayat.length} ayat, ${words.length} words.`);

const app = express();
app.use(cors());
app.use(express.json());

const api = express.Router();
const toInt = (value) => parseInt(value, 10);
const notFound = (res, what) => res.status(404).json({error: `${what} not found`});

api.get('/ping', (req, res) => {
  res.json({ok: true});
});

// ---------- السور والآيات والكلمات ----------
api.get('/swar', (req, res) => {
  res.json(swar);
});

api.get('/swar/:id', (req, res) => {
  const surah = swar.find(s => s.swarId === toInt(req.params.id));
  if (!surah) {
    return notFound(res, 'Surah');
  }
  res.json(surah);
});

api.get('/swar/:id/ayat', (req, res) => {
  res.json(ayat.filter(a => a.swarId === toInt(req.params.id)));
});

api.get('/ayat', (req, res) => {
  const surahId = toInt(req.query.surah);
  res.json(surahId ? ayat.filter(a => a.swarId === surahId) : ayat);
});

api.get('/ayat/search', (req, res) => {
  if (!req.query.q) {
    return res.status(400).json({error: 'Query parameter "q" is required'});
  }
  res.json(core.searchAyat(ayat, String(req.query.q), toInt(req.query.limit) || 200));
});

api.get('/ayat/:id', (req, res) => {
  const ayah = ayat.find(a => a.ayatId === toInt(req.params.id));
  if (!ayah) {
    return notFound(res, 'Ayah');
  }
  res.json(ayah);
});

api.get('/qwords', (req, res) => {
  const page = toInt(req.query.page) || 1;
  const limit = toInt(req.query.limit) || 100;
  res.json({total: words.length, page: page, limit: limit, data: words.slice((page - 1) * limit, page * limit)});
});

api.get('/qwords/:id', (req, res) => {
  const word = words.find(w => w.id === toInt(req.params.id));
  if (!word) {
    return notFound(res, 'Word');
  }
  res.json(word);
});

// ---------- تحليلات القرآن ----------
api.get('/analysis/characters/surah/:id', (req, res) => {
  const result = core.analyzeSurahCharacters(ayat, toInt(req.params.id));
  if (!result) {
    return notFound(res, 'Surah');
  }
  res.json(result);
});

api.get('/analysis/characters/ayah/:id', (req, res) => {
  const result = core.analyzeAyahCharacters(ayat, toInt(req.params.id));
  if (!result) {
    return notFound(res, 'Ayah');
  }
  res.json(result);
});

api.get('/analysis/symmetric-chapters/:id', (req, res) => {
  const result = core.symmetricChapters(swar, toInt(req.params.id));
  if (!result) {
    return res.status(400).json({error: 'Invalid Surah ID'});
  }
  res.json(result);
});

api.get('/analysis/symmetric-words', (req, res) => {
  const {word1, word2} = req.query;
  if (!word1 || !word2) {
    return res.status(400).json({error: 'Please provide both word1 and word2 parameters'});
  }
  res.json(core.symmetricWords(ayat, String(word1), String(word2), req.query.tashkil === 'true'));
});

api.get('/analysis/symmetric-verses/:surah/:start', (req, res) => {
  const result = core.symmetricVerses(ayat, toInt(req.params.surah), toInt(req.params.start));
  if (!result) {
    return res.status(400).json({error: 'Invalid surah or start ayah'});
  }
  res.json(result);
});

api.get('/analysis/letter', (req, res) => {
  const result = core.studyLetter(swar, ayat, String(req.query.char || ''));
  if (!result) {
    return res.status(400).json({error: 'Unknown letter (use one of the 28 base letters)'});
  }
  res.json(result);
});

// ---------- إحصاءات السور والحروف (تُحسب مرة عند أول طلب) ----------
let chapterStatsCache = null;
let letterStatsCache = null;

api.get('/stats/chapters', (req, res) => {
  if (!chapterStatsCache) {
    chapterStatsCache = core.chapterStats(swar, ayat);
  }
  res.json(chapterStatsCache);
});

api.get('/stats/letters', (req, res) => {
  if (!letterStatsCache) {
    letterStatsCache = core.letterStats(swar, ayat);
  }
  res.json(letterStatsCache);
});

// ---------- الجمّل والجداول ----------
api.get('/jummal', (req, res) => {
  const clean = core.cleanArabicText(String(req.query.text || ''));
  res.json({text: clean, values: core.calculateTriple(clean), stats: core.computeTextStats(clean)});
});

api.get('/tables', (req, res) => {
  res.json(core.tablesData.map((t, index) => ({index: index, name: t.name, group: t.group, values: t.values})));
});

api.get('/tables/calculate', (req, res) => {
  const clean = core.cleanArabicText(String(req.query.text || ''));
  const indexes = String(req.query.tables || '0').split(',').map(toInt).filter(i => core.tablesData[i]);
  res.json({
    text: clean,
    results: indexes.map(i => Object.assign({index: i, name: core.tablesData[i].name}, core.calculateWords(clean, core.tablesData[i].values)))
  });
});

// ---------- الأوفاق ودراسة الرقم والبحث ----------
api.get('/wefq/:shape/:number', (req, res) => {
  const n = toInt(req.params.number);
  const study = core.studyWefeqNumber(n, req.params.shape);
  if (!core.WEFEQ_MAGIC_CONSTANTS[req.params.shape] || !study.possible) {
    return res.status(400).json({error: study.message || 'Unknown shape'});
  }
  const result = core.generateWefeq(n, req.params.shape);
  res.json(Object.assign({study: study, info: core.buildWefeqInfoRows(result, req.params.shape)}, result));
});

api.get('/number/:number', (req, res) => {
  const n = toInt(req.params.number);
  if (!(n >= 1 && n <= 10000000)) {
    return res.status(400).json({error: 'Number must be between 1 and 10,000,000'});
  }
  res.json(core.studyNumber(n));
});

api.get('/words/search', (req, res) => {
  const types = String(req.query.types || 'jummal').split(',');
  res.json(core.findWordsByValue(words, toInt(req.query.value), {
    jummal: types.includes('jummal'),
    abjad: types.includes('abjad'),
    ayqagh: types.includes('ayqagh')
  }));
});

app.use('/api', api);

// تقديم الواجهة المبنية إن وُجدت (تشغيل كامل من خادم واحد)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}/api`);
});

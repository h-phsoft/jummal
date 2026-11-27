// =====================================================
// واجهة البيانات المحلية: مسارات بشكل /api تُحسب كلها في المتصفح
// من @jummal/core وملفات البيانات، فلا حاجة لخادم ولا لقاعدة بيانات
// =====================================================
import * as core from '@jummal/core';
import {loadSwar, loadAyat, loadWords, loadLetters} from './data.js';

const toInt = (value) => parseInt(value, 10);

// «2:255:3:0» ← {surah: 2, ayah: 255, word: 3, char: 0}
function parsePoint(value) {
  const [surah, ayah, word, char] = String(value || '').split(':').map(toInt);
  return {surah: surah, ayah: ayah, word: word, char: char};
}

// إحصاءات السور والحروف تُحسب مرة واحدة لكل جلسة
const memo = new Map();
function once(key, compute) {
  if (!memo.has(key)) {
    memo.set(key, compute());
  }
  return memo.get(key);
}
const loadChapterStats = () => once('chapters', async () => core.chapterStats(await loadSwar(), await loadAyat()));
const loadLetterStats = () => once('letters', async () => core.letterStats(await loadSwar(), await loadAyat(), await loadLetters()));

// كل مسار: نمط + دالة تُرجع النتيجة
const routes = [
  [/^\/api\/swar$/, async () => loadSwar()],
  [/^\/api\/swar\/(\d+)$/, async (m) => (await loadSwar()).find(s => s.swarId === toInt(m[1])) || null],
  [/^\/api\/swar\/(\d+)\/ayat$/, async (m) => (await loadAyat()).filter(a => a.swarId === toInt(m[1]))],
  [/^\/api\/ayat$/, async (m, q) => {
    const ayat = await loadAyat();
    const surah = toInt(q.get('surah'));
    return surah ? ayat.filter(a => a.swarId === surah) : ayat;
  }],
  [/^\/api\/ayat\/search$/, async (m, q) => core.searchAyat(await loadAyat(), q.get('q') || '', toInt(q.get('limit')) || 200)],
  [/^\/api\/ayat\/(\d+)$/, async (m) => (await loadAyat()).find(a => a.ayatId === toInt(m[1])) || null],
  [/^\/api\/analysis\/characters\/surah\/(\d+)$/, async (m) => core.analyzeSurahCharacters(await loadAyat(), toInt(m[1]), await loadSwar())],
  [/^\/api\/analysis\/characters\/ayah\/(\d+)$/, async (m) => core.analyzeAyahCharacters(await loadAyat(), toInt(m[1]), await loadSwar())],
  [/^\/api\/analysis\/symmetric-chapters\/(\d+)$/, async (m) => core.symmetricChapters(await loadSwar(), toInt(m[1]))],
  [/^\/api\/analysis\/symmetric-words$/, async (m, q) => core.symmetricWords(
    await loadAyat(), q.get('word1') || '', q.get('word2') || '', q.get('tashkil') === 'true'
  )],
  [/^\/api\/stats\/chapters$/, async () => loadChapterStats()],
  [/^\/api\/letters$/, async () => loadLetters()],
  [/^\/api\/stats\/letters$/, async () => loadLetterStats()],
  [/^\/api\/analysis\/letter$/, async (m, q) => core.studyLetter(await loadSwar(), await loadAyat(), q.get('char') || '', await loadLetters())],
  [/^\/api\/analysis\/symmetric-verses\/(\d+)\/(\d+)$/, async (m) => core.symmetricVerses(await loadAyat(), toInt(m[1]), toInt(m[2]))],
  // مقطع: start و end بالشكل سورة:آية:كلمة:حرف (الكلمة والحرف اختياريان)
  [/^\/api\/analysis\/range$/, async (m, q) => {
    const range = core.quranRange(await loadAyat(), parsePoint(q.get('start')), parsePoint(q.get('end')));
    return range.error ? {error: range.error} : core.rangeStats(range);
  }],
  [/^\/api\/words\/search$/, async (m, q) => {
    const types = (q.get('types') || 'jummal').split(',');
    return core.findWordsByValue(await loadWords(), toInt(q.get('value')), {
      jummal: types.includes('jummal'),
      abjad: types.includes('abjad'),
      ayqagh: types.includes('ayqagh')
    });
  }]
];

// apiGet('/api/swar') ← مثل fetch(...).then(r => r.json()) لكن محلياً
export async function apiGet(url) {
  const parsed = new URL(url, 'http://local');
  for (const [pattern, handler] of routes) {
    const match = parsed.pathname.match(pattern);
    if (match) {
      return handler(match, parsed.searchParams);
    }
  }
  throw new Error(`Unknown local API path: ${parsed.pathname}`);
}

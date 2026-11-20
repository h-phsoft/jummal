// اختبارات النواة: نتائج معروفة + مطابقة الكود القديم + سلامة البيانات
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as core from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const readData = (file) => core.parseDataFile(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
const ayat = readData(core.DATA_FILES.ayat);
const words = readData(core.DATA_FILES.words);
const swar = readData(core.DATA_FILES.swar);

// تشغيل ملف قديم (سكربت عام) داخل سياق معزول لمقارنة النتائج
function loadLegacy(relPath, names) {
  const src = fs.readFileSync(path.join(here, 'legacy', relPath), 'utf8');
  const ctx = {$: () => ({on() {}}), document: {getElementById: () => null}, CSS: {supports: () => false}};
  vm.createContext(ctx);
  vm.runInContext(src + `;globalThis.__out = {${names}};`, ctx);
  // نتائج السياق المعزول تُحوَّل إلى قيم عادية قبل المقارنة
  const plain = (fn) => (...args) => JSON.parse(JSON.stringify(fn(...args)));
  return Object.fromEntries(Object.entries(ctx.__out).map(([k, fn]) => [k, plain(fn)]));
}

function lines(sq) {
  const n = sq.length;
  const rows = sq.map(r => r.reduce((a, b) => a + b, 0));
  const cols = sq[0].map((_, j) => sq.reduce((a, r) => a + r[j], 0));
  const d1 = sq.reduce((a, r, i) => a + r[i], 0);
  const d2 = sq.reduce((a, r, i) => a + r[n - 1 - i], 0);
  return [...rows, ...cols, d1, d2];
}

test('letters: known values and 28-letter normalisation', () => {
  assert.deepEqual(core.calculateTriple('بسم الله الرحمن الرحيم'), {jummal: 786, abjadi: 192, iqghy: 66, triple: 1044});
  assert.equal(core.cleanArabicText('يؤمنون'), 'يومنون');
  assert.equal(core.cleanArabicText('قل هو الله أحد'), 'قل هو الله احد');
  assert.equal(core.cleanArabicText('السماء'), 'السما');
  assert.equal(core.calculateTriple(core.cleanArabicText('قل هو الله أحد')).jummal, 220);
});

test('tables: 35 tables of 28 values, first three are the base tables', () => {
  assert.equal(core.tablesData.length, 35);
  core.tablesData.forEach(t => assert.equal(t.values.length, 28, t.name));
  assert.deepEqual(core.tablesData[0].values, core.JUMMAL_VALUES);
  assert.equal(core.calculateWords('محمد علي', core.tablesData[0].values).total, 202);
});

test('wefq: 4x4..9x9 complete for every number, triangle complete when divisible by 3', () => {
  for (const shape of Object.keys(core.WEFEQ_MAGIC_CONSTANTS)) {
    const min = core.WEFEQ_MAGIC_CONSTANTS[shape];
    for (let N = min; N <= min + 1500; N++) {
      const r = core.generateWefeq(N, shape);
      const n = r.square.length;
      assert.equal(new Set(r.square.flat()).size, n * n, `${shape} ${N} duplicates`);
      const bad = lines(r.square).filter(x => x !== N).length;
      if (shape === 'triangle') {
        assert.equal(bad, r.fraction === 0 ? 0 : 1, `triangle ${N}`);
      } else {
        assert.equal(bad, 0, `${shape} ${N}`);
      }
    }
  }
  assert.deepEqual(core.generateWefeq(15, 'triangle').square, [[8, 1, 6], [3, 5, 7], [4, 9, 2]]);
});

test('text stats', () => {
  const s = core.computeTextStats(core.cleanArabicText('بسم الله الرحمن الرحيم'));
  assert.equal(s.total, 19);
  assert.equal(s.unique, 10);
  assert.equal(s.counts['ل'], 4);
});

test('number study matches the legacy implementation', () => {
  const old = loadLegacy('number-study.js', 'getDivisors, getPrimeFactors, isPrime, getPrimeRank, getPrimeRankSameOnes, getFibonacciRank, getDigitalRootSteps, isPerfectNumber, generateDecompositionTree');
  for (let n = 1; n <= 3000; n++) {
    const s = core.studyNumber(n);
    assert.deepEqual(s.divisors, old.getDivisors(n), `divisors ${n}`);
    assert.deepEqual(s.primeFactors, old.getPrimeFactors(n), `factors ${n}`);
    assert.equal(s.prime, old.isPrime(n));
    assert.equal(s.fibonacciRank, old.getFibonacciRank(n), `fib ${n}`);
    assert.deepEqual(s.digitalRoot, old.getDigitalRootSteps(n));
    assert.equal(s.perfect, old.isPerfectNumber(n));
    if (s.prime) {
      assert.equal(s.primeRanks.rank, old.getPrimeRank(n));
      assert.equal(s.primeRanks.sameOnes, old.getPrimeRankSameOnes(n));
    }
  }
  for (const n of [1, 2, 7, 92, 100, 255]) {
    const html = old.generateDecompositionTree(n)[1];
    const d = core.decompositionCounts(n);
    assert.ok(html.includes(`<span class="fw-bold text-dark">${d.totalNodes}</span>`), `nodes ${n}`);
    assert.ok(html.includes(`= <span class="text-primary">${d.total}</span>`), `total ${n}`);
  }
});

test('word search', () => {
  const r = core.findWordsByValue(words, 92, {jummal: true, abjad: false, ayqagh: false});
  assert.equal(r.counts.total, 27);
  assert.equal(r.items[0].text, 'اعيدوا');
});

test('quran analysis (from PhsQuran) works on the data', () => {
  const fatiha = core.analyzeSurahCharacters(ayat, 1);
  assert.equal(fatiha.totalAyahs, 7);
  const sym = core.symmetricChapters(swar, 1);
  assert.equal(sym.rightArray.length, 57);
  assert.equal(sym.leftArray[0].id, 114);
  const w = core.symmetricWords(ayat, 'الله', 'الرحمن', false);
  assert.ok(w.Counts[0] > 2000);
});

test('data integrity: counts, stored word values, 28-letter text', () => {
  assert.equal(ayat.length, 6236);
  assert.equal(swar.length, 114);
  assert.equal(words.length, 13152);
  words.forEach(w => {
    const t = core.calculateTriple(w.text28);
    assert.deepEqual([t.jummal, t.abjadi, t.iqghy], [w.jummal, w.abjad, w.ayqagh], w.text28);
  });
  const mismatch = ayat.filter(a => core.cleanArabicText(a.ayatOText) !== a.ayat28Text).map(a => `${a.swarId}:${a.ayatNum}`);
  assert.deepEqual(mismatch, ['40:13']);
  const a319 = ayat.find(a => a.swarId === 3 && a.ayatNum === 19);
  assert.equal(core.calculateTriple(a319.ayat28Text).jummal, 6417);
});

// تشغيل ملفات PhsQuran المحسوبة مسبقاً (Q01/Q02) للمقارنة
function loadPhsQuranFixtures() {
  const ctx = {};
  vm.createContext(ctx);
  for (const file of ['Q01Characters.js', 'Q02Chapters.js']) {
    const src = fs.readFileSync(path.join(root, 'legacy/phsquran-js', file), 'utf8').replace(/var /g, 'globalThis.');
    vm.runInContext(src, ctx);
  }
  return JSON.parse(JSON.stringify({chapters: ctx.jaChapters, letters: ctx.jCharacters}));
}

test('chapter and letter stats match PhsQuran precomputed files (except the 3:19 fix)', () => {
  const old = loadPhsQuranFixtures();
  const ch = core.chapterStats(swar, ayat);
  assert.equal(ch.rows.length, 114);
  assert.equal(ch.totals.Vs, 6236);
  assert.equal(ch.totals.Cs, 322604);
  ch.rows.forEach((r, i) => {
    const o = old.chapters[i];
    assert.deepEqual([r.Vs, r.FC, r.LC, r.TO], [o.Vs, o.FC, o.LC, o.TO], `surah ${r.CpNo}`);
    // آل عمران فيها حرف غين زائد بعد تصحيح 3:19
    const ghain = r.CpNo === 3 ? 1 : 0;
    assert.equal(r.Cs, o.Cs + ghain, `surah ${r.CpNo} letters`);
    r.letters.forEach((c, j) => assert.equal(c, o['Ch' + (j + 1)] + (j === 27 ? ghain : 0), `surah ${r.CpNo} letter ${j + 1}`));
  });

  const ls = core.letterStats(swar, ayat);
  ls.rows.forEach((r, i) => {
    const o = old.letters[i];
    const ghain = r.Char === 'غ' ? 1 : 0;
    assert.deepEqual([r.Count, r.FCs, r.LCs, r.FLCs, r.FVs, r.LVs, r.FLVs], [o.Count + ghain, o.FCs, o.LCs, o.FLCs, o.FVs, o.LVs, o.FLVs], r.Char);
    // في الملف القديم كان الحقلان معكوسين: UVs = آيات ليس فيها الحرف
    // (الآية 3:19 صار فيها غين بعد التصحيح فنقصت آيات "بلا غين" واحدة)
    assert.equal(r.versesWithout, o.UVs - ghain, r.Char);
    assert.equal(r.versesWith + r.versesWithout, 6236);
  });
});

test('study letter, mirror index and symmetric verses', () => {
  const alef = core.studyLetter(swar, ayat, 'ا');
  assert.equal(alef.Count, 52655);
  assert.equal(alef.chapters.length, 114);
  assert.ok(alef.percent > 0.16 && alef.percent < 0.17);
  assert.equal(core.studyLetter(swar, ayat, 'x'), null);

  assert.equal(core.mirrorIndex(0, 1, 114), 113);
  assert.equal(core.mirrorIndex(5, 5, 114), 5);
  assert.equal(core.mirrorIndex(0, 57, 114), 57);

  const fatiha = core.symmetricVerses(ayat, 1, 1);
  assert.equal(fatiha.rightArray.length + fatiha.leftArray.length, 7);
  assert.deepEqual(fatiha.rightArray.map(a => a.num), [1, 2, 3, 4]);
  assert.deepEqual(fatiha.leftArray.map(a => a.num), [7, 6, 5]);
  const baqarah = core.symmetricVerses(ayat, 2, 10);
  assert.equal(baqarah.rightArray[0].num, 10);
  assert.equal(baqarah.leftArray[0].num, 9);
  assert.equal(baqarah.rightArray.length + baqarah.leftArray.length, 286);
  assert.equal(core.symmetricVerses(ayat, 1, 99), null);
});

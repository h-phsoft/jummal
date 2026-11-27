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
  const src = fs.readFileSync(path.join(here, 'fixtures', relPath), 'utf8');
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

test('tables: 5 tables of 28 values, first three are the base tables', () => {
  assert.deepEqual(core.tablesData.map(t => t.name), ['الجمل', 'الأبجد', 'الأيقغ', 'طبائع 4', 'طبائع 7']);
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
  const ref = (a) => `${a.swarId}:${a.ayatNum}`;
  // الصيغ العثمانية الثلاث متطابقة: الحروف الـ 28 = تنقية النص بدون تشكيل
  assert.deepEqual(ayat.filter(a => core.cleanArabicText(a.ayatOText) !== a.ayat28Text).map(ref), []);
  // والنص بدون تشكيل = النص المشكول بعد حذف التشكيل
  const marks = /[ً-ٰٟۖ-ۭـ]/g;
  assert.deepEqual(ayat.filter(a => a.ayatNText.replace(marks, '') !== a.ayatOText).map(ref), []);
  // لا حروف خفية ولا رموز غريبة، ولا مسافات زائدة في أي صيغة
  const fields = ['ayatNText', 'ayatOText', 'ayat28Text', 'ayatRead', 'ayatSearch'];
  ayat.forEach(a => fields.forEach(f => {
    assert.ok(!/[​-‏‪-‮ ¨﻿]/.test(a[f]), `${ref(a)} ${f} hidden char`);
    assert.ok(!/^\s|\s$|\s{2,}/.test(a[f]), `${ref(a)} ${f} spaces`);
  }));
  // كل كلمة مشكولة في القائمة موجودة في النص المشكول
  const nWords = new Set(ayat.flatMap(a => a.ayatNText.split(' ')));
  assert.deepEqual(words.filter(w => !nWords.has(w.ntext)).map(w => w.ntext), []);
  const a319 = ayat.find(a => a.swarId === 3 && a.ayatNum === 19);
  assert.equal(core.calculateTriple(a319.ayat28Text).jummal, 6417);
});

// تشغيل ملفات PhsQuran المحسوبة مسبقاً (Q01/Q02) للمقارنة
function loadPhsQuranFixtures() {
  const ctx = {};
  vm.createContext(ctx);
  for (const file of ['Q01Characters.js', 'Q02Chapters.js']) {
    const src = fs.readFileSync(path.join(here, 'fixtures', file), 'utf8').replace(/var /g, 'globalThis.');
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

  // الفاتحة (7 آيات، فردي): المحور 1 وحده، ثم 2↔7، 3↔6، 4↔5
  const fatiha = core.symmetricVerses(ayat, 1, 1);
  assert.equal(fatiha.axis.num, 1);
  assert.deepEqual(fatiha.pairs.map(p => [p.right.num, p.left.num]), [[2, 7], [3, 6], [4, 5]]);
  assert.equal(fatiha.opposite, null);
  // الإخلاص (4 آيات، زوجي): المحور 1، ثم 2↔4، والمقابلة 3 وحدها
  const ikhlas = core.symmetricVerses(ayat, 112, 1);
  assert.deepEqual(ikhlas.pairs.map(p => [p.right.num, p.left.num]), [[2, 4]]);
  assert.equal(ikhlas.opposite.num, 3);
  // البقرة بمحور 10: 11↔9 أولاً، وكل الآيات مغطاة مرة واحدة
  const baqarah = core.symmetricVerses(ayat, 2, 10);
  assert.deepEqual([baqarah.pairs[0].right.num, baqarah.pairs[0].left.num], [11, 9]);
  const covered = [baqarah.axis.num, baqarah.opposite.num, ...baqarah.pairs.flatMap(p => [p.right.num, p.left.num])];
  assert.equal(new Set(covered).size, 286);
  assert.equal(core.symmetricVerses(ayat, 1, 99), null);
});

test('triangle minimum is 15 everywhere and its fraction is unchanged', () => {
  assert.equal(core.WEFEQ_MAGIC_CONSTANTS.triangle, 15);
  assert.equal(core.studyWefeqNumber(14, 'triangle').possible, false);
  assert.equal(core.studyWefeqNumber(15, 'triangle').possible, true);
  for (let n = 15; n <= 500; n++) {
    assert.equal(core.triangleFraction(n), (n - 12) % 3);
  }
  assert.equal(core.wefeqFractionExplanation('triangle'), 'الباقي من قسمة (الرقم - 15) على 3');
});

test('surah and verse studies match the legacy PhsQuran study pages', () => {
  const old = loadPhsQuranFixtures();
  for (let id = 1; id <= 114; id++) {
    const s = core.analyzeSurahCharacters(ayat, id, swar);
    const o = old.chapters[id - 1];
    const ghain = id === 3 ? 1 : 0;
    assert.deepEqual([s.firstLetter, s.lastLetter, s.revelationOrder, s.totalAyahs, s.letters], [o.FC, o.LC, o.TO, o.Vs, o.Cs + ghain], `surah ${id}`);
    // الحروف المستخدمة وغير المستخدمة كما في الملف القديم (UCs / ECs)
    const oldUsed = o.UCs.filter(([c]) => c !== '').map(([c, n]) => [c, n + (c === 'غ' ? ghain : 0)]);
    assert.deepEqual(s.usedLetters.map(x => [x.char, x.count]), oldUsed, `surah ${id} used`);
    assert.deepEqual(s.unusedLetters, o.ECs.filter(([c]) => c !== '').map(([c]) => c), `surah ${id} unused`);
    assert.equal(s.usedLetters.length + s.unusedLetters.length, 28);
  }
  const v = core.analyzeAyahCharacters(ayat, ayat.find(a => a.swarId === 2 && a.ayatNum === 255).ayatId, swar);
  assert.equal(v.ayahNum, 255);
  assert.equal(v.quranOrder, 7 + 255);
  assert.equal(v.surah.surahName, 'البقرة');
  assert.equal(v.firstLetter, 'ا');
  assert.equal(v.words + 0, v.totalWords);
  assert.equal(v.usedLetters.reduce((a, b) => a + b.count, 0), v.letters);
});

test('letters data file: 28 letters, solar/lunar and nurani match the Quran data', () => {
  const lettersData = readData(core.DATA_FILES.letters);
  assert.deepEqual(lettersData.map(l => l.chChar), core.BASE_LETTERS);
  assert.deepEqual(lettersData.map(l => l.chNo), core.BASE_LETTERS.map((c, i) => i + 1));
  lettersData.forEach(l => assert.ok(l.chName && typeof l.chSolar === 'boolean' && typeof l.chNurani === 'boolean', l.chChar));

  // الشمسية 14 والقمرية 14
  const solar = lettersData.filter(l => l.chSolar).map(l => l.chChar).sort();
  assert.deepEqual(solar, ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'].sort());

  // النورانية = حروف الحروف المقطعة في أوائل السور الـ 29 (من بيانات الآيات نفسها)
  const muqattaat = [2, 3, 7, 10, 11, 12, 13, 14, 15, 19, 20, 26, 27, 28, 29, 30, 31, 32, 36, 38, 40, 41, 42, 43, 44, 45, 46, 50, 68];
  const openings = muqattaat.map(id => ayat.find(a => a.swarId === id && a.ayatNum === 1).ayat28Text.split(' ')[0]);
  openings.push(ayat.find(a => a.swarId === 42 && a.ayatNum === 2).ayat28Text);
  const fromQuran = [...new Set(openings.join('').split(''))].sort();
  assert.equal(fromQuran.length, 14);
  assert.deepEqual(lettersData.filter(l => l.chNurani).map(l => l.chChar).sort(), fromQuran);

  // إحصاءات الحروف بالتصنيف
  const ls = core.letterStats(swar, ayat, lettersData);
  assert.equal(ls.rows[0].name, 'ألف');
  assert.equal(ls.groups.solar.letters + ls.groups.lunar.letters, 28);
  assert.equal(ls.groups.solar.count + ls.groups.lunar.count, ls.totals.Count);
  assert.equal(ls.groups.nurani.count + ls.groups.nonNurani.count, ls.totals.Count);
  assert.equal(core.studyLetter(swar, ayat, 'ق', lettersData).nurani, true);

  // طبيعة كل حرف مطابقة لجدول طبائع 4 (1 ناري، 2 ترابي، 3 هوائي، 4 مائي)
  const t4 = core.tablesData.find(t => t.name === 'طبائع 4').values;
  lettersData.forEach((l, i) => assert.equal(l.chNature, core.LETTER_NATURES[t4[i] - 1], l.chChar));
  assert.deepEqual(lettersData.filter(l => l.chNature === 'ناري').map(l => l.chChar), ['ا', 'ه', 'ط', 'م', 'ف', 'ش', 'ذ']);
  assert.equal(ls.groups.natures.reduce((s, n) => s + n.count, 0), ls.totals.Count);
  ls.groups.natures.forEach(n => assert.equal(n.letters, 7, n.nature));
});

test('quran range: extraction, stats, word counts and equations', () => {
  // الفاتحة كاملة = دراسة سورة الفاتحة
  const fatiha = core.rangeStats(core.quranRange(ayat, {surah: 1, ayah: 1}, {surah: 1, ayah: 7}));
  const surah1 = core.analyzeSurahCharacters(ayat, 1, swar);
  assert.equal(fatiha.verses, 7);
  assert.equal(fatiha.fullVerses, 7);
  assert.equal(fatiha.words, surah1.words);
  assert.equal(fatiha.letters, surah1.letters);
  assert.deepEqual(fatiha.usedLetters, surah1.usedLetters);

  // البسملة = 786 بالجمل
  const basmala = core.rangeStats(core.quranRange(ayat, {surah: 1, ayah: 1, word: 1}, {surah: 1, ayah: 1, word: 4}));
  assert.equal(basmala.tables.find(t => t.key === 'jummal').total, 786);
  assert.equal(basmala.words, 4);
  assert.equal(basmala.letters, 19);

  // جزء من كلمة: «الله» من الحرف 2 إلى 3 = «لل»
  const part = core.quranRange(ayat, {surah: 1, ayah: 1, word: 2, char: 2}, {surah: 1, ayah: 1, word: 2, char: 3});
  assert.equal(part.segments[0].text, 'لل');
  assert.equal(part.segments[0].partial, true);

  // من وسط آية إلى وسط آية أخرى
  const mid = core.quranRange(ayat, {surah: 1, ayah: 6, word: 2}, {surah: 1, ayah: 7, word: 2});
  assert.deepEqual(mid.segments.map(s => s.text), ['الصرط المستقيم', 'صرط الذين']);

  // الكلمة 0 في النهاية = آخر كلمة في الآية
  const lastWord = core.quranRange(ayat, {surah: 1, ayah: 7, word: 0}, {surah: 1, ayah: 7, word: 0});
  assert.equal(lastWord.end.word, 10);
  assert.equal(lastWord.segments[0].partial, false);

  // البداية بعد النهاية خطأ، والآية غير الموجودة خطأ
  assert.equal(core.quranRange(ayat, {surah: 2, ayah: 1}, {surah: 1, ayah: 7}).error, 'reversed');
  assert.equal(core.quranRange(ayat, {surah: 1, ayah: 1, word: 3}, {surah: 1, ayah: 1, word: 2}).error, 'reversed');
  assert.equal(core.quranRange(ayat, {surah: 1, ayah: 99}, {surah: 2, ayah: 1}).error, 'invalid_point');

  // القرآن كاملاً = مجاميع إحصاءات السور
  const all = core.rangeStats(core.quranRange(ayat, {surah: 1, ayah: 1}, {surah: 114, ayah: 6}));
  const totals = core.chapterStats(swar, ayat).totals;
  assert.equal(all.surahs, 114);
  assert.equal(all.verses, totals.Vs);
  assert.equal(all.words, totals.Ws);
  assert.equal(all.letters, totals.Cs);
  assert.equal(all.bySurah.reduce((s, r) => s + r.letters, 0), totals.Cs);

  // عدّ كلمة: المطابقة التامة جزء من الاحتواء
  const exact = core.countWordInRange(all, 'الأرض', 'exact');
  const contains = core.countWordInRange(all, 'الأرض', 'contains');
  assert.ok(exact > 0 && contains >= exact);
  assert.equal(core.countWordInRange(fatiha, 'الله'), 1);

  // المعادلات
  const vars = {...core.rangeVariables('A', fatiha, [2]), ...core.rangeVariables('B', basmala, [1])};
  assert.equal(core.evaluateExpression('A.letters / B.letters', vars).value, fatiha.letters / 19);
  assert.equal(core.evaluateExpression('(A.letters + A.words) / (B.letters + B.words)', vars).value, (fatiha.letters + fatiha.words) / 23);
  assert.equal(core.evaluateExpression('A.w1 / B.w1 + 2 ^ 3 - -1', vars).value, 11);
  assert.equal(core.evaluateExpression('B.jummal % 7', vars).value, 786 % 7);
  assert.equal(core.evaluateExpression('max(B.ل, 1) * sqrt(16)', vars).value, basmala.letterCounts['ل'] * 4);
  assert.ok(core.evaluateExpression('A.nothing', vars).error);
  assert.ok(core.evaluateExpression('1 / 0', vars).error);
  assert.ok(core.evaluateExpression('2 +', vars).error);
  assert.ok(core.evaluateExpression('alert(1)', vars).error);
});

test('math lab: algebra, powers, calculus, statistics and Quran data', async () => {
  const {createMathLab, quranMathData} = await import('../src/math-lab.js');
  const lab = createMathLab(quranMathData(ayat, swar));
  const r = lab.evaluate([
    '# تعليق',
    '2^10 + 3 * 4',
    'nthRoot(27, 3) + sqrt(16) + 5 mod 3',
    'bignumber(7)^30',
    'derivative("x^3 + 2x", "x")',
    'integrate("x^2", 0, 3)',
    'f(x) = sin(x)',
    'integrate(f, 0, pi)',
    'nderivative("x^3", 2)',
    'findRoot("x^2 - 2", 0, 2)',
    'sigma("k^2", "k", 1, 10)',
    'mean([1, 2, 3, 4])',
    'std([2, 4, 4, 4, 5, 5, 7, 9], "uncorrected")',
    'totalVerses',
    'sum(surahVerses)',
    'sum(verseLetters) == totalLetters',
    'sum(letterCounts) == totalLetters',
    'surahVerses[2]',
    'value("بسم الله الرحمن الرحيم")',
    'segment("1:1", "1:1").jummal',
    'sum(bysurah(1, "jummal")) == surahJummal[1]',
    'letter("ق", 50) > 0',
    'word("الله") > 2000',
    'linreg(surahVerses, surahLetters).r > 0.8',
    'digitsum(786) + digitalroot(786) + reversenum(786)',
    'det([1, 2; 3, 4])',
    '1 +'
  ]);
  const v = (i) => r[i] && (r[i].value !== undefined ? r[i].value : r[i].text);
  assert.equal(r[0], null);
  assert.equal(v(1), 1036);
  assert.equal(v(2), 9);
  assert.equal(v(3), '22539340290692258087863249');
  assert.equal(v(4), '3 * x ^ 2 + 2');
  assert.ok(Math.abs(v(5) - 9) < 1e-9);
  assert.equal(r[6].type, 'function');
  assert.ok(Math.abs(v(7) - 2) < 1e-9);
  assert.ok(Math.abs(v(8) - 12) < 1e-6);
  assert.ok(Math.abs(v(9) - Math.SQRT2) < 1e-12);
  assert.equal(v(10), 385);
  assert.equal(v(11), 2.5);
  assert.equal(v(12), 2);
  assert.equal(v(13), 6236);
  assert.equal(v(14), 6236);
  assert.equal(v(15), 'true');
  assert.equal(v(16), 'true');
  assert.equal(v(17), 286);
  assert.equal(v(18), 786);
  assert.equal(v(19), 786);
  assert.equal(v(20), 'true');
  assert.equal(v(21), 'true');
  assert.equal(v(22), 'true');
  assert.equal(v(23), 'true');
  assert.equal(v(24), 21 + 3 + 687);
  assert.equal(v(25), -2);
  assert.equal(r[26].type, 'error');
});

// =====================================================
// مقطع من القرآن: من (سورة، آية، كلمة، حرف) إلى (سورة، آية، كلمة، حرف)
// إحصاءات الكلمات والحروف وقيم الجداول، وعدّ كلمة في المقطع،
// ومعادلات بين مقطعين (محلل تعابير آمن دون eval)
// كل النصوص من ayat28Text حسب قاعدة الدراسة
// =====================================================
import {BASE_LETTERS, calculateText, cleanArabicText, splitWords} from './letters.js';
import {tablesData} from './tables.js';
import {letterProfile} from './quran-stats.js';

// مفاتيح الجداول الخمسة في المعادلات (بترتيب tablesData)
export const RANGE_TABLE_KEYS = ['jummal', 'abjad', 'ayqagh', 'tabaei4', 'tabaei7'];

// المتغيرات العامة لكل مقطع في المعادلات
export const RANGE_VARIABLES = ['surahs', 'verses', 'words', 'distinct', 'letters', ...RANGE_TABLE_KEYS];

function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

// نقطة: {surah, ayah, word, char}. word و char يبدآن من 1، و char = 0 يعني الكلمة كاملة
// تُعيد موقع الآية في المصحف أو -1
function findAyahIndex(ayat, point) {
  const surah = toInt(point && point.surah, 0);
  const ayah = toInt(point && point.ayah, 0);
  return ayat.findIndex(a => a.swarId === surah && a.ayatNum === ayah);
}

// موقع النقطة داخل نص الآية: {word, char} مضبوطان على حدود الآية
function resolvePoint(words, point, isEnd) {
  const wordCount = words.length;
  // الكلمة 0 أو غير المحددة: أول كلمة في البداية، وآخر كلمة في النهاية
  let word = toInt(point.word, 0);
  if (word < 1) {
    word = isEnd ? wordCount : 1;
  }
  if (word > wordCount) {
    word = wordCount;
  }
  const len = words[word - 1].length;
  let char = toInt(point.char, 0);
  if (char < 0 || char > len) {
    char = 0;
  }
  return {word: word, char: char};
}

// استخراج المقطع: قائمة أجزاء آيات، كل جزء نص الآية أو بعضه.
// يُعيد {segments, start, end} أو {error: 'invalid_point' | 'reversed'}
export function quranRange(ayat, startPoint, endPoint) {
  const startIdx = findAyahIndex(ayat, startPoint);
  const endIdx = findAyahIndex(ayat, endPoint);
  if (startIdx < 0 || endIdx < 0) {
    return {error: 'invalid_point'};
  }

  const startWords = splitWords(ayat[startIdx].ayat28Text);
  const endWords = splitWords(ayat[endIdx].ayat28Text);
  const start = resolvePoint(startWords, startPoint, false);
  const end = resolvePoint(endWords, endPoint, true);

  // ترتيب النقطتين: (الآية، الكلمة، الحرف). الحرف 0 بداية الكلمة في البداية ونهايتها في النهاية
  const startKey = [startIdx, start.word, start.char === 0 ? 1 : start.char];
  const endKey = [endIdx, end.word, end.char === 0 ? endWords[end.word - 1].length : end.char];
  for (let i = 0; i < 3; i++) {
    if (startKey[i] !== endKey[i]) {
      if (startKey[i] > endKey[i]) {
        return {error: 'reversed'};
      }
      break;
    }
  }

  const segments = [];
  for (let idx = startIdx; idx <= endIdx; idx++) {
    const ayah = ayat[idx];
    let words = splitWords(ayah.ayat28Text);
    const total = words.length;
    let firstWord = 1;
    let lastWord = total;
    if (idx === endIdx) {
      lastWord = end.word;
    }
    if (idx === startIdx) {
      firstWord = start.word;
    }
    words = words.slice(firstWord - 1, lastWord);
    // قص الحروف: النهاية أولاً حتى لا يتغير موقع البداية في الكلمة نفسها
    if (idx === endIdx && end.char > 0) {
      const last = words.length - 1;
      words[last] = words[last].slice(0, end.char);
    }
    if (idx === startIdx && start.char > 0) {
      words[0] = words[0].slice(start.char - 1);
    }
    const partial = firstWord !== 1 || lastWord !== total
      || (idx === startIdx && start.char > 1)
      || (idx === endIdx && end.char > 0 && end.char < endWords[end.word - 1].length);
    segments.push({
      ayatId: ayah.ayatId,
      surahId: ayah.swarId,
      surahName: ayah.swarName,
      ayahNum: ayah.ayatNum,
      firstWord: firstWord,
      lastWord: lastWord,
      partial: partial,
      text: words.join(' ')
    });
  }

  return {
    start: {surah: ayat[startIdx].swarId, ayah: ayat[startIdx].ayatNum, word: start.word, char: start.char},
    end: {surah: ayat[endIdx].swarId, ayah: ayat[endIdx].ayatNum, word: end.word, char: end.char},
    segments: segments
  };
}

// إحصاءات المقطع: السور، الآيات (الكاملة والجزئية)، الكلمات والمختلفة منها،
// الحروف وتكرار كل حرف، قيم الجداول الخمسة، تكرار كل كلمة، وتفصيل كل سورة
export function rangeStats(range) {
  if (!range || range.error) {
    return null;
  }
  const texts = range.segments.map(s => s.text);
  const profile = letterProfile(texts);
  const wordCounts = new Map();
  const surahs = new Map();
  const tables = RANGE_TABLE_KEYS.map(() => 0);

  range.segments.forEach(seg => {
    const words = splitWords(seg.text);
    words.forEach(w => {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    });
    const letters = seg.text.replace(/\s+/g, '').length;
    if (!surahs.has(seg.surahId)) {
      surahs.set(seg.surahId, {surahId: seg.surahId, surahName: seg.surahName, verses: 0, words: 0, letters: 0});
    }
    const row = surahs.get(seg.surahId);
    row.verses++;
    row.words += words.length;
    row.letters += letters;
    tablesData.forEach((table, i) => {
      tables[i] += calculateText(seg.text, table.values);
    });
  });

  const wordFrequency = [...wordCounts.entries()]
    .map(([word, count]) => ({word: word, count: count}))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, 'ar'));
  const letterCounts = {};
  BASE_LETTERS.forEach(c => {
    letterCounts[c] = 0;
  });
  profile.usedLetters.forEach(x => {
    letterCounts[x.char] = x.count;
  });

  return {
    start: range.start,
    end: range.end,
    surahs: surahs.size,
    verses: range.segments.length,
    fullVerses: range.segments.filter(s => !s.partial).length,
    words: profile.words,
    distinctWords: wordFrequency.length,
    letters: profile.letters,
    firstLetter: profile.firstLetter,
    lastLetter: profile.lastLetter,
    usedLetters: profile.usedLetters,
    unusedLetters: profile.unusedLetters,
    letterCounts: letterCounts,
    tables: tablesData.map((table, i) => ({key: RANGE_TABLE_KEYS[i], name: table.name, total: tables[i]})),
    wordFrequency: wordFrequency,
    bySurah: [...surahs.values()],
    segments: range.segments
  };
}

// عدد مرات ورود كلمة في المقطع من جدول تكرار الكلمات
// mode: 'exact' الكلمة نفسها، 'contains' كل كلمة تحتويها (بالارض، و الارض...)
export function countWordInRange(stats, word, mode = 'exact') {
  const target = cleanArabicText(word).replace(/\s+/g, '');
  if (!stats || !target) {
    return 0;
  }
  return stats.wordFrequency.reduce((sum, x) => {
    const hit = mode === 'contains' ? x.word.includes(target) : x.word === target;
    return hit ? sum + x.count : sum;
  }, 0);
}

// متغيرات المعادلات لمقطع باسم (A أو B): A.letters, A.jummal, A.م (عدد الحرف), A.w1 (الكلمة الأولى)...
export function rangeVariables(name, stats, wordCounts = []) {
  const vars = {};
  if (!stats) {
    return vars;
  }
  vars[`${name}.surahs`] = stats.surahs;
  vars[`${name}.verses`] = stats.verses;
  vars[`${name}.words`] = stats.words;
  vars[`${name}.distinct`] = stats.distinctWords;
  vars[`${name}.letters`] = stats.letters;
  stats.tables.forEach(t => {
    vars[`${name}.${t.key}`] = t.total;
  });
  BASE_LETTERS.forEach(c => {
    vars[`${name}.${c}`] = stats.letterCounts[c];
  });
  wordCounts.forEach((count, i) => {
    vars[`${name}.w${i + 1}`] = count;
  });
  return vars;
}

// ---------- محلل المعادلات ----------
// + - * / % ^ والأقواس والدوال: abs sqrt round floor ceil min max
const FUNCTIONS = {
  abs: Math.abs,
  sqrt: Math.sqrt,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max
};

function tokenize(expr) {
  const tokens = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([\p{L}_][\p{L}\p{N}_]*(?:\.[\p{L}\p{N}_]+)*)|(\S))/uy;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < expr.length) {
    m = re.exec(expr);
    if (!m) {
      break;
    }
    if (m[1] !== undefined) {
      tokens.push({type: 'num', value: parseFloat(m[1])});
    } else if (m[2] !== undefined) {
      tokens.push({type: 'id', value: m[2]});
    } else if (m[3] !== undefined) {
      if (!'+-*/%^(),'.includes(m[3])) {
        throw new Error(`unexpected:${m[3]}`);
      }
      tokens.push({type: 'op', value: m[3]});
    }
  }
  return tokens;
}

// تقييم معادلة بالمتغيرات. يُعيد {value} أو {error}
export function evaluateExpression(expr, vars = {}) {
  let tokens;
  try {
    tokens = tokenize(String(expr || ''));
  } catch (e) {
    return {error: e.message};
  }
  if (tokens.length === 0) {
    return {error: 'empty'};
  }
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v) => peek() && peek().type === 'op' && peek().value === v;
  const expect = (v) => {
    if (!isOp(v)) {
      throw new Error(`expected:${v}`);
    }
    pos++;
  };

  function primary() {
    const tok = peek();
    if (!tok) {
      throw new Error('incomplete');
    }
    if (tok.type === 'num') {
      pos++;
      return tok.value;
    }
    if (tok.type === 'id') {
      pos++;
      if (isOp('(')) {
        const fn = FUNCTIONS[tok.value];
        if (!fn) {
          throw new Error(`unknown:${tok.value}`);
        }
        pos++;
        const args = [];
        if (!isOp(')')) {
          args.push(additive());
          while (isOp(',')) {
            pos++;
            args.push(additive());
          }
        }
        expect(')');
        return fn(...args);
      }
      if (!Object.prototype.hasOwnProperty.call(vars, tok.value)) {
        throw new Error(`unknown:${tok.value}`);
      }
      return vars[tok.value];
    }
    if (isOp('(')) {
      pos++;
      const v = additive();
      expect(')');
      return v;
    }
    throw new Error(`unexpected:${tok.value}`);
  }

  function unary() {
    if (isOp('-')) {
      pos++;
      return -unary();
    }
    if (isOp('+')) {
      pos++;
      return unary();
    }
    return power();
  }

  function power() {
    const base = primary();
    if (isOp('^')) {
      pos++;
      return Math.pow(base, unary());
    }
    return base;
  }

  function multiplicative() {
    let v = unary();
    while (isOp('*') || isOp('/') || isOp('%')) {
      const op = tokens[pos++].value;
      const r = unary();
      if (op === '*') {
        v *= r;
      } else if (op === '/') {
        v /= r;
      } else {
        v %= r;
      }
    }
    return v;
  }

  function additive() {
    let v = multiplicative();
    while (isOp('+') || isOp('-')) {
      const op = tokens[pos++].value;
      const r = multiplicative();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  try {
    const value = additive();
    if (pos < tokens.length) {
      throw new Error(`unexpected:${tokens[pos].value}`);
    }
    if (!Number.isFinite(value)) {
      return {error: 'not_finite'};
    }
    return {value: value};
  } catch (e) {
    return {error: e.message};
  }
}

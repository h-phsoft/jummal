// =====================================================
// المختبر الرياضي: محرك mathjs (جبر، إحصاء، اشتقاق رمزي، مصفوفات...)
// مع تكامل عددي وأدوات إضافية، ومتغيرات ودوال من نص القرآن (ayat28Text)
// مدخل مستقل (@jummal/core/math-lab) حتى لا تُحمَّل mathjs في بقية الصفحات
// =====================================================
import {all, create} from 'mathjs';
import {BASE_LETTERS, calculateText, cleanArabicText, splitWords, JUMMAL_VALUES} from './letters.js';
import {tablesData} from './tables.js';
import {quranRange, rangeStats, RANGE_TABLE_KEYS} from './quran-range.js';

// ---------- أدوات رياضية إضافية ----------

// قيمة دالة: نص بالمتغير x، أو دالة معرّفة في المختبر f(x) = ...
function toFunction(math, f, variable = 'x') {
  if (typeof f === 'function') {
    return (x) => Number(f(x));
  }
  const code = math.compile(String(f));
  return (x) => Number(code.evaluate({[variable]: x}));
}

// تكامل عددي بطريقة سمبسون التكيفية
function adaptiveSimpson(fn, a, b, eps = 1e-10, maxDepth = 50) {
  const simpson = (fa, fm, fb, l, r) => ((r - l) / 6) * (fa + 4 * fm + fb);
  function rec(l, r, fa, fm, fb, whole, depth, tol) {
    const m = (l + r) / 2;
    const lm = (l + m) / 2;
    const rm = (m + r) / 2;
    const flm = fn(lm);
    const frm = fn(rm);
    const left = simpson(fa, flm, fm, l, m);
    const right = simpson(fm, frm, fb, m, r);
    if (depth <= 0 || Math.abs(left + right - whole) <= 15 * tol) {
      return left + right + (left + right - whole) / 15;
    }
    return rec(l, m, fa, flm, fm, left, depth - 1, tol / 2) + rec(m, r, fm, frm, fb, right, depth - 1, tol / 2);
  }
  const fa = fn(a);
  const fb = fn(b);
  const fm = fn((a + b) / 2);
  return rec(a, b, fa, fm, fb, simpson(fa, fm, fb, a, b), maxDepth, eps);
}

function toArray(math, v) {
  return math.flatten(math.isMatrix(v) ? v.toArray() : v).map(Number);
}

// انحدار خطي: y = slope × x + intercept، مع معامل الارتباط
function linearRegression(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
    sxx += xs[i] * xs[i];
    sxy += xs[i] * ys[i];
    syy += ys[i] * ys[i];
  }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
  return {slope: slope, intercept: intercept, r: r, r2: r * r};
}

function extraFunctions(math) {
  return {
    // تكامل محدد عددياً: integrate("x^2", 0, 3) أو integrate(f, 0, 3)
    integrate: (f, a, b, variable) => adaptiveSimpson(toFunction(math, f, variable || 'x'), Number(a), Number(b)),
    // تكامل متتالية بقاعدة شبه المنحرف: trapz(y) أو trapz(x, y)
    trapz: (a, b) => {
      const ys = toArray(math, b === undefined ? a : b);
      const xs = b === undefined ? ys.map((_, i) => i + 1) : toArray(math, a);
      let total = 0;
      for (let i = 1; i < ys.length; i++) {
        total += ((xs[i] - xs[i - 1]) * (ys[i] + ys[i - 1])) / 2;
      }
      return total;
    },
    // مشتقة عددية عند نقطة: nderivative("x^3", 2)
    nderivative: (f, x, variable) => {
      const fn = toFunction(math, f, variable || 'x');
      const h = 1e-5 * Math.max(1, Math.abs(Number(x)));
      return (fn(Number(x) + h) - fn(Number(x) - h)) / (2 * h);
    },
    // جذر معادلة f(x) = 0 بين a و b (التنصيف)
    findRoot: (f, a, b, variable) => {
      const fn = toFunction(math, f, variable || 'x');
      let lo = Number(a);
      let hi = Number(b);
      let flo = fn(lo);
      if (flo * fn(hi) > 0) {
        throw new Error('findRoot: f(a) and f(b) must have opposite signs');
      }
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2;
        const fm = fn(mid);
        if (fm === 0 || (hi - lo) / 2 < 1e-13) {
          return mid;
        }
        if (fm * flo < 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fm;
        }
      }
      return (lo + hi) / 2;
    },
    // مجموع وجداء تعبير: sigma("k^2", "k", 1, 10)، piprod("k", "k", 1, 5)
    sigma: (expr, variable, a, b) => {
      const fn = toFunction(math, expr, variable);
      let total = 0;
      for (let k = Number(a); k <= Number(b); k++) {
        total += fn(k);
      }
      return total;
    },
    piprod: (expr, variable, a, b) => {
      const fn = toFunction(math, expr, variable);
      let total = 1;
      for (let k = Number(a); k <= Number(b); k++) {
        total *= fn(k);
      }
      return total;
    },
    linreg: (x, y) => linearRegression(toArray(math, x), toArray(math, y)),
    digitsum: (n) => String(Math.abs(Math.trunc(Number(n)))).split('').reduce((s, d) => s + Number(d), 0),
    digitalroot: (n) => {
      const v = Math.abs(Math.trunc(Number(n)));
      return v === 0 ? 0 : 1 + ((v - 1) % 9);
    },
    reversenum: (n) => Number(String(Math.abs(Math.trunc(Number(n)))).split('').reverse().join('')),
    divisors: (n) => {
      const v = Math.abs(Math.trunc(Number(n)));
      const out = [];
      for (let i = 1; i * i <= v; i++) {
        if (v % i === 0) {
          out.push(i);
          if (i * i !== v) {
            out.push(v / i);
          }
        }
      }
      return out.sort((x, y) => x - y);
    },
    fib: (n) => {
      let a = 0;
      let b = 1;
      for (let i = 0; i < Number(n); i++) {
        [a, b] = [b, a + b];
      }
      return a;
    }
  };
}

// ---------- بيانات القرآن ----------

// «2:255» أو «2:255:3:2» ← نقطة
function parsePoint(text) {
  const [surah, ayah, word, char] = String(text).split(':').map(x => parseInt(x, 10));
  return {surah: surah, ayah: ayah, word: word, char: char};
}

function letterCountIn(text, letter) {
  let n = 0;
  for (const c of text) {
    if (c === letter) {
      n++;
    }
  }
  return n;
}

// متغيرات ودوال القرآن في المختبر
export function quranMathData(ayat, swar) {
  const verseWords = [];
  const verseLetters = [];
  const verseSurah = [];
  const verseNum = [];
  const verseTables = RANGE_TABLE_KEYS.map(() => []);
  const surahIndex = new Map(swar.map((s, i) => [s.swarId, i]));
  const surahWords = swar.map(() => 0);
  const surahLetters = swar.map(() => 0);
  const surahVerses = swar.map(() => 0);
  const surahTables = RANGE_TABLE_KEYS.map(() => swar.map(() => 0));
  const wordFreq = new Map();
  const letterCounts = BASE_LETTERS.map(() => 0);
  const letterIdx = new Map(BASE_LETTERS.map((c, i) => [c, i]));

  ayat.forEach(a => {
    const words = splitWords(a.ayat28Text);
    const letters = a.ayat28Text.replace(/\s+/g, '');
    const si = surahIndex.get(a.swarId);
    verseWords.push(words.length);
    verseLetters.push(letters.length);
    verseSurah.push(a.swarId);
    verseNum.push(a.ayatNum);
    surahWords[si] += words.length;
    surahLetters[si] += letters.length;
    surahVerses[si]++;
    tablesData.forEach((table, t) => {
      const v = calculateText(letters, table.values);
      verseTables[t].push(v);
      surahTables[t][si] += v;
    });
    words.forEach(w => {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    });
    for (const c of letters) {
      const i = letterIdx.get(c);
      if (i !== undefined) {
        letterCounts[i]++;
      }
    }
  });

  const variables = {
    totalSurahs: swar.length,
    totalVerses: ayat.length,
    totalWords: verseWords.reduce((s, x) => s + x, 0),
    totalLetters: verseLetters.reduce((s, x) => s + x, 0),
    surahVerses: surahVerses,
    surahWords: surahWords,
    surahLetters: surahLetters,
    surahRevelation: swar.map(s => s.swarOrd),
    surahMeccan: swar.map(s => (s.sTypeRem === 'مكية' ? 1 : 0)),
    verseWords: verseWords,
    verseLetters: verseLetters,
    verseSurah: verseSurah,
    verseNum: verseNum,
    letterCounts: letterCounts,
    letterValues: JUMMAL_VALUES.slice()
  };
  RANGE_TABLE_KEYS.forEach((key, t) => {
    const cap = key[0].toUpperCase() + key.slice(1);
    variables[`surah${cap}`] = surahTables[t];
    variables[`verse${cap}`] = verseTables[t];
  });

  const tableValues = (key) => {
    const t = RANGE_TABLE_KEYS.indexOf(key || 'jummal');
    if (t < 0) {
      throw new Error(`unknown table: ${key} (${RANGE_TABLE_KEYS.join(', ')})`);
    }
    return tablesData[t].values;
  };
  const versesOf = (s) => ayat.filter(a => a.swarId === Number(s));

  const functions = {
    // عدد حرف في القرآن أو في سورة: letter("م") ، letter("م", 2)
    letter: (c, s) => {
      const ch = cleanArabicText(String(c));
      const list = s === undefined ? ayat : versesOf(s);
      return list.reduce((n, a) => n + letterCountIn(a.ayat28Text, ch), 0);
    },
    // عدد كلمة (مطابقة تامة) أو كل كلمة تحتويها: word("الارض") ، wordlike("ارض")
    word: (w) => wordFreq.get(cleanArabicText(String(w)).replace(/\s+/g, '')) || 0,
    wordlike: (w) => {
      const target = cleanArabicText(String(w)).replace(/\s+/g, '');
      let n = 0;
      wordFreq.forEach((count, key) => {
        if (key.includes(target)) {
          n += count;
        }
      });
      return n;
    },
    // قيمة نص في جدول: value("محمد") ، value("محمد", "abjad")
    value: (text, key) => calculateText(cleanArabicText(String(text)), tableValues(key)),
    // متتالية لكل آية في سورة: bysurah(2, "letters") (words, letters, jummal, abjad...)
    bysurah: (s, field) => {
      const f = String(field || 'letters');
      return versesOf(s).map(a => {
        if (f === 'words') {
          return splitWords(a.ayat28Text).length;
        }
        if (f === 'letters') {
          return a.ayat28Text.replace(/\s+/g, '').length;
        }
        return calculateText(a.ayat28Text, tableValues(f));
      });
    },
    // نص آية بالحروف الـ 28: verse(2, 255)
    verse: (s, n) => {
      const a = ayat.find(x => x.swarId === Number(s) && x.ayatNum === Number(n));
      if (!a) {
        throw new Error(`verse ${s}:${n} not found`);
      }
      return a.ayat28Text;
    },
    // مقطع: segment("2:1", "2:5") أو بالكلمة والحرف "2:1:3:2"
    // يُعيد {verses, words, distinct, letters, jummal..., verseWords, verseLetters, text}
    segment: (from, to) => {
      const range = quranRange(ayat, parsePoint(from), parsePoint(to));
      if (range.error) {
        throw new Error(`segment: ${range.error}`);
      }
      const st = rangeStats(range);
      const out = {
        surahs: st.surahs,
        verses: st.verses,
        words: st.words,
        distinct: st.distinctWords,
        letters: st.letters,
        verseWords: range.segments.map(s => splitWords(s.text).length),
        verseLetters: range.segments.map(s => s.text.replace(/\s+/g, '').length),
        text: range.segments.map(s => s.text).join(' ')
      };
      st.tables.forEach(t => {
        out[t.key] = t.total;
      });
      return out;
    },
    // عدد الحروف/الكلمات/القيمة لنص يكتبه الباحث
    letters: (text) => cleanArabicText(String(text)).replace(/\s+/g, '').length,
    words: (text) => splitWords(cleanArabicText(String(text))).length
  };

  return {variables: variables, functions: functions};
}

// ---------- المختبر ----------

function describe(math, value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'number') {
    return {type: 'number', value: value};
  }
  // الأعداد الكبيرة الدقيقة (bignumber(7)^100) تُعرض بكل أرقامها
  if (math.isBigNumber(value)) {
    return {type: 'text', text: value.isInteger() ? value.toFixed() : value.toString()};
  }
  if (typeof value === 'boolean') {
    return {type: 'text', text: String(value)};
  }
  if (typeof value === 'string') {
    return {type: 'text', text: value};
  }
  if (typeof value === 'function') {
    return {type: 'function', text: value.syntax || value.name || 'function'};
  }
  if (math.isNode(value)) {
    return {type: 'expression', text: value.toString()};
  }
  if (math.isMatrix(value) || Array.isArray(value)) {
    const arr = math.isMatrix(value) ? value.toArray() : value;
    const size = math.size(arr);
    const dims = Array.isArray(size) ? size : size.toArray();
    if (dims.length === 1 && arr.every(x => typeof x === 'number')) {
      return {type: 'vector', values: arr};
    }
    return {type: 'text', text: math.format(value, {precision: 12})};
  }
  if (math.isResultSet && math.isResultSet(value)) {
    const entries = value.entries.map(v => describe(math, v)).filter(Boolean);
    return entries.length ? entries[entries.length - 1] : null;
  }
  return {type: 'text', text: math.format(value, {precision: 12})};
}

// إنشاء مختبر: data من quranMathData (اختياري). evaluate(lines) يقيّم الأسطر بالتتابع
// بمجال متغيرات مشترك (x = 5 ثم x^2)، والأسطر التي تبدأ بـ # تعليقات
export function createMathLab(data) {
  // الأعداد العادية سريعة، و bignumber(...) دقيقة حتى 500 رقم (7^100 كاملة)
  const math = create(all, {number: 'number', precision: 500});
  math.import(extraFunctions(math), {override: false});
  if (data) {
    math.import(data.functions, {override: true});
  }

  return {
    math: math,
    evaluate(lines) {
      const parser = math.parser();
      if (data) {
        Object.entries(data.variables).forEach(([k, v]) => parser.set(k, v));
      }
      return lines.map(line => {
        const text = String(line || '').trim();
        if (!text || text.startsWith('#')) {
          return null;
        }
        try {
          return describe(math, parser.evaluate(text));
        } catch (e) {
          return {type: 'error', message: e.message};
        }
      });
    }
  };
}

// =====================================================
// إحصاءات الحروف والسور والآيات (بديل ملفات PhsQuran المحسوبة مسبقاً)
// كلها من ayat28Text حسب قاعدة الدراسة، والبيانات تُمرَّر معاملاً
// =====================================================
import {BASE_LETTERS} from './letters.js';

const LETTER_INDEX = new Map(BASE_LETTERS.map((letter, i) => [letter, i]));

function lettersOf(text) {
  return (text || '').replace(/\s+/g, '');
}

function firstLetter(text) {
  const letters = lettersOf(text);
  return letters ? letters[0] : '';
}

function lastLetter(text) {
  const letters = lettersOf(text);
  return letters ? letters[letters.length - 1] : '';
}

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

// عدّ الحروف الـ 28 في نص
function countLetters(text) {
  const counts = new Array(BASE_LETTERS.length).fill(0);
  for (const char of lettersOf(text)) {
    const idx = LETTER_INDEX.get(char);
    if (idx !== undefined) {
      counts[idx]++;
    }
  }
  return counts;
}

// ملف حروف مجموعة نصوص متتالية (سورة أو آية): الحرف الأول والأخير،
// الحروف المستخدمة بتكرارها والحروف غير المستخدمة (بالترتيب الأبجدي)
export function letterProfile(texts) {
  const counts = new Array(BASE_LETTERS.length).fill(0);
  let words = 0;
  texts.forEach(text => {
    countLetters(text).forEach((c, i) => {
      counts[i] += c;
    });
    words += wordCount(text);
  });
  return {
    firstLetter: texts.length ? firstLetter(texts[0]) : '',
    lastLetter: texts.length ? lastLetter(texts[texts.length - 1]) : '',
    words: words,
    letters: counts.reduce((a, b) => a + b, 0),
    usedLetters: BASE_LETTERS.map((char, i) => ({char: char, count: counts[i]})).filter(x => x.count > 0),
    unusedLetters: BASE_LETTERS.filter((char, i) => counts[i] === 0)
  };
}

function groupBySurah(ayat) {
  const groups = new Map();
  ayat.forEach(a => {
    if (!groups.has(a.swarId)) {
      groups.set(a.swarId, []);
    }
    groups.get(a.swarId).push(a);
  });
  return groups;
}

// إحصاءات كل سورة: الحرف الأول والأخير، ترتيب التنزيل، الآيات، الكلمات، الحروف، تكرار كل حرف
export function chapterStats(swar, ayat) {
  const groups = groupBySurah(ayat);
  const totals = {Vs: 0, Ws: 0, Cs: 0, letters: new Array(BASE_LETTERS.length).fill(0)};

  const rows = swar.map(s => {
    const list = groups.get(s.swarId) || [];
    const letters = new Array(BASE_LETTERS.length).fill(0);
    let words = 0;
    list.forEach(a => {
      countLetters(a.ayat28Text).forEach((c, i) => {
        letters[i] += c;
      });
      words += wordCount(a.ayat28Text);
    });
    const cs = letters.reduce((x, y) => x + y, 0);
    totals.Vs += list.length;
    totals.Ws += words;
    totals.Cs += cs;
    letters.forEach((c, i) => {
      totals.letters[i] += c;
    });
    return {
      CpNo: s.swarId,
      CpName: s.swarName,
      FC: list.length ? firstLetter(list[0].ayat28Text) : '',
      LC: list.length ? lastLetter(list[list.length - 1].ayat28Text) : '',
      TO: s.swarOrd,
      type: s.sTypeRem,
      Vs: list.length,
      Ws: words,
      Cs: cs,
      letters: letters,
      usedLetters: letters.filter(c => c > 0).length
    };
  });

  return {letters: BASE_LETTERS, rows: rows, totals: totals};
}

// تصنيف الحروف من ملف البيانات data/letters-data.js (اسم الحرف، شمسي/قمري، نوراني، الطبيعة)
export function letterClassMap(letters) {
  return new Map((letters || []).map(l => [l.chChar, {name: l.chName, solar: l.chSolar, nurani: l.chNurani, nature: l.chNature}]));
}

// الطبائع الأربع بترتيب جدول طبائع 4 (1 ناري، 2 ترابي، 3 هوائي، 4 مائي)
export const LETTER_NATURES = ['ناري', 'ترابي', 'هوائي', 'مائي'];

// إحصاءات كل حرف: التكرار، السور والآيات التي بدأت/انتهت به، الآيات التي فيها/ليس فيها
// letters (اختياري): جدول الحروف من البيانات ليُضاف اسم الحرف وتصنيفه
export function letterStats(swar, ayat, letters) {
  const classes = letterClassMap(letters);
  const groups = groupBySurah(ayat);
  const rows = BASE_LETTERS.map((char, i) => ({
    ChNo: i + 1,
    Char: char,
    name: classes.has(char) ? classes.get(char).name : null,
    solar: classes.has(char) ? classes.get(char).solar : null,
    nurani: classes.has(char) ? classes.get(char).nurani : null,
    nature: classes.has(char) ? classes.get(char).nature : null,
    Count: 0,
    FCs: 0,
    LCs: 0,
    FLCs: 0,
    FVs: 0,
    LVs: 0,
    FLVs: 0,
    versesWith: 0,
    versesWithout: 0,
    chaptersWith: 0
  }));

  ayat.forEach(a => {
    const counts = countLetters(a.ayat28Text);
    const first = LETTER_INDEX.get(firstLetter(a.ayat28Text));
    const last = LETTER_INDEX.get(lastLetter(a.ayat28Text));
    counts.forEach((c, i) => {
      rows[i].Count += c;
      if (c > 0) {
        rows[i].versesWith++;
      } else {
        rows[i].versesWithout++;
      }
    });
    if (first !== undefined) {
      rows[first].FVs++;
    }
    if (last !== undefined) {
      rows[last].LVs++;
    }
    if (first !== undefined && first === last) {
      rows[first].FLVs++;
    }
  });

  swar.forEach(s => {
    const list = groups.get(s.swarId) || [];
    if (list.length === 0) {
      return;
    }
    const first = LETTER_INDEX.get(firstLetter(list[0].ayat28Text));
    const last = LETTER_INDEX.get(lastLetter(list[list.length - 1].ayat28Text));
    if (first !== undefined) {
      rows[first].FCs++;
    }
    if (last !== undefined) {
      rows[last].LCs++;
    }
    if (first !== undefined && first === last) {
      rows[first].FLCs++;
    }
    const used = new Set();
    list.forEach(a => countLetters(a.ayat28Text).forEach((c, i) => {
      if (c > 0) {
        used.add(i);
      }
    }));
    used.forEach(i => {
      rows[i].chaptersWith++;
    });
  });

  const totals = rows.reduce((t, r) => {
    ['Count', 'FCs', 'LCs', 'FLCs', 'FVs', 'LVs', 'FLVs'].forEach(k => {
      t[k] += r[k];
    });
    return t;
  }, {Count: 0, FCs: 0, LCs: 0, FLCs: 0, FVs: 0, LVs: 0, FLVs: 0});

  // مجموع تكرار كل صنف (إن مُرِّر جدول الحروف)
  const sumWhere = (test) => rows.filter(test).reduce((s, r) => s + r.Count, 0);
  const classGroups = classes.size === 0 ? null : {
    solar: {letters: rows.filter(r => r.solar).length, count: sumWhere(r => r.solar)},
    lunar: {letters: rows.filter(r => r.solar === false).length, count: sumWhere(r => r.solar === false)},
    nurani: {letters: rows.filter(r => r.nurani).length, count: sumWhere(r => r.nurani)},
    nonNurani: {letters: rows.filter(r => r.nurani === false).length, count: sumWhere(r => r.nurani === false)},
    natures: LETTER_NATURES.map(nature => ({
      nature: nature,
      letters: rows.filter(r => r.nature === nature).length,
      count: sumWhere(r => r.nature === nature)
    }))
  };

  return {rows: rows, totals: totals, groups: classGroups};
}

// دراسة حرف واحد: إحصاءاته + توزيعه على السور
export function studyLetter(swar, ayat, letter, letters) {
  const idx = LETTER_INDEX.get(letter);
  if (idx === undefined) {
    return null;
  }
  const stats = letterStats(swar, ayat, letters).rows[idx];
  const chapterData = chapterStats(swar, ayat);
  // نسبة الحرف من كل حروف القرآن، ونسبته من حروف كل سورة
  return Object.assign({}, stats, {
    percent: chapterData.totals.Cs ? stats.Count / chapterData.totals.Cs : 0,
    chapters: chapterData.rows.map(r => ({
      CpNo: r.CpNo,
      CpName: r.CpName,
      count: r.letters[idx],
      share: r.Cs ? r.letters[idx] / r.Cs : 0
    }))
  });
}

// موضع النظير في التناظر الدائري: نظير i حول المحور start من total عنصراً
export function mirrorIndex(start, i, total) {
  return (((2 * start - i) % total) + total) % total;
}

// تطابق الآيات داخل سورة (بنفس منطق تطابق السور): الآيات على دائرة،
// آية المحور وحدها، ثم كل آية مع نظيرتها على الجانب الآخر من المحور:
// (المحور+1 مع المحور-1)، (المحور+2 مع المحور-2)... مع الالتفاف حول السورة
// وإن كان عدد الآيات زوجياً فالآية المقابلة للمحور وحدها في الطرف الآخر
export function symmetricVerses(ayat, surahId, startAyah) {
  const list = ayat.filter(a => a.swarId === surahId);
  const n = list.length;
  if (n === 0 || startAyah < 1 || startAyah > n) {
    return null;
  }
  const info = (index) => {
    const a = list[index];
    return {
      num: a.ayatNum,
      text: a.ayat28Text,
      words: wordCount(a.ayat28Text),
      letters: lettersOf(a.ayat28Text).length
    };
  };
  const axis = startAyah - 1;
  const pairs = [];
  for (let k = 1; k <= Math.floor((n - 1) / 2); k++) {
    const right = (axis + k) % n;
    pairs.push({right: info(right), left: info(mirrorIndex(axis, right, n))});
  }
  return {
    surahId: surahId,
    surahName: list[0].swarName,
    totalAyahs: n,
    startAyah: startAyah,
    axis: info(axis),
    pairs: pairs,
    opposite: n % 2 === 0 ? info((axis + n / 2) % n) : null
  };
}

// =====================================================
// تحليلات القرآن (من مشروع PhsQuran): حروف السورة/الآية، تطابق السور،
// تطابق كلمتين. كلها دوال نقية تأخذ البيانات معاملاً.
// =====================================================

// تكرار الحروف في مجموعة نصوص (ayat28Text حسب قاعدة الدراسة)
function countCharacters(texts) {
  const charCounts = {};
  let totalChars = 0;
  let totalWords = 0;
  texts.forEach(text => {
    totalWords += text.trim().split(/\s+/).filter(Boolean).length;
    for (const char of text.replace(/\s+/g, '')) {
      charCounts[char] = (charCounts[char] || 0) + 1;
      totalChars++;
    }
  });
  const charList = Object.keys(charCounts)
    .map(char => ({char: char, count: charCounts[char]}))
    .sort((a, b) => b.count - a.count);
  return {
    totalWords: totalWords,
    totalChars: totalChars,
    uniqueCharsUsed: charList.length,
    charCounts: charList
  };
}

// حروف سورة كاملة
export function analyzeSurahCharacters(ayat, surahId) {
  const ayahs = ayat.filter(a => a.swarId === surahId);
  if (ayahs.length === 0) {
    return null;
  }
  return Object.assign({
    surahId: surahId,
    surahName: ayahs[0].swarName,
    totalAyahs: ayahs.length
  }, countCharacters(ayahs.map(a => a.ayat28Text)));
}

// حروف آية واحدة (ayatId المطلق)
export function analyzeAyahCharacters(ayat, ayahId) {
  const ayah = ayat.find(a => a.ayatId === ayahId);
  if (!ayah) {
    return null;
  }
  return Object.assign({
    ayahId: ayahId,
    surahId: ayah.swarId,
    surahName: ayah.swarName,
    ayahNum: ayah.ayatNum,
    text: ayah.ayatOText,
    text28: ayah.ayat28Text
  }, countCharacters([ayah.ayat28Text]));
}

// تطابق السور: محوران يمين ويسار حول سورة (57 سورة لكل محور)
export function symmetricChapters(swar, surahId) {
  if (surahId < 1 || surahId > 114) {
    return null;
  }
  const byId = new Map(swar.map(s => [s.swarId, s]));
  let up = surahId;
  let down = surahId - 1 < 1 ? 114 : surahId - 1;
  let upWrapped = false;
  let downWrapped = false;
  const rightArray = [];
  const leftArray = [];

  for (let i = 1; i <= 57; i++) {
    const upSurah = byId.get(up);
    const downSurah = byId.get(down);
    rightArray.push({id: upSurah.swarId, name: upSurah.swarName, ayahs: upSurah.swarAyat});
    leftArray.push({id: downSurah.swarId, name: downSurah.swarName, ayahs: downSurah.swarAyat});
    up++;
    down--;
    if (!upWrapped && up > 114) {
      up = 1;
      upWrapped = true;
    }
    if (!downWrapped && down < 1) {
      down = 114;
      downWrapped = true;
    }
  }

  return {baseSurah: surahId, rightArray: rightArray, leftArray: leftArray};
}

// تطابق كلمتين: الآيات التي فيها إحدى الكلمتين أو كلتاهما
// بدون تشكيل: ayatOText، بالتشكيل: ayatNText
export function symmetricWords(ayat, word1, word2, withTashkil) {
  const results = [];
  const totals = [0, 0, 0];
  let order = 1;

  ayat.forEach(ayah => {
    const text = withTashkil ? ayah.ayatNText : ayah.ayatOText;
    let count1 = 0;
    let count2 = 0;
    text.split(/\s+/).forEach(w => {
      if (w.includes(word1)) {
        count1++;
      }
      if (w.includes(word2)) {
        count2++;
      }
    });
    if (count1 > 0 || count2 > 0) {
      const both = count1 > 0 && count2 > 0 ? 1 : 0;
      results.push({
        order: order++,
        Count1: count1 > 0 ? count1 : '',
        Count2: count2 > 0 ? count2 : '',
        Count3: both > 0 ? both : '',
        SNum: ayah.swarId,
        SName: ayah.swarName,
        ANum: ayah.ayatNum,
        AText: ayah.ayatOText
      });
      totals[0] += count1;
      totals[1] += count2;
      totals[2] += both;
    }
  });

  return {Data: results, Counts: totals};
}

// البحث في الآيات (للقائمة F9): بدون تشكيل ayatSearch/ayatOText
export function searchAyat(ayat, query, limit = 200) {
  const q = (query || '').trim();
  if (!q) {
    return ayat.slice(0, limit);
  }
  const out = [];
  for (const a of ayat) {
    if ((a.ayatSearch || '').includes(q) || (a.ayatOText || '').includes(q) || (a.ayat28Text || '').includes(q)) {
      out.push(a);
      if (out.length >= limit) {
        break;
      }
    }
  }
  return out;
}

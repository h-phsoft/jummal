// =====================================================
// إحصاءات أحرف النص: العدد الكلي، دون تكرار، وتكرار كل حرف
// =====================================================
import {SUPPORTED_CHARS} from './letters.js';

// حساب الإحصاءات من النص المنقّى (تُستبعد المسافات)
export function computeTextStats(cleanText) {
  const counts = {};
  let total = 0;

  for (const char of cleanText || '') {
    if (char.trim() === '') {
      continue;
    }
    counts[char] = (counts[char] || 0) + 1;
    total++;
  }

  // ترتيب العرض أبجدياً حسب SUPPORTED_CHARS
  const letters = Object.keys(counts).sort((a, b) => {
    const ia = SUPPORTED_CHARS.indexOf(a);
    const ib = SUPPORTED_CHARS.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return {
    total: total,
    unique: letters.length,
    letters: letters,
    counts: counts
  };
}

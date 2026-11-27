// =====================================================
// نقاط المقطع: القيمة الافتراضية، وصيغة المسار، ونص العرض
// =====================================================

// نقطة البداية الافتراضية: أول الفاتحة، والنهاية: آخرها
export const DEFAULT_RANGE = {
  start: {surah: 1, ayah: 1, word: 1, char: 0},
  end: {surah: 1, ayah: 7, word: 0, char: 0}
};

// «1:6:2:0» للمسار /api/analysis/range
export function pointParam(p) {
  return `${p.surah}:${p.ayah}:${p.word || 0}:${p.char || 0}`;
}

// «الفاتحة آية 6 كلمة 2 حرف 3»
export function pointLabel(t, stats, p) {
  const surah = stats.segments.find(s => s.surahId === p.surah);
  return t('range_point_label', {
    surah: surah ? surah.surahName : p.surah,
    ayah: p.ayah,
    word: p.word,
    char: p.char > 0 ? t('range_point_char', {char: p.char}) : ''
  });
}

// لونا السلسلتين في الرسوم (A ثم B)
export const SERIES_COLORS = ['var(--gold-accent)', 'var(--accent-primary)'];

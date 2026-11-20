// =====================================================
// البحث عن رقم في كلمات القرآن (الجمل / الأبجد / الأيقغ)
// =====================================================

// words: مصفوفة qWordsData
// types: {jummal: bool, abjad: bool, ayqagh: bool}
export function findWordsByValue(words, value, types) {
  const counts = {total: 0, jummal: 0, abjad: 0, ayqagh: 0};
  const items = [];

  (words || []).forEach(word => {
    const item = {
      id: word.id,
      text: word.text28 || word.text || word.word || '',
      ntext: word.ntext || '',
      jummal: word.jummal !== undefined ? word.jummal : 0,
      abjad: word.abjad !== undefined ? word.abjad : 0,
      ayqagh: word.ayqagh !== undefined ? word.ayqagh : 0
    };
    item.match = {
      jummal: Boolean(types.jummal) && item.jummal === value,
      abjad: Boolean(types.abjad) && item.abjad === value,
      ayqagh: Boolean(types.ayqagh) && item.ayqagh === value
    };

    if (item.match.jummal || item.match.abjad || item.match.ayqagh) {
      items.push(item);
      counts.total++;
      if (item.match.jummal) {
        counts.jummal++;
      }
      if (item.match.abjad) {
        counts.abjad++;
      }
      if (item.match.ayqagh) {
        counts.ayqagh++;
      }
    }
  });

  return {items: items, counts: counts};
}

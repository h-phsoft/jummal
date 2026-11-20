/* global qWordsData */
// =====================================================
// البحث عن رقم في الكلمات - المصدر الوحيد لمنطق البحث
// تستدعيه صفحة "بحث عن رقم في الكلمات" و"المنصة الموحدة"
// =====================================================

// types: {jummal: bool, abjad: bool, ayqagh: bool}
function findWordsByValue(value, types) {
  const counts = {total: 0, jummal: 0, abjad: 0, ayqagh: 0};
  const items = [];
  const words = typeof qWordsData !== 'undefined' ? qWordsData : [];

  words.forEach(word => {
    const item = {
      text: word.text28 || word.text || word.word || '',
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

// تحديث عدادات رؤوس الأعمدة
function updateWordSearchCounters(counts, types) {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  };
  setText('totalCount', ` (${counts.total})`);
  setText('jummalCount', types.jummal ? ` (${counts.jummal})` : ' (0)');
  setText('abjadCount', types.abjad ? ` (${counts.abjad})` : ' (0)');
  setText('ayqaghCount', types.ayqagh ? ` (${counts.ayqagh})` : ' (0)');
}

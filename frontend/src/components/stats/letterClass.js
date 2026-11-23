// =====================================================
// دوال تمييز الحروف حسب جدول الحروف في البيانات (data/letters-data.js)
// =====================================================

// الطبائع الأربع: الاسم في البيانات ← المفتاح المستخدم في الأصناف والترجمة والرمز
export const NATURE_KEYS = {
  'ناري': {key: 'fire', icon: '🔥', color: '#dc2626'},
  'ترابي': {key: 'earth', icon: '⛰', color: '#92400e'},
  'هوائي': {key: 'air', icon: '🌬', color: '#0d9488'},
  'مائي': {key: 'water', icon: '💧', color: '#2563eb'}
};

// أصناف CSS لحرف حسب تصنيفه (info: {solar, nurani, nature} أو null)
export function letterClassName(info) {
  if (!info) {
    return '';
  }
  const nature = NATURE_KEYS[info.nature];
  return [
    info.solar ? 'letter-solar' : 'letter-lunar',
    info.nurani ? 'letter-nurani' : '',
    nature ? `letter-nature-${nature.key}` : ''
  ].filter(Boolean).join(' ');
}

// خريطة الحرف ← تصنيفه من جدول الحروف المحمّل
export function letterInfoMap(letters) {
  return new Map((letters || []).map(l => [l.chChar, {name: l.chName, solar: l.chSolar, nurani: l.chNurani, nature: l.chNature}]));
}

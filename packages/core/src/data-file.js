// =====================================================
// قراءة ملفات البيانات (const qAyatData = [...];) إلى مصفوفة
// تُستخدم في الخادم وفي سكربت تجهيز البيانات للواجهة
// =====================================================

export function parseDataFile(content) {
  const start = content.indexOf('[');
  const end = content.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Data file does not contain an array');
  }
  return JSON.parse(content.slice(start, end + 1));
}

// أسماء ملفات البيانات ومتغيراتها
export const DATA_FILES = {
  swar: 'swar-data.js',
  ayat: 'ayat-data.js',
  words: 'qwords-data.js'
};

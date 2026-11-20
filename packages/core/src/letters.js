// =====================================================
// الحروف وقيمها - المصدر الوحيد لحساب الجمّل في المشروع
// كل من يحتاج الحساب يستدعي الدوال من هنا ولا يكرر الحساب
// =====================================================

// الحروف الأساسية الثمانية والعشرون بالترتيب الأبجدي
const BASE_LETTERS = [
  'ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي',
  'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر',
  'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'
];

// الصور الفرعية وما تُحسب عليه من الحروف الأساسية
// (نفس تحويل النص القرآني بالحروف الـ 28 في ayat-data.js)
// ملاحظة: الهمزة المنفردة (ء) لا تُحسب وتُحذف من النص
const LETTER_VARIANTS = {
  'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
  'ة': 'ه',
  'ؤ': 'و',
  'ى': 'ي', 'ئ': 'ي'
};

// كل الحروف المقبولة في الحساب (بترتيب العرض)
const SUPPORTED_CHARS = [
  'ا', 'أ', 'إ', 'آ',
  'ب', 'ج', 'د',
  'ه', 'ة',
  'و', 'ؤ', 'ز', 'ح', 'ط',
  'ي', 'ى', 'ئ',
  'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر',
  'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'
];

// موقع كل حرف (0-27) في جداول القيم
const CHARS_INDEX = {};
SUPPORTED_CHARS.forEach(char => {
  CHARS_INDEX[char] = BASE_LETTERS.indexOf(LETTER_VARIANTS[char] || char);
});

// الجداول الأساسية الثلاثة (28 قيمة لكل جدول)
const JUMMAL_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 20, 30, 40, 50, 60, 70, 80, 90,
  100, 200, 300, 400, 500, 600, 700, 800, 900,
  1000
];
const ABJAD_VALUES = BASE_LETTERS.map((letter, index) => index + 1);
const AYQAGH_VALUES = BASE_LETTERS.map((letter, index) => (index % 9) + 1);

// تنقية النص إلى الحروف الـ 28 (مثل النص القرآني بالحروف الـ 28):
// الصور الفرعية تُكتب بحرفها الأساسي (يؤمنون ← يومنون، أحد ← احد)
// والهمزة المنفردة والتشكيل وغيرها تُحذف، مع مسافة واحدة بين الكلمات
function cleanArabicText(input) {
  let cleaned = '';
  let inWord = false;
  for (const char of input || '') {
    if (CHARS_INDEX[char] !== undefined) {
      cleaned += LETTER_VARIANTS[char] || char;
      inWord = true;
    } else if (char === ' ' && inWord) {
      cleaned += ' ';
      inWord = false;
    }
  }
  return cleaned.trim();
}

// تقسيم النص المنقّى إلى كلمات
function splitWords(cleanText) {
  return cleanText.split(/\s+/).filter(word => word.length > 0);
}

// قيمة نص كامل حسب جدول قيم (28 قيمة)
function calculateText(text, values) {
  let total = 0;
  for (const char of text) {
    const idx = CHARS_INDEX[char];
    if (idx !== undefined) {
      total += values[idx];
    }
  }
  return total;
}

// قيمة كل كلمة والمجموع حسب جدول قيم
function calculateWords(cleanText, values) {
  const words = splitWords(cleanText);
  const wordValues = words.map(word => calculateText(word, values));
  const total = wordValues.reduce((a, b) => a + b, 0);
  return {words: words, wordValues: wordValues, total: total};
}

// الحساب الثلاثي: الجمل + الأبجد + الأيقغ
function calculateTriple(text) {
  const jummal = calculateText(text, JUMMAL_VALUES);
  const abjadi = calculateText(text, ABJAD_VALUES);
  const iqghy = calculateText(text, AYQAGH_VALUES);
  return {jummal: jummal, abjadi: abjadi, iqghy: iqghy, triple: jummal + abjadi + iqghy};
}

export {
  BASE_LETTERS,
  LETTER_VARIANTS,
  SUPPORTED_CHARS,
  CHARS_INDEX,
  JUMMAL_VALUES,
  ABJAD_VALUES,
  AYQAGH_VALUES,
  cleanArabicText,
  splitWords,
  calculateText,
  calculateWords,
  calculateTriple
};

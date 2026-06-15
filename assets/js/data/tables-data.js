// === بيانات جداول الحساب ===

// 1. جدول الجمل (القيم الكلاسيكية)
const jummalTable = {
  'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5, 'ة': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10, 'ى': 10, 'ئ': 10,
  'ك': 20,
  'ل': 30,
  'م': 40,
  'ن': 50,
  'س': 60,
  'ع': 70,
  'ف': 80,
  'ص': 90,
  'ق': 100,
  'ر': 200,
  'ش': 300,
  'ت': 400,
  'ث': 500,
  'خ': 600,
  'ذ': 700,
  'ض': 800,
  'ظ': 900,
  'غ': 1000
};

// 2. جدول الأبجد (ترتيب الحروف 1-28)
const abjadTable = {};
const abjadOrder = ['ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
const abjadVariants = {
  'ا': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
  'ه': 'ه', 'ة': 'ه',
  'ي': 'ي', 'ى': 'ي', 'ئ': 'ي'
};

for (let i = 0; i < abjadOrder.length; i++) {
  const baseChar = abjadOrder[i];
  const value = i + 1;
  abjadTable[baseChar] = value;
}
// إضافة المتغيرات
for (let variant in abjadVariants) {
  const base = abjadVariants[variant];
  if (abjadTable[base]) {
    abjadTable[variant] = abjadTable[base];
  }
}

// 3. جدول الأيقغ (قيم modulo 9)
const ayqaghTable = {};
for (let char in abjadTable) {
  const idx = abjadTable[char];
  ayqaghTable[char] = ((idx - 1) % 9) + 1;
}

// تصدير الجداول
const tablesData = {
  jummal: {
    name: 'الجمل',
    values: jummalTable
  },
  abjad: {
    name: 'الأبجد',
    values: abjadTable
  },
  ayqagh: {
    name: 'الأيقغ',
    values: ayqaghTable
  }
};

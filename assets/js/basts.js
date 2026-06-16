// الحروف بالترتيب الأبجدي القديم
const chars = ['ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي',
  'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر',
  'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
// ============================================
// 1. الجمل (الأبجدية الكبرى) - القيم التقليدية
// ============================================
const jummalValues = {
  'ا': 1n, 'ب': 2n, 'ج': 3n, 'د': 4n, 'ه': 5n, 'و': 6n, 'ز': 7n,
  'ح': 8n, 'ط': 9n, 'ي': 10n, 'ك': 20n, 'ل': 30n, 'م': 40n, 'ن': 50n,
  'س': 60n, 'ع': 70n, 'ف': 80n, 'ص': 90n, 'ق': 100n, 'ر': 200n,
  'ش': 300n, 'ت': 400n, 'ث': 500n, 'خ': 600n, 'ذ': 700n, 'ض': 800n,
  'ظ': 900n, 'غ': 1000n
};

// ============================================
// 2. الأبجد (الأبجدية الصغرى) - من 1 إلى 28
// ============================================
const abjadValues = {};
chars.forEach((char, index) => {
  abjadValues[char] = BigInt(index + 1);
});

// ============================================
// 3. الأيقغ - تكرار الأرقام من 1 إلى 9
// ============================================
const abjadIgValues = {};
chars.forEach((char, index) => {
  const value = (index % 9) + 1;
  abjadIgValues[char] = BigInt(value);
});

// أسماء الحروف (البسط الأول)
const bast1Names = [
  'الف', 'با', 'جيم', 'دال', 'ها', 'واو', 'زاي',
  'حا', 'طا', 'يا', 'كاف', 'لام', 'ميم', 'نون',
  'سين', 'عين', 'فا', 'صاد', 'قاف', 'را',
  'شين', 'تا', 'ثا', 'خا', 'ذال', 'ضاد', 'ظا', 'غين'
];

// دالة لحساب قيمة الكلمة
function calculateWordValue(word, valueMap) {
  let sum = 0n;
  for (let char of word) {
    if (char !== ' ') {
      sum += valueMap[char] || 0n;
    }
  }
  return sum;
}

// دالة لحساب جميع البسطات
function calculateAllBasts() {
  const results = {
    chars: chars,
    bastValues: {}
  };

  let currentBast = bast1Names.slice();
  results.bastValues['bast1'] = currentBast;

  for (let i = 2; i <= 28; i++) {
    const nextBast = [];
    for (let word of currentBast) {
      const letters = word.split(' ');
      const newWord = letters.map(char => {
        const index = chars.indexOf(char);
        if (index !== -1) {
          return bast1Names[index];
        }
        return char;
      }).join(' ');
      nextBast.push(newWord);
    }
    results.bastValues[`bast${i}`] = nextBast;
    currentBast = nextBast;
  }

  return results;
}

// دالة لحساب القيم العددية لكل بسط
function calculateNumericValues(bastValues) {
  const numericResults = {
    'الجمل': [],
    'الأبجد': [],
    'الأيقغ': []
  };

  for (let i = 1; i <= 28; i++) {
    const bastKey = `bast${i}`;
    const bastArray = bastValues[bastKey];

    const jummalValuesArr = [];
    const abjadValuesArr = [];
    const igValuesArr = [];

    for (let word of bastArray) {
      jummalValuesArr.push(calculateWordValue(word, jummalValues));
      abjadValuesArr.push(calculateWordValue(word, abjadValues));
      igValuesArr.push(calculateWordValue(word, abjadIgValues));
    }

    numericResults['الجمل'].push(jummalValuesArr);
    numericResults['الأبجد'].push(abjadValuesArr);
    numericResults['الأيقغ'].push(igValuesArr);
  }

  return numericResults;
}

// دالة لتحويل BigInt إلى String للتسلسل JSON
function bigIntReplacer(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

// دالة لتوليد JSON الكامل
function generateJSON() {
  const bastResults = calculateAllBasts();
  const numericValues = calculateNumericValues(bastResults.bastValues);

  const result = {
    chars: chars,
    bast1: bastResults.bastValues.bast1,
    bast2: bastResults.bastValues.bast2,
    bast3: bastResults.bastValues.bast3,
    bast4: bastResults.bastValues.bast4,
    bast5: bastResults.bastValues.bast5,
    bast6: bastResults.bastValues.bast6,
    bast7: bastResults.bastValues.bast7,
    bast8: bastResults.bastValues.bast8,
    bast9: bastResults.bastValues.bast9,
    bast10: bastResults.bastValues.bast10,
    bast11: bastResults.bastValues.bast11,
    bast12: bastResults.bastValues.bast12,
    bast13: bastResults.bastValues.bast13,
    bast14: bastResults.bastValues.bast14,
    bast15: bastResults.bastValues.bast15,
    bast16: bastResults.bastValues.bast16,
    bast17: bastResults.bastValues.bast17,
    bast18: bastResults.bastValues.bast18,
    bast19: bastResults.bastValues.bast19,
    bast20: bastResults.bastValues.bast20,
    bast21: bastResults.bastValues.bast21,
    bast22: bastResults.bastValues.bast22,
    bast23: bastResults.bastValues.bast23,
    bast24: bastResults.bastValues.bast24,
    bast25: bastResults.bastValues.bast25,
    bast26: bastResults.bastValues.bast26,
    bast27: bastResults.bastValues.bast27,
    bast28: bastResults.bastValues.bast28,
    numericValues: numericValues
  };

  return result;
}

// دالة لتوليد جدول البيانات (tablesData)
function generateTablesData() {
  const bastResults = calculateAllBasts();
  const numericValues = calculateNumericValues(bastResults.bastValues);

  const tablesData = [];

  // 1. الجمل (القيم التقليدية)
  tablesData.push({
    name: 'الجمل',
    values: chars.map(char => Number(jummalValues[char]))
  });

  // 2. الأبجد (1-28)
  tablesData.push({
    name: 'الأبجد',
    values: chars.map((_, index) => index + 1)
  });

  // 3. الأيقغ (1-9 مكررة)
  tablesData.push({
    name: 'الأيقغ',
    values: chars.map((_, index) => (index % 9) + 1)
  });

  // 4. البسطات العددية
  for (let i = 1; i <= 28; i++) {
    const jummalValuesArr = numericValues['الجمل'][i - 1];
    const abjadValuesArr = numericValues['الأبجد'][i - 1];
    const igValuesArr = numericValues['الأيقغ'][i - 1];

    tablesData.push({
      name: `بسط الجمل ${i}`,
      values: jummalValuesArr.map(v => v.toString())
    });

    tablesData.push({
      name: `بسط الأبجد ${i}`,
      values: abjadValuesArr.map(v => v.toString())
    });

    tablesData.push({
      name: `بسط الأيقغ ${i}`,
      values: igValuesArr.map(v => v.toString())
    });
  }

  return tablesData;
}

// ============================================
// تنفيذ الكود وعرض النتائج
// ============================================

console.log('=== القيم الأساسية ===');
console.log('الجمل:', Object.fromEntries(
  Object.entries(jummalValues).map(([k, v]) => [k, Number(v)])
  ));
console.log('الأبجد:', Object.fromEntries(
  Object.entries(abjadValues).map(([k, v]) => [k, Number(v)])
  ));
console.log('الأيقغ:', Object.fromEntries(
  Object.entries(abjadIgValues).map(([k, v]) => [k, Number(v)])
  ));

// حساب وعرض bast1 و bast2
const bastResults = calculateAllBasts();
console.log('\n=== bast1 (الأسماء الأصلية) ===');
console.log(bastResults.bastValues.bast1);

console.log('\n=== bast2 (تفكيك bast1) ===');
console.log(bastResults.bastValues.bast2);

// حساب وعرض القيم العددية لـ bast1
const numericValues = calculateNumericValues(bastResults.bastValues);
console.log('\n=== القيم العددية لـ bast1 ===');
console.log('بسط الجمل 1:', numericValues['الجمل'][0].map(v => v.toString()));
console.log('بسط الأبجد 1:', numericValues['الأبجد'][0].map(v => v.toString()));
console.log('بسط الأيقغ 1:', numericValues['الأيقغ'][0].map(v => v.toString()));

// توليد جدول البيانات
const tablesData = generateTablesData();
console.log('\n=== tablesData (أول 6 عناصر) ===');
console.log(tablesData.slice(0, 6));

// توليد JSON الكامل (مع تحويل BigInt)
const fullJSON = generateJSON();
console.log('\n=== JSON الكامل (جزئي) ===');
console.log(JSON.stringify(fullJSON, bigIntReplacer, 2).substring(0, 2000) + '...');

// ============================================
// دوال مساعدة للاستخدام الفردي
// ============================================

// حساب بسط معين
function getBast(bastNumber) {
  const bastResults = calculateAllBasts();
  return bastResults.bastValues[`bast${bastNumber}`];
}

// حساب القيم العددية لبسط معين
function getNumericForBast(bastNumber) {
  const bastResults = calculateAllBasts();
  const numericValues = calculateNumericValues(bastResults.bastValues);

  return {
    'الجمل': numericValues['الجمل'][bastNumber - 1].map(v => v.toString()),
    'الأبجد': numericValues['الأبجد'][bastNumber - 1].map(v => v.toString()),
    'الأيقغ': numericValues['الأيقغ'][bastNumber - 1].map(v => v.toString())
  };
}

// مثال: حساب bast5
console.log('\n=== مثال: bast5 ===');
console.log('النصوص:', getBast(5).slice(0, 3));
console.log('القيم العددية:', getNumericForBast(5));

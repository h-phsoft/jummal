// ============================================
// الثوابت الأساسية
// ============================================
const chars = ['ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي',
  'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر',
  'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
const jummalValues = {
  'ا': 1n, 'ب': 2n, 'ج': 3n, 'د': 4n, 'ه': 5n, 'و': 6n, 'ز': 7n,
  'ح': 8n, 'ط': 9n, 'ي': 10n, 'ك': 20n, 'ل': 30n, 'م': 40n, 'ن': 50n,
  'س': 60n, 'ع': 70n, 'ف': 80n, 'ص': 90n, 'ق': 100n, 'ر': 200n,
  'ش': 300n, 'ت': 400n, 'ث': 500n, 'خ': 600n, 'ذ': 700n, 'ض': 800n,
  'ظ': 900n, 'غ': 1000n
};

const abjadValues = {};
chars.forEach((char, index) => {
  abjadValues[char] = BigInt(index + 1);
});

const abjadIgValues = {};
chars.forEach((char, index) => {
  abjadIgValues[char] = BigInt((index % 9) + 1);
});

const bast1Names = [
  'الف', 'با', 'جيم', 'دال', 'ها', 'واو', 'زاي',
  'حا', 'طا', 'يا', 'كاف', 'لام', 'ميم', 'نون',
  'سين', 'عين', 'فا', 'صاد', 'قاف', 'را',
  'شين', 'تا', 'ثا', 'خا', 'ذال', 'ضاد', 'ظا', 'غين'
];

const nameToLetters = {
  'الف': ['ا', 'ل', 'ف'], 'با': ['ب', 'ا'], 'جيم': ['ج', 'ي', 'م'],
  'دال': ['د', 'ا', 'ل'], 'ها': ['ه', 'ا'], 'واو': ['و', 'ا', 'و'],
  'زاي': ['ز', 'ا', 'ي'], 'حا': ['ح', 'ا'], 'طا': ['ط', 'ا'],
  'يا': ['ي', 'ا'], 'كاف': ['ك', 'ا', 'ف'], 'لام': ['ل', 'ا', 'م'],
  'ميم': ['م', 'ي', 'م'], 'نون': ['ن', 'و', 'ن'], 'سين': ['س', 'ي', 'ن'],
  'عين': ['ع', 'ي', 'ن'], 'فا': ['ف', 'ا'], 'صاد': ['ص', 'ا', 'د'],
  'قاف': ['ق', 'ا', 'ف'], 'را': ['ر', 'ا'], 'شين': ['ش', 'ي', 'ن'],
  'تا': ['ت', 'ا'], 'ثا': ['ث', 'ا'], 'خا': ['خ', 'ا'],
  'ذال': ['ذ', 'ا', 'ل'], 'ضاد': ['ض', 'ا', 'د'], 'ظا': ['ظ', 'ا'],
  'غين': ['غ', 'ي', 'ن']
};

// ============================================
// التخزين المؤقت (Cache)
// ============================================
const bastCache = new Map();
bastCache.set(1, bast1Names.slice());

// ============================================
// دالة حساب بسط معين فقط (عند الطلب)
// ============================================
function getBast(bastNumber) {
  if (bastCache.has(bastNumber)) {
    return bastCache.get(bastNumber);
  }

  let startFrom = 1;
  for (let i = bastNumber - 1; i >= 1; i--) {
    if (bastCache.has(i)) {
      startFrom = i;
      break;
    }
  }

  let currentBast = bastCache.get(startFrom);

  for (let i = startFrom + 1; i <= bastNumber; i++) {
    const nextBast = [];
    for (let word of currentBast) {
      const names = word.split(' ');
      const newWordParts = [];

      for (let name of names) {
        const letters = nameToLetters[name] || [name];
        for (let letter of letters) {
          const index = chars.indexOf(letter);
          if (index !== -1) {
            newWordParts.push(bast1Names[index]);
          } else {
            newWordParts.push(letter);
          }
        }
      }

      nextBast.push(newWordParts.join(' '));
    }

    bastCache.set(i, nextBast);
    currentBast = nextBast;
  }

  return bastCache.get(bastNumber);
}

// ============================================
// الدالة الرئيسية: تعيد البنية المطلوبة لبسط معين
// ============================================
function getBastData(bastNumber) {
  const words = getBast(bastNumber);

  const jummalArr = [];
  const abjadArr = [];
  const igArr = [];

  for (let word of words) {
    let jummalSum = 0n;
    let abjadSum = 0n;
    let igSum = 0n;

    for (let char of word) {
      if (char !== ' ') {
        jummalSum += jummalValues[char] || 0n;
        abjadSum += abjadValues[char] || 0n;
        igSum += abjadIgValues[char] || 0n;
      }
    }

    jummalArr.push(Number(jummalSum));
    abjadArr.push(Number(abjadSum));
    igArr.push(Number(igSum));
  }

  const group = `بسط ${bastNumber} ثلاثي`;

  return {
    words: words,
    tables: [
      {name: `بسط الجمل ${bastNumber}`, group: group, values: jummalArr},
      {name: `بسط الأبجد ${bastNumber}`, group: group, values: abjadArr},
      {name: `بسط الأيقغ ${bastNumber}`, group: group, values: igArr}
    ]
  };
}

// ============================================
// دالة مساعدة لعرض النتيجة بشكل منسق
// ============================================
function printBastData(bastNumber) {
  const data = getBastData(bastNumber);
  console.log(`\n========== بسط ${bastNumber} ==========`);
  /*
   console.log('\n--- الجداول ---');
   data.tables.forEach(table => {
   console.log(table);
   });
   console.log('\n--- مصفوفة الكلمات ---');
   console.log(data.words);
   */
  console.log(data);
  return data;
}
const bastData = printBastData(10);
console.log('--- التحقق من الحرف الأول (ا) ---');
console.log('قيمته في الجمل:', bastData.tables[0].values[0]);
console.log('قيمته في الأبجد:', bastData.tables[1].values[0]);
console.log('قيمته في الأيقغ:', bastData.tables[2].values[0]);

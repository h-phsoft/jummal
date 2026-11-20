// =====================================================
// حساب الأوفاق - المصدر الوحيد لتعمير الأوفاق وقيمها
// تستدعيه صفحة "عالم الأوفاق" و"المنصة الموحدة"
// =====================================================

// الثوابت السحرية (وهي أيضاً الحد الأدنى للتعمير)
const WEFEQ_MAGIC_CONSTANTS = {
  triangle: 15,
  square: 34,
  pentagon: 65,
  hexagon: 111,
  heptagon: 175,
  octagon: 260,
  nonagon: 369
};

const WEFEQ_ORDERS = {
  triangle: 3,
  square: 4,
  pentagon: 5,
  hexagon: 6,
  heptagon: 7,
  octagon: 8,
  nonagon: 9
};

// مواضع الخانات الخاصة في الوفق المثلث
const TRIANGLE_POSITIONS = {
  key: {row: 0, col: 1, name: "المفتاح"},
  ghalaq: {row: 1, col: 2, name: "المغلاق"},
  middle: {row: 1, col: 1, name: "الوسط"},
  fractionFix: {row: 1, col: 2, name: "جبر الكسر"}
};

// ترتيب ملء الوفق المثلث (من 2 إلى 9 بعد المفتاح)
const TRIANGLE_FILL_ORDER = [
  [2, 2], // → 2
  [1, 0], // → 3
  [2, 0], // → 4
  [1, 1], // → 5
  [0, 0], // → 6
  [1, 2], // → 7 ← جبر الكسر
  [0, 2], // → 8
  [2, 1]  // → 9
];

// النموذج الأساسي للمربع 4x4 (مقلوب ليبدأ من الأسفل)
const SQUARE_BASE = [
  [1, 14, 11, 8],
  [12, 7, 2, 13],
  [6, 9, 16, 3],
  [15, 4, 5, 10]
];

// النموذج الأساسي للمخمس 5x5
const PENTAGON_BASE = [
  [11, 18, 25, 2, 9],
  [10, 12, 19, 21, 3],
  [4, 6, 13, 20, 22],
  [23, 5, 7, 14, 16],
  [17, 24, 1, 8, 15]
];

function createEmptySquare(n) {
  return Array(n).fill().map(() => Array(n).fill(0));
}

// القيم المشتقة من الوفق (المفتاح، المغلاق، المساحة، الضابط...)
function computeWefeqStats(square, inputNumber) {
  const n = square.length;
  const allValues = square.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const alMasaha = allValues.reduce((a, b) => a + b, 0);
  const alDhabeet = inputNumber + alMasaha;
  const alGhaya = alDhabeet * 2;

  return {
    keyVal: minVal,
    ghalaqVal: maxVal,
    wufuq: inputNumber,
    khanaatAlDhal3: n,
    al3Adl: minVal + maxVal,
    alAs: inputNumber - n,
    alMasaha: alMasaha,
    alDhabeet: alDhabeet,
    alGhaya: alGhaya,
    alAsl: alGhaya * maxVal
  };
}

// تجميع نتيجة الوفق مع قيمه المشتقة
function buildWefeqResult(square, inputNumber, fraction, extra) {
  return Object.assign({square: square, fraction: fraction}, computeWefeqStats(square, inputNumber), extra || {});
}

// جبر الكسر للوفق المثلث: الباقي من قسمة (الرقم - 12) على 3
function triangleFraction(inputNumber) {
  return (inputNumber - 12) % 3;
}

// الوفق المثلث 3x3
function generateTriangleWefeq(inputNumber) {
  const base = Math.floor((inputNumber - 12) / 3);
  const remainder = triangleFraction(inputNumber);
  const square = createEmptySquare(3);
  square[TRIANGLE_POSITIONS.key.row][TRIANGLE_POSITIONS.key.col] = base;

  let currentValue = base;
  TRIANGLE_FILL_ORDER.forEach(([row, col]) => {
    currentValue += 1;
    const isFractionCell = row === TRIANGLE_POSITIONS.fractionFix.row && col === TRIANGLE_POSITIONS.fractionFix.col;
    if (isFractionCell && remainder > 0) {
      currentValue += remainder;
    }
    square[row][col] = currentValue;
  });

  return buildWefeqResult(square, inputNumber, remainder, {positions: TRIANGLE_POSITIONS});
}

// الوفق المربع 4x4
function generateSquareWefeq(inputNumber) {
  const diff = inputNumber - WEFEQ_MAGIC_CONSTANTS.square;
  const addPerCell = Math.floor(diff / 4);
  const remainder = diff % 4;
  const square = SQUARE_BASE.map(row => row.map(value => value + addPerCell));

  // جبر الكسر في الصف الأول، العمود الثالث
  if (remainder > 0) {
    square[0][2] += remainder;
  }

  return buildWefeqResult(square, inputNumber, remainder);
}

// الوفق المخمس 5x5
function generatePentagonWefeq(inputNumber) {
  const n = 5;
  const diff = inputNumber - WEFEQ_MAGIC_CONSTANTS.pentagon;
  const addPerCell = Math.floor(diff / n);
  const remainder = diff % n;
  const square = createEmptySquare(n);

  // عكس الصفوف ليبدأ الترتيب من الأسفل
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      square[i][j] = PENTAGON_BASE[n - 1 - i][j] + addPerCell;
    }
  }

  // جبر الكسر في الصف الأول، العمود الأخير
  if (remainder > 0) {
    square[0][n - 1] += remainder;
  }

  return buildWefeqResult(square, inputNumber, remainder);
}

// ترتيب الملء بالطريقة السيامية للأوفاق الفردية
function generateSiameseFillOrder(n) {
  const order = [];
  const grid = Array(n).fill().map(() => Array(n).fill(false));
  let row = 0;
  let col = Math.floor(n / 2);

  for (let i = 0; i < n * n; i++) {
    order.push([row, col]);
    grid[row][col] = true;
    const nextRow = (row - 1 + n) % n;
    const nextCol = (col + 1) % n;
    if (grid[nextRow][nextCol]) {
      row = (row + 1) % n;
    } else {
      row = nextRow;
      col = nextCol;
    }
  }

  return order;
}

// الأوفاق الفردية (7x7، 9x9) بالطريقة السيامية
function generateOddWefeq(inputNumber, n) {
  const magicConstant = n * (n * n + 1) / 2;
  const diff = inputNumber - magicConstant;
  const base = Math.floor(diff / n);
  const remainder = diff % n;
  const fillOrder = generateSiameseFillOrder(n);
  const square = createEmptySquare(n);

  fillOrder.forEach(([row, col], index) => {
    // عكس الصف ليبدأ من الأسفل
    let value = (index + 1) + base;
    // جبر الكسر في آخر خانة
    if (remainder > 0 && index === fillOrder.length - 1) {
      value += remainder;
    }
    square[n - 1 - row][col] = value;
  });

  return buildWefeqResult(square, inputNumber, remainder);
}

// الأوفاق الزوجية (6x6، 8x8): من الأسفل للأعلى ومن اليسار لليمين
function generateEvenWefeq(inputNumber, n) {
  const magicConstant = n * (n * n + 1) / 2;
  const diff = inputNumber - magicConstant;
  const base = Math.floor(diff / n);
  const remainder = diff % n;
  const square = createEmptySquare(n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const rowFromBottom = n - 1 - i;
      square[i][j] = (rowFromBottom * n + j + 1) + base;
    }
  }

  // جبر الكسر في الصف الأول، العمود الأخير
  if (remainder > 0) {
    square[0][n - 1] += remainder;
  }

  return buildWefeqResult(square, inputNumber, remainder);
}

// دراسة الرقم: هل يمكن تعميره في الشكل؟ وهل يحتاج جبر كسر؟
function studyWefeqNumber(inputNumber, shape) {
  const minVal = WEFEQ_MAGIC_CONSTANTS[shape];
  const n = WEFEQ_ORDERS[shape];

  if (inputNumber < minVal) {
    return {
      possible: false,
      needsFractionFix: false,
      message: "الرقم أصغر من الحد الأدنى للتعمير"
    };
  }

  const remainder = (inputNumber - minVal) % n;
  return {
    possible: true,
    needsFractionFix: remainder !== 0,
    remainder: remainder
  };
}

// توليد الوفق حسب الشكل
function generateWefeq(inputNumber, shape) {
  switch (shape) {
    case 'triangle':
      return generateTriangleWefeq(inputNumber);
    case 'square':
      return generateSquareWefeq(inputNumber);
    case 'pentagon':
      return generatePentagonWefeq(inputNumber);
    case 'hexagon':
      return generateEvenWefeq(inputNumber, 6);
    case 'heptagon':
      return generateOddWefeq(inputNumber, 7);
    case 'octagon':
      return generateEvenWefeq(inputNumber, 8);
    case 'nonagon':
      return generateOddWefeq(inputNumber, 9);
    default:
      return null;
  }
}

// شرح جبر الكسر حسب الشكل
function wefeqFractionExplanation(shape) {
  if (shape === 'triangle') {
    return 'الباقي من قسمة (الرقم - 12) على 3';
  }
  if (shape === 'square') {
    return 'الباقي من قسمة (الأساس - 30) على 4';
  }
  return `الباقي من قسمة (الرقم - ${WEFEQ_MAGIC_CONSTANTS[shape]}) على ${WEFEQ_ORDERS[shape]}`;
}

// صفوف جدول الدليل (الاسم، الشرح، القيمة)
function buildWefeqInfoRows(result, shape) {
  return [
    {name: "جبر الكسر", explanation: wefeqFractionExplanation(shape), value: result.fraction},
    {name: "خانات الضلع", explanation: "عدد الخانات في الضلع الواحد", value: result.khanaatAlDhal3},
    {name: "الوفق", explanation: "مجموع القيم في كل سطر أو عمود", value: result.wufuq},
    {name: "المفتاح", explanation: "أصغر قيمة في الوفق", value: result.keyVal},
    {name: "المغلاق", explanation: "أكبر قيمة في الوفق", value: result.ghalaqVal},
    {name: "العدل", explanation: "مجموع المفتاح والمغلاق", value: result.al3Adl},
    {name: "الأس", explanation: "قيمة الوفق منقوصًا منها عدد خانات الضلع", value: result.alAs},
    {name: "المساحة", explanation: "مجموع قيم جميع الخانات", value: result.alMasaha},
    {name: "الضابط", explanation: "مجموع الوفق مع المساحة", value: result.alDhabeet},
    {name: "الغاية", explanation: "ضعف قيمة الضابط", value: result.alGhaya},
    {name: "الأصل", explanation: "حاصل ضرب الغاية في المغلاق", value: result.alAsl}
  ];
}

// كلاس تلوين الخانة (جبر الكسر، المفتاح، المغلاق، الوسط)
function wefeqCellClass(result, shape, i, j) {
  const n = result.square.length;
  const val = result.square[i][j];

  if (result.fraction > 0) {
    if (shape === 'triangle') {
      const pos = result.positions.fractionFix;
      return (i === pos.row && j === pos.col) ? 'fraction-fix' : '';
    }
    if (shape === 'square') {
      return (i === 1 && j === 2) ? 'fraction-fix' : '';
    }
    return (i === n - 1 && j === n - 1) ? 'fraction-fix' : '';
  }

  if (val === result.keyVal) {
    return 'key';
  }
  if (val === result.ghalaqVal) {
    return 'ghalaq';
  }
  if (shape === 'triangle' && i === result.positions.middle.row && j === result.positions.middle.col) {
    return 'middle';
  }
  return '';
}

// رسم خانات الوفق داخل حاوية (مع قائمة خيارات الأرقام إن وجدت)
function renderWefeqCells($container, result, shape) {
  const n = result.square.length;
  const hasActions = typeof numberCellContent === 'function';
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const val = result.square[i][j];
      const $cell = $('<div class="magic-cell">').addClass(wefeqCellClass(result, shape, i, j));
      if (hasActions) {
        $cell.addClass('number-cell').attr('data-number', val).html(numberCellContent(val, false));
      } else {
        $cell.text(val);
      }
      $container.append($cell);
    }
  }
}

// رسم جدول الدليل داخل tbody
function renderWefeqInfoTable($tbody, result, shape) {
  const hasActions = typeof numberCellContent === 'function';
  $tbody.empty();
  buildWefeqInfoRows(result, shape).forEach(row => {
    const valueCell = hasActions
      ? `<td class="number-cell" data-number="${row.value}"><strong>${numberCellContent(row.value, false)}</strong></td>`
      : `<td><strong>${row.value}</strong></td>`;
    $tbody.append(`
      <tr>
        <td><strong>${row.name}</strong></td>
        <td>${row.explanation}</td>
        ${valueCell}
      </tr>
    `);
  });
}

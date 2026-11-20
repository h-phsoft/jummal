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

// النماذج الأساسية لكل الأوفاق (مجموع كل صف وعمود وقطر = الثابت السحري)
// في كل نموذج تقع الأرقام الأخيرة (من n²-n+1 إلى n²) مرة واحدة
// في كل صف وكل عمود وكل قطر، فإضافة جبر الكسر إليها تُبقي الوفق كاملاً
const WEFEQ_BASES = {
  triangle: [
    [8, 1, 6],
    [3, 5, 7],
    [4, 9, 2]
  ],
  square: [
    [1, 14, 11, 8],
    [12, 7, 2, 13],
    [6, 9, 16, 3],
    [15, 4, 5, 10]
  ],
  pentagon: [
    [25, 6, 17, 3, 14],
    [2, 13, 24, 10, 16],
    [9, 20, 1, 12, 23],
    [11, 22, 8, 19, 5],
    [18, 4, 15, 21, 7]
  ],
  hexagon: [
    [31, 22, 24, 13, 3, 18],
    [26, 2, 11, 32, 10, 30],
    [1, 33, 29, 14, 27, 7],
    [9, 21, 34, 20, 12, 15],
    [25, 16, 8, 4, 23, 35],
    [19, 17, 5, 28, 36, 6]
  ],
  heptagon: [
    [41, 7, 15, 30, 45, 11, 26],
    [43, 9, 24, 39, 5, 20, 35],
    [3, 18, 33, 48, 14, 22, 37],
    [12, 27, 42, 1, 16, 31, 46],
    [21, 29, 44, 10, 25, 40, 6],
    [23, 38, 4, 19, 34, 49, 8],
    [32, 47, 13, 28, 36, 2, 17]
  ],
  octagon: [
    [1, 10, 19, 28, 37, 46, 55, 64],
    [20, 27, 2, 9, 56, 63, 38, 45],
    [39, 48, 53, 62, 3, 12, 17, 26],
    [54, 61, 40, 47, 18, 25, 4, 11],
    [32, 23, 14, 5, 60, 51, 42, 33],
    [13, 6, 31, 24, 41, 34, 59, 52],
    [58, 49, 44, 35, 30, 21, 16, 7],
    [43, 36, 57, 50, 15, 8, 29, 22]
  ],
  nonagon: [
    [42, 62, 72, 79, 32, 12, 19, 2, 49],
    [4, 54, 34, 44, 24, 55, 65, 75, 14],
    [35, 73, 56, 66, 52, 5, 15, 22, 45],
    [57, 23, 6, 13, 74, 36, 43, 53, 64],
    [11, 31, 41, 51, 1, 71, 81, 61, 21],
    [46, 69, 76, 59, 39, 25, 8, 18, 29],
    [77, 16, 26, 9, 67, 47, 30, 37, 60],
    [27, 38, 48, 28, 17, 78, 58, 68, 7],
    [70, 3, 10, 20, 63, 40, 50, 33, 80]
  ]
};

// باقي قسمة لا يكون سالباً (للأرقام الأصغر من الثابت السحري في المثلث)
function positiveMod(a, n) {
  return ((a % n) + n) % n;
}

// موضع قيمة معينة في نموذج أساسي
function findCellOfValue(square, value) {
  for (let i = 0; i < square.length; i++) {
    const j = square[i].indexOf(value);
    if (j !== -1) {
      return {row: i, col: j};
    }
  }
  return null;
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

// جبر الكسر للوفق المثلث: الباقي من قسمة (الرقم - 12) على 3
function triangleFraction(inputNumber) {
  return positiveMod(inputNumber - 12, 3);
}

// =====================================================
// طريقة التعمير الواحدة لكل الأشكال:
//   1) الفرق = الرقم - الثابت السحري
//   2) كل خانة = قيمتها في النموذج + (الفرق ÷ n بلا كسر)
//   3) جبر الكسر (باقي القسمة) يُضاف إلى الأرقام من n²-n+1 إلى n²
// =====================================================
function generateWefeq(inputNumber, shape) {
  const base = WEFEQ_BASES[shape];
  if (!base) {
    return null;
  }
  const n = base.length;
  const diff = inputNumber - WEFEQ_MAGIC_CONSTANTS[shape];
  const addPerCell = Math.floor(diff / n);
  const remainder = positiveMod(diff, n);
  const fractionStart = n * n - n + 1;

  const square = base.map(row => row.map(value => {
    const fraction = value >= fractionStart ? remainder : 0;
    return value + addPerCell + fraction;
  }));

  return Object.assign(
    {square: square, fraction: remainder, fractionFix: findCellOfValue(base, fractionStart)},
    computeWefeqStats(square, inputNumber)
  );
}

// الوفق المثلث (تستدعيه المنصة الموحدة)
function generateTriangleWefeq(inputNumber) {
  return generateWefeq(inputNumber, 'triangle');
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

// شرح جبر الكسر حسب الشكل
function wefeqFractionExplanation(shape) {
  if (shape === 'triangle') {
    return 'الباقي من قسمة (الرقم - 12) على 3';
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

// كلاس تلوين الخانة: لا يُلوَّن إلا خانة جبر الكسر، وفقط عند وجود كسر
function wefeqCellClass(result, shape, i, j) {
  const pos = result.fractionFix;
  if (result.fraction > 0 && pos && i === pos.row && j === pos.col) {
    return 'fraction-fix';
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

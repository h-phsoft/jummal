$(document).ready(function () {

  // ============================================
  // الوفق المثلث 3x3 - نفس منطق wfq-3x3.js
  // ============================================
  const trianglePositions = {
    key: {row: 2, col: 1, name: "المفتاح"},
    ghalaq: {row: 1, col: 2, name: "المغلاق"},
    middle: {row: 1, col: 1, name: "الوسط"},
    fractionFix: {row: 1, col: 2, name: "جبر الكسر"}
  };

  const triangleFillOrder = [
    [0, 2], // → 2
    [1, 0], // → 3
    [0, 0], // → 4
    [1, 1], // → 5
    [2, 2], // → 6
    [1, 2], // → 7 ← جبر الكسر
    [2, 0], // → 8
    [0, 1]  // → 9
  ];

  function generateTriangleWefeq(inputNumber) {
    // استخدام نفس المنطق تماماً من wfq-3x3.js
    // مع قلب الصفوف ليبدأ الترتيب من الأسفل
    const positions = {
      key: {row: 0, col: 1, name: "المفتاح"}, // بعد القلب يصبح في الصف الأول
      ghalaq: {row: 1, col: 2, name: "المغلاق"},
      middle: {row: 1, col: 1, name: "الوسط"},
      fractionFix: {row: 1, col: 2, name: "جبر الكسر"}
    };

    const fillOrder = [
      [2, 2], // → 2 (بعد القلب يصبح في الصف الأخير)
      [1, 0], // → 3
      [2, 0], // → 4
      [1, 1], // → 5
      [0, 0], // → 6
      [1, 2], // → 7 ← جبر الكسر
      [0, 2], // → 8
      [2, 1]  // → 9
    ];

    const base = Math.floor((inputNumber - 12) / 3);
    const remainder = (inputNumber - 12) % 3;

    const square = Array(3).fill().map(() => Array(3).fill(0));
    square[positions.key.row][positions.key.col] = base;

    let currentValue = base;
    for (let i = 0; i < fillOrder.length; i++) {
      const [row, col] = fillOrder[i];
      currentValue += 1;
      if (row === positions.fractionFix.row && col === positions.fractionFix.col && remainder > 0) {
        currentValue += remainder;
      }
      square[row][col] = currentValue;
    }

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = square[0].reduce((a, b) => a + b, 0);
    const khanaatAlDhal3 = 3;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder,
      positions: positions
    };
  }

  // ============================================
  // الوفق المربع 4x4 - التوزيع المطلوب
  // النموذج الأساسي (مجموع 34):
  // 15  4  5 10
  //  6  9 16  3
  // 12  7  2 13
  //  1 14 11  8
  // ============================================
  function generateSquareWefeq(inputNumber) {
    // النموذج الأساسي للوفق المربع (عندما يكون الأساس 34)
    // مقلوب ليبدأ من الأسفل
    const baseSquare = [
      [1, 14, 11, 8],
      [12, 7, 2, 13],
      [6, 9, 16, 3],
      [15, 4, 5, 10]
    ];

    // حساب الفرق عن الأساس 34
    const diff = inputNumber - 34;
    const addPerCell = Math.floor(diff / 4);
    const remainder = diff % 4;

    const square = Array(4).fill().map(() => Array(4).fill(0));

    // إضافة القيمة الأساسية لكل خلية
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        square[i][j] = baseSquare[i][j] + addPerCell;
      }
    }

    // إضافة جبر الكسر في الخانة المناسبة (الصف الأول، العمود الثالث - أعلى يمين بعد القلب)
    if (remainder > 0) {
      square[0][2] += remainder;
    }

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = inputNumber;
    const khanaatAlDhal3 = 4;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  // ============================================
  // الأوفاق الفردية (5x5, 7x7, 9x9) - Siamese Method
  // ============================================
  function generateSiameseFillOrder(n) {
    const order = [];
    const grid = Array(n).fill().map(() => Array(n).fill(false));
    let row = 0;
    let col = Math.floor(n / 2);

    for (let i = 0; i < n * n; i++) {
      order.push([row, col]);
      grid[row][col] = true;

      let nextRow = (row - 1 + n) % n;
      let nextCol = (col + 1) % n;

      if (grid[nextRow][nextCol]) {
        row = (row + 1) % n;
      } else {
        row = nextRow;
        col = nextCol;
      }
    }

    return order;
  }

  // النموذج الأساسي للمخمس 5x5 حسب النمط المطلوب:
  // 11 18 25 2  9
  // 10 12 19 21 3
  // 4  6  13 20 22
  // 23 5  7  14 16
  // 17 24 1  8  15
  const pentagonBaseSquare = [
    [11, 18, 25, 2,  9],
    [10, 12, 19, 21, 3],
    [4,  6,  13, 20, 22],
    [23, 5,  7,  14, 16],
    [17, 24, 1,  8,  15]
  ];

  function generatePentagonWefeq(inputNumber) {
    const n = 5;
    const magicConstant = 65; // الثابت السحري للمخمس 5x5
    const diff = inputNumber - magicConstant;
    const addPerCell = Math.floor(diff / n);
    const remainder = diff % n;

    const square = Array(n).fill().map(() => Array(n).fill(0));

    // إضافة القيمة الأساسية لكل خلية من النموذج الأساسي
    // نعكس الصفوف ليبدأ الترتيب من الأسفل
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const rowFromBottom = n - 1 - i;
        square[i][j] = pentagonBaseSquare[rowFromBottom][j] + addPerCell;
      }
    }

    // إضافة جبر الكسر في آخر خانة (الصف الأول، العمود الأخير - أعلى يمين بعد القلب)
    if (remainder > 0) {
      square[0][n - 1] += remainder;
    }

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = inputNumber;
    const khanaatAlDhal3 = n;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  function generateOddWefeq(inputNumber, n) {
    const magicConstant = n * (n * n + 1) / 2;
    const diff = inputNumber - magicConstant;
    const base = Math.floor(diff / n);
    const remainder = diff % n;

    const fillOrder = generateSiameseFillOrder(n);
    const square = Array(n).fill().map(() => Array(n).fill(0));

    // البدء بالقيم الأساسية (1 إلى n²) مرتبة حسب Siamese
    // لكن نملأ من الأسفل للأعلى (نعكس ترتيب الصفوف)
    fillOrder.forEach((pos, index) => {
      let [row, col] = pos;
      // عكس الصف ليبدأ من الأسفل
      row = n - 1 - row;
      let value = (index + 1) + base;

      // إضافة جبر الكسر في آخر خانة
      if (remainder > 0 && index === fillOrder.length - 1) {
        value += remainder;
      }

      square[row][col] = value;
    });

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = inputNumber;
    const khanaatAlDhal3 = n;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  // ============================================
  // الوفق المثمن 8x8 - طريقة خاصة للأرقام الزوجية
  // النمط مقلوب: يبدأ من الأسفل إلى الأعلى، ومن اليسار إلى اليمين
  // ============================================
  function generateOctagonWefeq(inputNumber, n = 8) {
    const magicConstant = n * (n * n + 1) / 2;
    const diff = inputNumber - magicConstant;
    const base = Math.floor(diff / n);
    const remainder = diff % n;

    const square = Array(n).fill().map(() => Array(n).fill(0));

    // توليد الأرقام من الأسفل إلى الأعلى، ومن اليسار إلى اليمين
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const rowFromBottom = n - 1 - i;
        square[i][j] = (rowFromBottom * n + j + 1) + base;
      }
    }

    // إضافة جبر الكسر في آخر خانة (الصف الأول، العمود الأخير - أعلى يمين)
    if (remainder > 0) {
      square[0][n - 1] += remainder;
    }

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = inputNumber;
    const khanaatAlDhal3 = n;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  // ============================================
  // الوفق المسدس 6x6 - طريقة خاصة للأرقام الزوجية
  // النمط مقلوب: يبدأ من الأسفل إلى الأعلى، ومن اليسار إلى اليمين
  // النموذج الأساسي (مقلوب):
  // 31 32 33 34 35 36
  // 25 26 27 28 29 30
  // 19 20 21 22 23 24
  // 13 14 15 16 17 18
  // 7  8  9  10 11 12
  // 1  2  3  4  5  6
  // ============================================
  function generateEvenWefeq(inputNumber, n) {
    const magicConstant = n * (n * n + 1) / 2;
    const diff = inputNumber - magicConstant;
    const base = Math.floor(diff / n);
    const remainder = diff % n;

    const square = Array(n).fill().map(() => Array(n).fill(0));

    // توليد الأرقام من الأسفل إلى الأعلى، ومن اليسار إلى اليمين
    // الصف الأخير (n-1) يحتوي على 1 إلى n
    // الصف قبل الأخير (n-2) يحتوي على n+1 إلى 2n
    // ... وهكذا
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // الصف السفلي (i = n-1) يبدأ بـ 1، الصف الذي فوقه (i = n-2) يبدأ بـ n+1، إلخ
        const rowFromBottom = n - 1 - i;
        square[i][j] = (rowFromBottom * n + j + 1) + base;
      }
    }

    // إضافة جبر الكسر في آخر خانة (الصف الأول، العمود الأخير - أعلى يمين)
    if (remainder > 0) {
      square[0][n - 1] += remainder;
    }

    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    const wufuq = inputNumber;
    const khanaatAlDhal3 = n;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;

    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  // ============================================
  // الوفق المتسع 9x9 - الطريقة المركبة (Composite Squares)
  // يتكون من 9 مربعات 3x3، كل مربع هو وفق مثلثي
  // النموذج الأساسي (مجموع 369):
  // 31 36 29 | 76 81 74 | 13 18 11
  // 30 32 34 | 75 77 79 | 12 14 16
  // 35 28 33 | 80 73 78 | 17 10 15
  // ---------+----------+---------
  // 22 27 20 | 40 45 38 | 58 63 56
  // 21 23 25 | 39 41 43 | 57 59 61
  // 26 19 24 | 44 37 42 | 62 55 60
  // ---------+----------+---------
  // 67 72 65 |  4  9  2 | 49 54 47
  // 66 68 70 |  3  5  7 | 48 50 52
  // 71 64 69 |  8  1  6 | 53 46 51
  // ============================================
  
  // النموذج الأساسي للمربع 3x3 (لو شو Lo Shu)
  const loShuBase = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ];
  
  // نموذج الإزاحة للكتل 3x3 (أيضاً وفق مثلثي بمجموع 12)
  const offsetMultiplier = [
    [3, 8, 1],
    [2, 4, 6],
    [7, 0, 5]
  ];
  
  function generateNonagonWefeq(inputNumber) {
    const n = 9;
    const magicConstant = 369; // الثابت السحري للمربع 9x9: 9*(81+1)/2 = 369
    const diff = inputNumber - magicConstant;
    
    // حساب الإضافة الأساسية لكل خلية
    const addPerCell = Math.floor(diff / n);
    const remainder = diff % n;
    
    const square = Array(n).fill().map(() => Array(n).fill(0));
    
    // بناء المربع 9x9 من 9 كتل 3x3
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        // حساب الإزاحة لهذه الكتلة
        const offset = offsetMultiplier[blockRow][blockCol] * 9;
        
        // ملء الكتلة 3x3
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = blockRow * 3 + i;
            const col = blockCol * 3 + j;
            square[row][col] = loShuBase[i][j] + offset + addPerCell;
          }
        }
      }
    }
    
    // إضافة جبر الكسر في آخر خانة (الصف الأول، العمود الأخير)
    if (remainder > 0) {
      square[0][n - 1] += remainder;
    }
    
    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    
    const wufuq = inputNumber;
    const khanaatAlDhal3 = n;
    const al3Adl = minVal + maxVal;
    const alAs = wufuq - khanaatAlDhal3;
    const alMasaha = allValues.reduce((a, b) => a + b, 0);
    const alDhabeet = wufuq + alMasaha;
    const alGhaya = alDhabeet * 2;
    const alAsl = alGhaya * maxVal;
    
    return {
      square: square,
      keyVal: minVal,
      ghalaqVal: maxVal,
      wufuq: wufuq,
      khanaatAlDhal3: khanaatAlDhal3,
      al3Adl: al3Adl,
      alAs: alAs,
      alMasaha: alMasaha,
      alDhabeet: alDhabeet,
      alGhaya: alGhaya,
      alAsl: alAsl,
      fraction: remainder
    };
  }

  // ============================================
  // دوال مساعدة
  // ============================================

  // ثوابت سحرية وحدود دنيا
  const magicConstants = {
    triangle: 15,
    square: 34,
    pentagon: 65,
    hexagon: 111,
    heptagon: 175,
    octagon: 260,
    nonagon: 369
  };

  const minValues = {
    triangle: 15,
    square: 34,
    pentagon: 65,
    hexagon: 111,
    heptagon: 175,
    octagon: 260,
    nonagon: 369
  };

  // دالة دراسة الرقم وتحديد إمكانية التعمير
  function studyNumber(inputNumber, shape) {
    const minVal = minValues[shape];
    const magicConst = magicConstants[shape];
    const n = shape === 'triangle' ? 3 :
      shape === 'square' ? 4 :
      shape === 'pentagon' ? 5 :
      shape === 'hexagon' ? 6 :
      shape === 'heptagon' ? 7 :
      shape === 'octagon' ? 8 : 9;

    if (inputNumber < minVal) {
      return {
        possible: false,
        needsFractionFix: false,
        message: "الرقم أصغر من الحد الأدنى للتعمير"
      };
    }

    const diff = inputNumber - magicConst;
    const remainder = diff % n;

    if (remainder === 0) {
      return {
        possible: true,
        needsFractionFix: false,
        remainder: 0
      };
    } else {
      return {
        possible: true,
        needsFractionFix: true,
        remainder: remainder
      };
    }
  }

  // دالة توليد الوفق حسب الشكل
  function generateWefeq(inputNumber, shape) {
    switch (shape) {
      case 'triangle':
        return generateTriangleWefeq(inputNumber);
      case 'square':
        return generateSquareWefeq(inputNumber);
      case 'pentagon':
        return generatePentagonWefeq(inputNumber);
      case 'heptagon':
        return generateOddWefeq(inputNumber, 7);
      case 'octagon':
        return generateOctagonWefeq(inputNumber, 8);
      case 'nonagon':
        return generateOddWefeq(inputNumber, 9);
      case 'hexagon':
        return generateEvenWefeq(inputNumber, 6);
      default:
        return null;
    }
  }

  // دالة عرض الوفق
  function renderWefeq(result, shape, inputNumber) {
    const n = result.square.length;
    const $container = $('#magicSquareContainer').empty();

    const $grid = $('<div class="magic-square">').addClass(`grid-${n}x${n}`);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = result.square[i][j];
        const $cell = $('<div class="magic-cell">').text(val);
        
        // تلوين خانة جبر الكسر فقط إذا وجد
        if (result.fraction > 0) {
          if (shape === 'triangle' && i === result.positions.fractionFix.row && j === result.positions.fractionFix.col) {
            $cell.addClass('fraction-fix');
          } else if (shape === 'square' && i === 1 && j === 2) {
            $cell.addClass('fraction-fix');
          } else if (i === n - 1 && j === n - 1) {
            $cell.addClass('fraction-fix');
          }
        } else {
          // تلوين المفتاح والمغلاق والوسط فقط عندما لا يوجد جبر كسر
          if (val === result.keyVal) {
            $cell.addClass('key');
          } else if (val === result.ghalaqVal) {
            $cell.addClass('ghalaq');
          } else if (shape === 'triangle' && i === result.positions.middle.row && j === result.positions.middle.col) {
            $cell.addClass('middle');
          }
        }

        $grid.append($cell);
      }
    }

    $container.append($grid);

    // تحديث جدول المعلومات
    updateInfoTable(shape, inputNumber, result);
  }

  // تحديث جدول المعلومات
  function updateInfoTable(shape, inputNumber, result) {
    const n = result.square.length;
    const allValues = result.square.flat();
    const sum = allValues.reduce((a, b) => a + b, 0);

    let fractionExplanation = "";
    if (shape === 'triangle') {
      fractionExplanation = `الباقي من قسمة (الرقم - 12) على 3`;
    } else if (shape === 'square') {
      fractionExplanation = `الباقي من قسمة (الأساس - 30) على 4`;
    } else {
      fractionExplanation = `الباقي من قسمة (الرقم - ${magicConstants[shape]}) على ${n}`;
    }

    const tableRows = [
      {name: "جبر الكسر", explanation: fractionExplanation, value: result.fraction},
      {name: "خانات الضلع", explanation: `عدد الخانات في الضلع الواحد`, value: n},
      {name: "الوفق", explanation: "مجموع القيم في كل سطر أو عمود", value: inputNumber},
      {name: "المفتاح", explanation: "أصغر قيمة في الوفق", value: result.keyVal},
      {name: "المغلاق", explanation: "أكبر قيمة في الوفق", value: result.ghalaqVal},
      {name: "العدل", explanation: "مجموع المفتاح والمغلاق", value: result.al3Adl},
      {name: "الأس", explanation: "قيمة الوفق منقوصًا منها عدد خانات الضلع", value: result.alAs},
      {name: "المساحة", explanation: "مجموع قيم جميع الخانات", value: result.alMasaha},
      {name: "الضابط", explanation: "مجموع الوفق مع المساحة", value: result.alDhabeet},
      {name: "الغاية", explanation: "ضعف قيمة الضابط", value: result.alGhaya},
      {name: "الأصل", explanation: "حاصل ضرب الغاية في المغلاق", value: result.alAsl},
    ];

    const $tbody = $('#infoTableBody').empty();
    tableRows.forEach(row => {
      $tbody.append(`
        <tr>
          <td><strong>${row.name}</strong></td>
          <td>${row.explanation}</td>
          <td><strong>${row.value}</strong></td>
        </tr>
      `);
    });

    $('#infoSection').removeClass('d-none');
  }

  // تحديث حالة الأزرار بناءً على دراسة الرقم
  function updateButtonStates(inputNumber) {
    $('.shape-btn').each(function () {
      const $btn = $(this);
      const shape = $btn.data('shape');

      // إزالة الكلاسات السابقة
      $btn.removeClass('success danger warning active');

      const study = studyNumber(inputNumber, shape);

      if (!study.possible) {
        $btn.addClass('danger');
      } else if (study.needsFractionFix) {
        $btn.addClass('warning');
      } else {
        $btn.addClass('success');
      }
    });
  }

  // حدث زر التنفيذ
  $('#executeBtn').on('click', function () {
    const input = $('#targetNumber').val().trim();
    const inputNumber = parseInt(input);

    if (isNaN(inputNumber)) {
      alert("الرجاء إدخال عدد صحيح.");
      return;
    }

    if (inputNumber < 1) {
      alert("الرجاء إدخال رقم موجب.");
      return;
    }

    // دراسة الرقم وتحديث حالة الأزرار
    updateButtonStates(inputNumber);

    // إظهار منطقة النتيجة
    $('#resultDisplay').removeClass('d-none');
    $('#resultTitle').text(`نتيجة دراسة الرقم: ${inputNumber}`);

    // مسح أي وفق سابق
    $('#magicSquareContainer').empty();
    $('#infoSection').addClass('d-none');
  });

  // حدث الضغط على أزرار الأشكال
  $('.shape-btn').on('click', function () {
    const input = $('#targetNumber').val().trim();
    const inputNumber = parseInt(input);

    if (isNaN(inputNumber) || inputNumber < 1) {
      alert("الرجاء إدخال رقم والضغط على تنفيذ أولاً.");
      return;
    }

    const $btn = $(this);
    const shape = $btn.data('shape');
    const shapeNames = {
      triangle: 'المثلث',
      square: 'المربع',
      pentagon: 'المخمس',
      hexagon: 'المسدس',
      heptagon: 'المسبع',
      octagon: 'المثمن',
      nonagon: 'المتسع'
    };

    // تحديث الزر النشط
    $('.shape-btn').removeClass('active');
    $btn.addClass('active');

    // دراسة الرقم
    const study = studyNumber(inputNumber, shape);

    if (!study.possible) {
      alert(study.message);
      return;
    }

    // توليد وعرض الوفق
    const result = generateWefeq(inputNumber, shape);
    renderWefeq(result, shape, inputNumber);

    $('#resultTitle').text(`تعمير الوفق ${shapeNames[shape]} للرقم: ${inputNumber}`);
  });

  // دعم مفتاح Enter
  $('#targetNumber').on('keypress', function (e) {
    if (e.which === 13) {
      $('#executeBtn').click();
    }
  });
});

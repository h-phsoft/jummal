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
    const base = Math.floor((inputNumber - 12) / 3);
    const remainder = (inputNumber - 12) % 3;

    const square = Array(3).fill().map(() => Array(3).fill(0));
    square[trianglePositions.key.row][trianglePositions.key.col] = base;

    let currentValue = base;
    for (let i = 0; i < triangleFillOrder.length; i++) {
      const [row, col] = triangleFillOrder[i];
      currentValue += 1;
      if (row === trianglePositions.fractionFix.row && col === trianglePositions.fractionFix.col && remainder > 0) {
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
      fraction: remainder
    };
  }
  
  // ============================================
  // الوفق المربع 4x4 - نفس منطق wfq-4x4.js
  // ============================================
  const squareFillOrder = [
    [0, 0], [1, 2], [2, 3], [3, 1],
    [3, 2], [2, 0], [1, 1], [0, 3],
    [2, 1], [3, 3], [0, 2], [1, 0],
    [1, 3], [0, 1], [3, 0], [2, 2]
  ];
  
  function generateSquareWefeq(inputNumber) {
    const base = Math.floor((inputNumber - 30) / 4);
    const remainder = (inputNumber - 30) % 4;

    const square = Array(4).fill().map(() => Array(4).fill(0));

    squareFillOrder.forEach((pos, index) => {
      const [row, col] = pos;
      const cellNumber = index + 1;

      if (cellNumber >= 13) {
        square[row][col] = base + index + remainder;
      } else {
        square[row][col] = base + index;
      }
    });

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
  
  function generateOddWefeq(inputNumber, n) {
    const magicConstant = n * (n * n + 1) / 2;
    const diff = inputNumber - magicConstant;
    const base = Math.floor(diff / n);
    const remainder = diff % n;
    
    const fillOrder = generateSiameseFillOrder(n);
    const square = Array(n).fill().map(() => Array(n).fill(0));
    
    // البدء بالقيم الأساسية (1 إلى n²) مرتبة حسب Siamese
    fillOrder.forEach((pos, index) => {
      const [row, col] = pos;
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
  // الوفق المسدس 6x6 - طريقة خاصة للأرقام الزوجية
  // ============================================
  function generateEvenWefeq(inputNumber, n) {
    const magicConstant = n * (n * n + 1) / 2;
    const diff = inputNumber - magicConstant;
    const base = Math.floor(diff / n);
    const remainder = diff % n;
    
    const square = Array(n).fill().map(() => Array(n).fill(0));
    
    // استخدام طريقة الضرب للزوجي
    // نبدأ بالأرقام من 1 إلى n² ونضيف base
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        square[i][j] = (i * n + j + 1) + base;
      }
    }
    
    // إضافة جبر الكسر في آخر خانة
    if (remainder > 0) {
      square[n - 1][n - 1] += remainder;
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
    nonagon: 369
  };
  
  const minValues = {
    triangle: 12,
    square: 34,
    pentagon: 65,
    hexagon: 111,
    heptagon: 175,
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
              shape === 'heptagon' ? 7 : 9;
    
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
    switch(shape) {
      case 'triangle':
        return generateTriangleWefeq(inputNumber);
      case 'square':
        return generateSquareWefeq(inputNumber);
      case 'pentagon':
        return generateOddWefeq(inputNumber, 5);
      case 'heptagon':
        return generateOddWefeq(inputNumber, 7);
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
        
        // تمييز الخلايا الخاصة
        if (val === result.keyVal) {
          $cell.addClass('key');
        } else if (val === result.ghalaqVal) {
          $cell.addClass('ghalaq');
        } else if (result.fraction > 0 && i === n - 1 && j === n - 1) {
          $cell.addClass('fraction-fix');
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
    $('.shape-btn').each(function() {
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
  $('#executeBtn').on('click', function() {
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
  $('.shape-btn').on('click', function() {
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
  $('#targetNumber').on('keypress', function(e) {
    if (e.which === 13) {
      $('#executeBtn').click();
    }
  });
});

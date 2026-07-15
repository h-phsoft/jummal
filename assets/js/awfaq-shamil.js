$(document).ready(function () {
  
  // تسكينات الأوفاق المختلفة
  const fillOrders = {
    // الوفق المثلث 3×2 (6 خانات)
    triangle: [
      [0, 2], [1, 0], [0, 0], [1, 1], [1, 2], [0, 1]
    ],
    // الوفق المربع 4×4 (16 خانة)
    square: [
      [0, 0], [1, 2], [2, 3], [3, 1],
      [3, 2], [2, 0], [1, 1], [0, 3],
      [2, 1], [3, 3], [0, 2], [1, 0],
      [1, 3], [0, 1], [3, 0], [2, 2]
    ],
    // الوفق المخمس 5×5 (25 خانة) - نمط متتابع
    pentagon: [],
    // الوفق المسدس 6×6 (36 خانة)
    hexagon: [],
    // الوفق المسبع 7×7 (49 خانة)
    heptagon: [],
    // الوفق المتسع 9×9 (81 خانة)
    nonagon: []
  };
  
  // توليد تسكينات للأوفاق الكبيرة باستخدام خوارزمية Siamese method للأرقام الفردية
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
  
  // ملء التسكينات للأوفاق الفردية
  fillOrders.pentagon = generateSiameseFillOrder(5);
  fillOrders.heptagon = generateSiameseFillOrder(7);
  fillOrders.nonagon = generateSiameseFillOrder(9);
  
  // توليد تسكين للوفق المسدس (زوجي) باستخدام طريقة مختلفة
  function generateEvenFillOrder(n) {
    const order = [];
    const grid = Array(n).fill().map(() => Array(n).fill(0));
    let counter = 1;
    
    // ملء القطرين أولاً
    for (let i = 0; i < n; i++) {
      grid[i][i] = counter++;
      grid[i][n - 1 - i] = counter++;
    }
    
    // ملء الباقي من الأسفل للأعلى
    for (let i = n - 1; i >= 0; i--) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === 0) {
          grid[i][j] = counter++;
        }
      }
    }
    
    // تحويل الشبكة إلى قائمة مرتبة
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        order.push([i, j]);
      }
    }
    
    return order;
  }
  
  fillOrders.hexagon = generateEvenFillOrder(6);
  
  // حدود دنيا للأوفاق
  const minValues = {
    triangle: 12,   // مجموع أقل قيمة للمثلث
    square: 34,     // مجموع أقل قيمة للمربع (Magic Constant لـ 4x4)
    pentagon: 65,   // Magic Constant لـ 5x5
    hexagon: 111,   // Magic Constant لـ 6x6
    heptagon: 175,  // Magic Constant لـ 7x7
    nonagon: 369    // Magic Constant لـ 9x9
  };
  
  // ثوابت سحرية أساسية
  const magicConstants = {
    triangle: 15,   // 3x3 magic constant
    square: 34,     // 4x4 magic constant
    pentagon: 65,   // 5x5 magic constant
    hexagon: 111,   // 6x6 magic constant
    heptagon: 175,  // 7x7 magic constant
    nonagon: 369    // 9x9 magic constant
  };
  
  // دالة دراسة الرقم وتحديد إمكانية التعمير
  function studyNumber(inputNumber, shape) {
    const order = fillOrders[shape];
    const n = shape === 'triangle' ? 3 : parseInt($('.shape-btn[data-shape="' + shape + '"]').data('order'));
    const cellsCount = n * n;
    const baseConstant = magicConstants[shape];
    
    // حساب الفرق بين الرقم المدخل والثابت السحري
    const diff = inputNumber - baseConstant;
    
    // تحديد الحالة
    if (diff < 0) {
      return {
        possible: false,
        needsFractionFix: false,
        message: "الرقم أصغر من الحد الأدنى للتعمير"
      };
    }
    
    // التحقق من قابلية القسمة (لتجنب الكسور)
    const remainder = diff % n;
    
    if (remainder === 0) {
      return {
        possible: true,
        needsFractionFix: false,
        remainder: 0,
        baseValue: Math.floor(diff / n)
      };
    } else {
      return {
        possible: true,
        needsFractionFix: true,
        remainder: remainder,
        baseValue: Math.floor(diff / n)
      };
    }
  }
  
  // دالة توليد الوفق
  function generateWefeq(inputNumber, shape) {
    const n = shape === 'triangle' ? 3 : parseInt($('.shape-btn[data-shape="' + shape + '"]').data('order'));
    const order = fillOrders[shape];
    const baseConstant = magicConstants[shape];
    const diff = inputNumber - baseConstant;
    const baseValue = Math.floor(diff / n);
    const remainder = diff % n;
    
    const square = Array(n).fill().map(() => Array(n).fill(0));
    
    // البدء بالقيم الأساسية (1 إلى n²)
    const baseSquare = Array(n).fill().map((_, i) => 
      Array(n).fill().map((_, j) => i * n + j + 1)
    );
    
    // تطبيق التسكين مع الإضافة
    order.forEach((pos, index) => {
      const [row, col] = pos;
      let value = baseSquare[row][col] + baseValue * n;
      
      // إضافة جبر الكسر في خانة محددة (آخر خانة في التسكين)
      if (remainder > 0 && index === order.length - 1) {
        value += remainder;
      }
      
      square[row][col] = value;
    });
    
    return {
      square: square,
      remainder: remainder,
      minValue: Math.min(...square.flat()),
      maxValue: Math.max(...square.flat())
    };
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
        if (val === result.minValue) {
          $cell.addClass('key');
        } else if (val === result.maxValue) {
          $cell.addClass('ghalaq');
        } else if (result.remainder > 0 && i === n - 1 && j === n - 1) {
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
    
    const tableRows = [
      {name: "جبر الكسر", explanation: `الباقي من قسمة (الرقم - ${magicConstants[shape]}) على ${n}`, value: result.remainder},
      {name: "خانات الضلع", explanation: `عدد الخانات في الضلع الواحد`, value: n},
      {name: "الوفق", explanation: "مجموع القيم في كل سطر أو عمود", value: inputNumber},
      {name: "المفتاح", explanation: "أصغر قيمة في الوفق", value: result.minValue},
      {name: "المغلاق", explanation: "أكبر قيمة في الوفق", value: result.maxValue},
      {name: "العدل", explanation: "مجموع المفتاح والمغلاق", value: result.minValue + result.maxValue},
      {name: "المساحة", explanation: "مجموع قيم جميع الخانات", value: sum},
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

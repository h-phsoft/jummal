$(document).ready(function () {

  const positions = {
    key: {row: 2, col: 1, name: "المفتاح"},
    ghalaq: {row: 1, col: 2, name: "المغلاق"}, // ← الرقم 7 في الوفق الأساسي
    middle: {row: 1, col: 1, name: "الوسط"},
    fractionFix: {row: 1, col: 2, name: "جبر الكسر"}
  };

  const fillOrder = [
    [0, 2], // → 2
    [1, 0], // → 3
    [0, 0], // → 4
    [1, 1], // → 5
    [2, 2], // → 6
    [1, 2], // → 7 ← جبر الكسر
    [2, 0], // → 8
    [0, 1]  // → 9
  ];

  function generateMagicSquare(inputNumber) {
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

    // ✅ حساب القيم المطلوبة
    const allValues = square.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    // نعتبر الصف العلوي (الضلع) هو الصف 0
    const wufuq = square[0].reduce((a, b) => a + b, 0); // مجموع الصف العلوي
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

  function updateFractionIndicator(fraction) {
    const $indicator = $('#fractionIndicator');
    if (fraction === 0) {
      $indicator.css('background-color', 'green');
    } else {
      $indicator.css('background-color', 'red');
    }
    $indicator.show();
  }

  function renderMagicSquare(square, keyVal, ghalaqVal, wufuq, khanaatAlDhal3, al3Adl, alAs, alMasaha, alDhabeet, alGhaya, alAsl, fraction) {
    const $container = $('#magicSquare').empty();
    const allValues = square.flat();

    // تحديث مؤشر الكسر (أخضر إذا لا يوجد كسر، أحمر إذا وجد كسر)
    const $indicator = $('#fractionIndicator');
    if (fraction === 0) {
      $indicator.css('background-color', 'green');
    } else {
      $indicator.css('background-color', 'red');
    }
    
    // إظهار المؤشر دائمًا بعد الحساب
    $indicator.show();

    // تمييز المفتاح والمغلاق حسب القيمة
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const $cell = $('<div class="magic-cell">').text(square[i][j]);

        if (square[i][j] === minVal) {
          $cell.addClass('key');
        } else if (square[i][j] === maxVal) {
          $cell.addClass('ghalaq');
        } else if (i === 1 && j === 1) {
          $cell.addClass('middle');
        } else if (i === 1 && j === 2 && fraction > 0) {
          $cell.addClass('fraction-fix');
        }

        $container.append($cell);
      }
    }

    // ✅ الجدول مع جبر الكسر في النهاية
    const tableRows = [
      {name: "جبر الكسر", explanation: "الباقي من قسمة (الرقم - 12) على 3", value: fraction},
      {name: "خانات الضلع", explanation: "عدد الخانات في كل ضلع", value: khanaatAlDhal3},
      {name: "الوفق", explanation: "مجموع القيم في خانات الضلع", value: wufuq},
      {name: "المفتاح", explanation: "أصغر قيمة", value: keyVal},
      {name: "المغلاق", explanation: "أكبر قيمة", value: ghalaqVal},
      {name: "العدل", explanation: "المفتاح والمغلاق", value: al3Adl},
      {name: "الأس", explanation: "قيمة الوفق منقوصًا منها عدد خانات الضلع", value: alAs},
      {name: "المساحة", explanation: "مجموعة قيم الخانات كلها", value: alMasaha},
      {name: "الضابط", explanation: "مجموعة الوفق مع المساحة", value: alDhabeet},
      {name: "الغاية", explanation: "ضعف قيمة الضابط", value: alGhaya},
      {name: "الأصل", explanation: "حاصل ضرب الغاية في المغلاق", value: alAsl},
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

    $('#result').removeClass('d-none');
    
    // ✅ إظهار زر الدليل
    $('#toggleGuideBtn').show();
  }

  $('#generateBtn').on('click', function () {
    const input = $('#targetSum').val().trim();
    const inputNumber = parseInt(input);

    if (isNaN(inputNumber)) {
      alert("الرجاء إدخال عدد صحيح.");
      return;
    }

    if (inputNumber < 12) {
      alert("الرقم يجب أن يكون 12 أو أكبر.");
      return;
    }

    const result = generateMagicSquare(inputNumber);
    
    // إظهار الجدول الكامل مع زر الدليل
    renderMagicSquare(result.square, result.keyVal, result.ghalaqVal, result.wufuq, result.khanaatAlDhal3, result.al3Adl, result.alAs, result.alMasaha, result.alDhabeet, result.alGhaya, result.alAsl, result.fraction);
  });

  // ✅ حدث زر إظهار/إخفاء الدليل
  $('#toggleGuideBtn').on('click', function () {
    const $table = $('#guideTable');
    if ($table.hasClass('d-none')) {
      $table.removeClass('d-none');
      $(this).text('إخفاء الدليل');
    } else {
      $table.addClass('d-none');
      $(this).text('إظهار الدليل');
    }
  }).show(); // إظهار الزر عند التحميل

  $('#targetSum').on('keypress', function (e) {
    if (e.which === 13) {
      $('#generateBtn').click();
    }
  });

});

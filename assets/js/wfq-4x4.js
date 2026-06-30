$(document).ready(function () {

  // تسكين الوفق المربع وتحديد خانات الميزات هندسياً
  const fillOrder4x4 = [
    [0, 0], [1, 2], [2, 3], [3, 1],
    [3, 2], [2, 0], [1, 1], [0, 3],
    [2, 1], [3, 3], [0, 2], [1, 0],
    [1, 3], [0, 1], [3, 0], [2, 2]
  ];

  // دالة الحسابات والتعمير الفني للوفق المربع
  const generateMagicSquare4x4 = (inputNumber) => {
    const base = Math.floor((inputNumber - 30) / 4);
    const remainder = (inputNumber - 30) % 4;

    const square = Array(4).fill().map(() => Array(4).fill(0));

    fillOrder4x4.forEach((pos, index) => {
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
  };

  // دالة عرض وتلوين المربع وجدول الدليل
  const renderMagicSquare4x4 = (result) => {
    const $container = $('#magicSquare').empty();
    const $alertBox = $('#alertBox').empty();

    // تحديث مؤشر الكسر الدائري علوياً
    const $indicator = $('#fractionIndicator');
    if (result.fraction === 0) {
      $indicator.css('background-color', 'green');
      $alertBox.removeClass('result-error').addClass('result-success').text("تم تعمير الوفق بنجاح بدون أي كسور.");
    } else {
      $indicator.css('background-color', 'red');
      $alertBox.removeClass('result-success').addClass('result-error').text(`تنبيه: يوجد كسر (الباقي: ${result.fraction}). تم جبره في خانة الكسر.`);
    }
    $indicator.show();
    $('#magicResult').removeClass('d-none');

    // رسم خلايا الوفق الـ 16 وإسقاط كلاسات التلوين المعتمدة في ملف الـ CSS الخاص بك
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const val = result.square[i][j];
        const $cell = $('<div class="magic-cell">').text(val);

        if (val === result.keyVal) {
          $cell.addClass('key');
        } else if (val === result.ghalaqVal) {
          $cell.addClass('ghalaq');
        } else if (i === 3 && j === 3) {
          $cell.addClass('middle');
        } else if (i === 1 && j === 3 && result.fraction > 0) {
          $cell.addClass('fraction-fix');
        }

        $container.append($cell);
      }
    }

    // تعبئة جدول الدليل الإحصائي
    const tableRows = [
      {name: "جبر الكسر", explanation: "الباقي من قسمة (الأساس - 30) على 4", value: result.fraction},
      {name: "خانات الضلع", explanation: "عدد الخانات في الضلع الواحد للوفق المربع", value: result.khanaatAlDhal3},
      {name: "الوفق", explanation: "مجموع القيم في كل سطر أو عمود أو قطر", value: result.wufuq},
      {name: "المفتاح", explanation: "أصغر قيمة بدأ بها الوفق (الخانة الأولى)", value: result.keyVal},
      {name: "المغلاق", explanation: "أكبر قيمة انتهى بها الوفق (الخانة الأخيرة)", value: result.ghalaqVal},
      {name: "العدل", explanation: "مجموع قيمة المفتاح والمغلاق معاً", value: result.al3Adl},
      {name: "الأس", explanation: "قيمة الوفق منقوصاً منها عدد خانات الضلع (4)", value: result.alAs},
      {name: "المساحة", explanation: "مجموع قيم جميع خانات الوفق المربع الـ 16", value: result.alMasaha},
      {name: "الضابط", explanation: "مجموع قيمة الوفق مضافاً إليها المساحة الكلية", value: result.alDhabeet},
      {name: "الغاية", explanation: "ضعف قيمة الضابط (الضابط × 2)", value: result.alGhaya},
      {name: "الأصل", explanation: "حاصل ضرب قيمة الغاية في قيمة المغلاق", value: result.alAsl},
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

    $('#toggleGuideBtn').show();
  };

  const executionLogic = () => {
    const input = $('#targetSum').val().trim();
    const inputNumber = parseInt(input);

    if (isNaN(inputNumber)) {
      alert("الرجاء إدخال عدد صحيح.");
      return;
    }

    if (inputNumber < 34) {
      alert("الرقم يجب أن يكون 34 أو أكبر للوفق المربع الطبيعي.");
      return;
    }

    const result = generateMagicSquare4x4(inputNumber);
    renderMagicSquare4x4(result);
  };

  // تفعيل الأحداث عبر jQuery بشكل آمن ونظيف
  $('#generateBtn').on('click', executionLogic);

  $('#toggleGuideBtn').on('click', function () {
    const $table = $('#guideTable');
    if ($table.hasClass('d-none')) {
      $table.removeClass('d-none');
      $(this).text('إخفاء الدليل');
    } else {
      $table.addClass('d-none');
      $(this).text('إظهار الدليل');
    }
  });

  $('#targetSum').on('keypress', function (e) {
    if (e.which === 13) {
      executionLogic();
    }
  });

  // التشغيل التلقائي الأول عند التحميل بنجاح
  executionLogic();
});

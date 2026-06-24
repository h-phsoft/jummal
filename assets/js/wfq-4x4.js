$(document).ready(function () {

  // المربع السحري الثابت 4x4 كما طُلب
  const fixedMagicSquare4x4 = [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 7, 6, 12],
    [4, 15, 14, 1]
  ];

  /**
   * حسابات المربع السحري 4x4 (WFQ-4x4)
   * @param {number[][]} grid - مصفوفة 4x4 تحتوي على القيم
   * @returns {Object} - كائن يحتوي على جميع النتائج الحسابية
   */
  function calculateWFQ4x4(grid) {
    // التحقق من أن المصفوفة 4x4
    if (!grid || grid.length !== 4 || grid.some(row => row.length !== 4)) {
      throw new Error("يجب أن تكون المصفوفة 4x4");
    }

    // تسطيح المصفوفة للحصول على جميع القيم
    const allValues = grid.flat();
    
    // خانات الضلع = عدد الخانات في كل ضلع
    const khanatAlDila = 4;

    // الوفق = مجموع القيم في خانات الضلع (مجموع الصف الأول)
    const wafq = grid[0].reduce((a, b) => a + b, 0);

    // المفتاح = أصغر قيمة
    const miftah = Math.min(...allValues);

    // المغلاق = أكبر قيمة
    const mighlaq = Math.max(...allValues);

    // العدل = المفتاح والمغلاق
    const adl = [miftah, mighlaq];

    // الأس = قيمة الوفق منقوصًا منها عدد خانات الضلع
    const uss = wafq - khanatAlDila;

    // المساحة = مجموعة قيم الخانات كلها
    const masaha = allValues.reduce((sum, val) => sum + val, 0);

    // الضابط = مجموعة الوفق مع المساحة
    const dabt = wafq + masaha;

    // الغاية = ضعف قيمة الضابط
    const ghaya = 2 * dabt;

    // الأصل = حاصل ضرب الغاية في المغلاق
    const asl = ghaya * mighlaq;

    // جبر الكسر = التحقق مما إذا كانت هناك كسور
    const hasFractions = allValues.some(val => !Number.isInteger(val));
    const jabrAlKasr = hasFractions ? "يحتاج إلى جبر" : "لا يحتاج";

    return {
      grid: grid,
      khanatAlDila,       // خانات الضلع
      wafq,               // الوفق
      miftah,             // المفتاح
      mighlaq,            // المغلاق
      adl,                // العدل
      uss,                // الأس
      masaha,             // المساحة
      dabt,               // الضابط
      ghaya,              // الغاية
      asl,                // الأصل
      jabrAlKasr          // جبر الكسر
    };
  }

  function renderMagicSquare4x4(square, results) {
    const $container = $('#magicSquare').empty();
    
    // تعيين حجم الشبكة لـ 4x4
    $container.addClass('grid-4x4');

    // إنشاء خلايا المربع 4x4
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const $cell = $('<div class="magic-cell">').text(square[i][j]);
        
        // تمييز المفتاح (أصغر قيمة) والمغلاق (أكبر قيمة)
        if (square[i][j] === results.miftah) {
          $cell.addClass('key');
        } else if (square[i][j] === results.mighlaq) {
          $cell.addClass('ghalaq');
        }
        
        $container.append($cell);
      }
    }

    // ✅ الجدول مع جميع القيم المطلوبة
    const tableRows = [
      {name: "خانات الضلع", explanation: "عدد الخانات في كل ضلع", value: results.khanatAlDila},
      {name: "الوفق", explanation: "مجموع القيم في خانات الضلع", value: results.wafq},
      {name: "المفتاح", explanation: "أصغر قيمة", value: results.miftah},
      {name: "المغلاق", explanation: "أكبر قيمة", value: results.mighlaq},
      {name: "العدل", explanation: "المفتاح والمغلاق", value: `[${results.adl[0]}, ${results.adl[1]}]`},
      {name: "الأس", explanation: "قيمة الوفق منقوصًا منها عدد خانات الضلع", value: results.uss},
      {name: "المساحة", explanation: "مجموعة قيم الخانات كلها", value: results.masaha},
      {name: "الضابط", explanation: "مجموعة الوفق مع المساحة", value: results.dabt},
      {name: "الغاية", explanation: "ضعف قيمة الضابط", value: results.ghaya},
      {name: "الأصل", explanation: "حاصل ضرب الغاية في المغلاق", value: results.asl},
      {name: "جبر الكسر", explanation: "التحقق من وجود كسور", value: results.jabrAlKasr}
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

    $('#magicResult').removeClass('d-none');
  }

  // عرض المربع السحري الثابت عند التحميل
  const results = calculateWFQ4x4(fixedMagicSquare4x4);
  renderMagicSquare4x4(fixedMagicSquare4x4, results);

  // إظهار زر الدليل
  $('#toggleGuideBtn').show();

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
  });

});

// =====================================================
// الوفق المثلث في المنصة الموحدة - واجهة فقط
// الحساب نفسه في core/wefq.js (نفس دالة صفحة عالم الأوفاق)
// =====================================================
$(document).ready(function () {

  // تحديث مؤشر الكسر (أخضر إذا لا يوجد كسر، أحمر إذا وجد كسر)
  function updateFractionIndicator(fraction) {
    $('#fractionIndicator')
      .css('background-color', fraction === 0 ? 'green' : 'red')
      .show();
  }

  function renderMagicSquare(result) {
    updateFractionIndicator(result.fraction);
    renderWefeqCells($('#magicSquare').empty(), result, 'triangle');
    renderWefeqInfoTable($('#infoTableBody'), result, 'triangle');
    $('#magicResult').removeClass('d-none');
    $('#toggleGuideBtn').show();
  }

  // قائمة خيارات الأرقام في خلايا الوفق وجدول الدليل
  if (typeof initNumberActions === 'function') {
    initNumberActions('#magicSquare');
    initNumberActions('#infoTableBody');
  }

  $('#generateBtn').on('click', function () {
    const inputNumber = parseInt($('#targetSum').val().trim());

    if (isNaN(inputNumber)) {
      alert("الرجاء إدخال عدد صحيح.");
      return;
    }
    if (inputNumber < 12) {
      alert("الرقم يجب أن يكون 12 أو أكبر.");
      return;
    }

    renderMagicSquare(generateTriangleWefeq(inputNumber));
  });

  // حدث زر إظهار/إخفاء الدليل
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
      $('#generateBtn').click();
    }
  });
});

// =====================================================
// صفحة عالم الأوفاق - واجهة فقط
// كل حسابات الأوفاق في core/wefq.js
// =====================================================
$(document).ready(function () {

  const SHAPE_NAMES = {
    triangle: 'المثلث',
    square: 'المربع',
    pentagon: 'المخمس',
    hexagon: 'المسدس',
    heptagon: 'المسبع',
    octagon: 'المثمن',
    nonagon: 'المتسع'
  };

  // عرض الوفق وجدول الدليل
  function renderWefeq(result, shape) {
    const n = result.square.length;
    const $grid = $('<div class="magic-square">').addClass(`grid-${n}x${n}`);
    renderWefeqCells($grid, result, shape);
    $('#magicSquareContainer').empty().append($grid);

    renderWefeqInfoTable($('#infoTableBody'), result, shape);
    $('#infoSection').removeClass('d-none');
  }

  // تلوين أزرار الأشكال حسب إمكانية التعمير
  function updateButtonStates(inputNumber) {
    $('.shape-btn').each(function () {
      const $btn = $(this);
      const study = studyWefeqNumber(inputNumber, $btn.data('shape'));
      $btn.removeClass('success danger warning active');
      if (!study.possible) {
        $btn.addClass('danger');
      } else if (study.needsFractionFix) {
        $btn.addClass('warning');
      } else {
        $btn.addClass('success');
      }
    });
  }

  // قائمة خيارات الأرقام في خانات الوفق وجدول الدليل
  if (typeof initNumberActions === 'function') {
    initNumberActions('#magicSquareContainer');
    initNumberActions('#infoTableBody');
  }

  // حدث زر التنفيذ
  $('#executeBtn').on('click', function () {
    const inputNumber = parseInt($('#targetNumber').val().trim());

    if (isNaN(inputNumber)) {
      alert("الرجاء إدخال عدد صحيح.");
      return;
    }
    if (inputNumber < 1) {
      alert("الرجاء إدخال رقم موجب.");
      return;
    }

    updateButtonStates(inputNumber);
    $('#resultDisplay').removeClass('d-none');
    $('#resultTitle').text(`نتيجة دراسة الرقم: ${inputNumber}`);
    $('#magicSquareContainer').empty();
    $('#infoSection').addClass('d-none');
  });

  // حدث الضغط على أزرار الأشكال
  $('.shape-btn').on('click', function () {
    const inputNumber = parseInt($('#targetNumber').val().trim());

    if (isNaN(inputNumber) || inputNumber < 1) {
      alert("الرجاء إدخال رقم والضغط على تنفيذ أولاً.");
      return;
    }

    const $btn = $(this);
    const shape = $btn.data('shape');
    $('.shape-btn').removeClass('active');
    $btn.addClass('active');

    const study = studyWefeqNumber(inputNumber, shape);
    if (!study.possible) {
      alert(study.message);
      return;
    }

    renderWefeq(generateWefeq(inputNumber, shape), shape);
    $('#resultTitle').text(`تعمير الوفق ${SHAPE_NAMES[shape]} للرقم: ${inputNumber}`);
  });

  // دعم مفتاح Enter
  $('#targetNumber').on('keypress', function (e) {
    if (e.which === 13) {
      $('#executeBtn').click();
    }
  });
});

/* global XLSX */

// الحروف وقيمها والحساب الثلاثي في core/letters.js
// النسخ والتخزين في core/common.js

// === إدارة السجل ===
const STORAGE_KEY = 'gematria_history_triple_v2';
let history = loadStoredList(STORAGE_KEY);

function saveHistory() {
  saveStoredList(STORAGE_KEY, history);
}

function addToHistory(cleanText, values) {
  const exists = history.some(item =>
    item.text === cleanText &&
      item.jummal === values.jummal &&
      item.abjadi === values.abjadi &&
      item.iqghy === values.iqghy
  );
  if (!exists) {
    history.unshift({text: cleanText, ...values});
    if (history.length > 50)
      history = history.slice(0, 50);
    saveHistory();
    updateHistoryDisplay();
  }
}

function removeItem(index) {
  history.splice(index, 1);
  saveHistory();
  updateHistoryDisplay();
}

function clearAllHistory() {
  if (confirm('هل أنت متأكد من مسح السجل بالكامل؟')) {
    history = [];
    saveHistory();
    updateHistoryDisplay();
  }
}

function updateHistoryDisplay() {
  const container = $('#historyList');
  container.empty();
  if (history.length === 0) {
    const row = $('<tr><td colspan="6" class="text-center text-muted py-3">لا توجد سجلات بعد</td></tr>');
    container.append(row);
    return;
  }

  history.forEach((item, index) => {
    const row = $(`
            <tr class="history-row">
              <td title="${item.text}">${item.text}</td>
              <td class="number-cell" data-number="${item.jummal}">${numberCellContent(item.jummal)}</td>
              <td class="number-cell" data-number="${item.abjadi}">${numberCellContent(item.abjadi)}</td>
              <td class="number-cell" data-number="${item.iqghy}">${numberCellContent(item.iqghy)}</td>
              <td class="number-cell" data-number="${item.triple}">${numberCellContent(item.triple)}</td>
              <td>
                <button class="btn-delete-item" data-index="${index}">×</button>
              </td>
            </tr>
          `);

    // نقرة على السطر: استرجاع النص
    row.on('click', function (e) {
      const isActionBtn = $(e.target).closest('.number-actions-btn').length > 0;
      if (!$(e.target).hasClass('btn-delete-item') && !isActionBtn) {
        $('#inputText').val(item.text).focus();
      }
    });

    // نقرة مزدوجة على أي خلية رقمية: نسخ القيمة
    row.on('dblclick', 'td:not(:first-child):not(:last-child)', function () {
      const value = $(this).text().replace(/[,،]/g, '');
      if (!isNaN(value)) {
        copyToClipboard(value);
      }
    });

    // زر الحذف
    row.find('.btn-delete-item').on('click', function (e) {
      e.stopPropagation();
      removeItem(index);
    });

    container.append(row);
  });
}

// === حدث الحساب ===
$('#calculateBtn').on('click', function () {
  const rawInput = $('#inputText').val();
  if (!rawInput || rawInput.trim() === '') {
    $('#jummalResult')
      .removeClass('result-success')
      .addClass('result-error')
      .text('الرجاء إدخال نص');
    return;
  }

  const cleanText = cleanArabicText(rawInput);
  if (cleanText === '') {
    $('#jummalResult')
      .removeClass('result-success')
      .addClass('result-error')
      .text('لا يوجد حروف عربية صالحة للحساب');
    return;
  }

  const values = calculateTriple(cleanText);
  // عرض نتيجة الجمل كمرجع (مع قائمة خيارات الرقم)
  const resultHtml = 'الجمل: ' +
    `<span class="number-cell" data-number="${values.jummal}">${numberCellContent(values.jummal)}</span>`;

  $('#jummalResult')
    .removeClass('result-error')
    .addClass('result-success')
    .html(resultHtml);

  // نسخ قيمة الجمل تلقائيًا
  copyToClipboard(values.jummal);

  // وضع النتيجة في حقل targetSum وتحديث مؤشر الكسر فقط
  $('#targetSum').val(values.jummal);

  // حساب الكسر وعرض المؤشر فقط دون إظهار الجدول أو زر الدليل
  const inputNumber = values.jummal;
  if (inputNumber >= 12 && typeof triangleFraction === 'function') {
    const remainder = triangleFraction(inputNumber);
    const $indicator = $('#fractionIndicator');
    if (remainder === 0) {
      $indicator.css('background-color', 'green');
    } else {
      $indicator.css('background-color', 'red');
    }
    $indicator.show();

    // إخفاء الجدول وزر الدليل عند الحساب من زر "احسب"
    $('#magicResult').addClass('d-none');
    $('#guideTable').addClass('d-none');
    $('#toggleGuideBtn').hide();
  } else {
    // إذا كان الرقم أقل من 12، نخفي المؤشر أيضًا
    $('#fractionIndicator').hide();
    $('#magicResult').addClass('d-none');
    $('#guideTable').addClass('d-none');
    $('#toggleGuideBtn').hide();
  }

  addToHistory(cleanText, values);

  // عرض إحصاءات الأحرف
  if (typeof renderTextStats === 'function') {
    renderTextStats(cleanText, '#textStats');
  }

  // البحث في QWords.json عن كلمات مطابقة لقيمة الجمل
  // تنفيذ البحث تلقائياً باستخدام الدالة searchByJummalValue من combined-search.js
  // مع "الجمل" كحالة افتراضية دائماً
  const checkJummal = document.getElementById('checkJummal');
  const checkAbjad = document.getElementById('checkAbjad');
  const checkAyqagh = document.getElementById('checkAyqagh');
  // التأكد أن "الجمل" مختار كحالة افتراضية
  if (checkJummal && !checkJummal.checked) {
    checkJummal.checked = true;
    if (checkAbjad) checkAbjad.checked = false;
    if (checkAyqagh) checkAyqagh.checked = false;
  }
  if ((checkJummal && checkJummal.checked) ||
    (checkAbjad && checkAbjad.checked) ||
    (checkAyqagh && checkAyqagh.checked)) {
    if (typeof searchByJummalValue === 'function') {
      searchByJummalValue(values.jummal);
    }
  }

  $('#inputText').val('').focus();
});

$('#inputText').on('keypress', function (e) {
  if (e.which === 13) {
    $('#calculateBtn').click();
  }
});

$('#clearAllBtn').on('click', clearAllHistory);

// قائمة خيارات الأرقام في السجل ونتيجة الحساب
if (typeof initNumberActions === 'function') {
  initNumberActions('#historyList');
  initNumberActions('#jummalResult');
}

// تحميل السجل عند البدء
updateHistoryDisplay();

$('#exportHistoryExcelBtn').on('click', function () {
  if (history.length === 0) {
    alert('لا توجد سجلات لتصديرها');
    return;
  }

  // تحضير البيانات
  const data = history.map(item => ({
      'النص': item.text,
      'الجمل': item.jummal,
      'الأبجد': item.abjadi,
      'الأيقغ': item.iqghy,
      'الحساب الثلاثي': item.triple
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'السجل');
  XLSX.writeFile(wb, 'jummal-history.xlsx');
});

$('#exportSearchExcelBtn').on('click', function () {
  const tbody = document.getElementById('searchResultsBody');
  const rows = tbody.querySelectorAll('tr');

  if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'))) {
    alert('لا توجد نتائج بحث لتصديرها');
    return;
  }

  // استخراج البيانات من الجدول
  const data = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      data.push({
        'الكلمة': cells[0].textContent.trim(),
        'الجمل': cells[1].textContent.trim(),
        'الأبجد': cells[2].textContent.trim(),
        'الأيقغ': cells[3].textContent.trim()
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'نتائج البحث');
  XLSX.writeFile(wb, 'search-results.xlsx');
});




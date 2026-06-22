/* global XLSX */

// === تعريف الحروف المدعومة ===
const SUPPORTED_CHARS = [
  'ا', 'أ', 'إ', 'آ',
  'ب',
  'ج',
  'د',
  'ه', 'ة',
  'و',
  'ز',
  'ح',
  'ط',
  'ي', 'ى', 'ئ',
  'ك',
  'ل',
  'م',
  'ن',
  'س',
  'ع',
  'ف',
  'ص',
  'ق',
  'ر',
  'ش',
  'ت',
  'ث',
  'خ',
  'ذ',
  'ض',
  'ظ',
  'غ'
];
// 1. حساب الجمل (كلاسيكي)
const jummalValues = {
  'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5, 'ة': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10, 'ى': 10, 'ئ': 10,
  'ك': 20,
  'ل': 30,
  'م': 40,
  'ن': 50,
  'س': 60,
  'ع': 70,
  'ف': 80,
  'ص': 90,
  'ق': 100,
  'ر': 200,
  'ش': 300,
  'ت': 400,
  'ث': 500,
  'خ': 600,
  'ذ': 700,
  'ض': 800,
  'ظ': 900,
  'غ': 1000
};

// دالة للحصول على الترتيب الفريد (1-28)
function getUniqueIndex(char) {
  const baseOrder = ['ا', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح', 'ط', 'ي', 'ك', 'ل', 'م', 'ن', 'س', 'ع', 'ف', 'ص', 'ق', 'ر', 'ش', 'ت', 'ث', 'خ', 'ذ', 'ض', 'ظ', 'غ'];
  const map = {
    'ا': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا',
    'ه': 'ه', 'ة': 'ه',
    'ي': 'ي', 'ى': 'ي', 'ئ': 'ي'
  };
  const base = map[char] || char;
  const idx = baseOrder.indexOf(base);
  return idx === -1 ? 0 : idx + 1;
}

// تنقية النص
function cleanArabicText(input) {
  let cleaned = '';
  let inWord = false;
  for (let char of input) {
    if (SUPPORTED_CHARS.includes(char)) {
      cleaned += char;
      inWord = true;
    } else if (char === ' ' && inWord) {
      cleaned += ' ';
      inWord = false;
    }
  }
  return cleaned.trim();
}

// حساب القيم الثلاثة + المجموع
function calculateAll(text) {
  let jummal = 0, abjadi = 0, iqghy = 0;

  for (let char of text) {
    // الجمل
    if (jummalValues[char])
      jummal += jummalValues[char];
    // الأبجدي
    const idx = getUniqueIndex(char);
    if (idx)
      abjadi += idx;

    // الإيقيغي
    if (idx)
      iqghy += ((idx - 1) % 9) + 1;
  }

  const triple = jummal + abjadi + iqghy;
  return {jummal, abjadi, iqghy, triple};
}

// === إدارة السجل ===
const STORAGE_KEY = 'gematria_history_triple_v2';
let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
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
              <td>${item.jummal.toLocaleString()}</td>
              <td>${item.abjadi.toLocaleString()}</td>
              <td>${item.iqghy.toLocaleString()}</td>
              <td>${item.triple.toLocaleString()}</td>
              <td>
                <button class="btn-delete-item" data-index="${index}">×</button>
              </td>
            </tr>
          `);

    // نقرة على السطر: استرجاع النص
    row.on('click', function (e) {
      if (!$(e.target).hasClass('btn-delete-item')) {
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

// === وظائف مساعدة ===
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(String(text)).catch(() => {
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
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

  const values = calculateAll(cleanText);
  // عرض نتيجة الجمل كمرجع
  const resultText = `الجمل: ${values.jummal.toLocaleString()}`;

  $('#jummalResult')
    .removeClass('result-error')
    .addClass('result-success')
    .text(resultText);

  // نسخ قيمة الجمل تلقائيًا
  copyToClipboard(values.jummal);

  // وضع النتيجة في حقل targetSum وتحديث مؤشر الكسر فقط
  $('#targetSum').val(values.jummal);

  // حساب الكسر وعرض المؤشر فقط دون إظهار الجدول أو زر الدليل
  const inputNumber = values.jummal;
  if (inputNumber >= 12) {
    const remainder = (inputNumber - 12) % 3;
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




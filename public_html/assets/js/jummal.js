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
        showCopiedFlash($(this));
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

function showCopiedFlash(element) {
  const flash = $('<div class="copied-flash">تم النسخ!</div>');
  $('body').append(flash);
  const pos = element.offset();
  flash.css({
    top: pos.top - 30,
    left: pos.left + element.outerWidth() / 2 - flash.width() / 2,
    opacity: 1
  });
  setTimeout(() => flash.fadeOut(300, () => flash.remove()), 1200);
}

// === حدث الحساب ===
$('#calculateBtn').on('click', function () {
  const rawInput = $('#inputText').val();
  if (!rawInput || rawInput.trim() === '') {
    $('#result')
      .removeClass('result-success')
      .addClass('result-error')
      .text('الرجاء إدخال نص');
    return;
  }

  const cleanText = cleanArabicText(rawInput);
  if (cleanText === '') {
    $('#result')
      .removeClass('result-success')
      .addClass('result-error')
      .text('لا يوجد حروف عربية صالحة للحساب');
    return;
  }

  const values = calculateAll(cleanText);
  // عرض نتيجة الجمل كمرجع
  const resultText = `الجمل: ${values.jummal.toLocaleString()}`;

  $('#result')
    .removeClass('result-error')
    .addClass('result-success')
    .text(resultText);

  // نسخ قيمة الجمل تلقائيًا
  copyToClipboard(values.jummal);
  showCopiedFlash($('#result'));

  addToHistory(cleanText, values);
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

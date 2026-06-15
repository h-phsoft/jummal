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

// حساب القيم للجداول المحددة
function calculateForTables(text) {
  const results = [];

  // حساب الجمل
  if ($('#checkJummal').is(':checked')) {
    let value = 0;
    for (let char of text) {
      if (jummalValues[char]) value += jummalValues[char];
    }
    results.push({ name: 'الجمل', value });
  }

  // حساب الأبجد
  if ($('#checkAbjad').is(':checked')) {
    let value = 0;
    for (let char of text) {
      const idx = getUniqueIndex(char);
      if (idx) value += idx;
    }
    results.push({ name: 'الأبجد', value });
  }

  // حساب الأيقغ
  if ($('#checkAyqagh').is(':checked')) {
    let value = 0;
    for (let char of text) {
      const idx = getUniqueIndex(char);
      if (idx) value += ((idx - 1) % 9) + 1;
    }
    results.push({ name: 'الأيقغ', value });
  }

  // جدول مخصص 1 - قيم مختلفة
  if ($('#checkCustom1').is(':checked')) {
    const custom1Values = {
      'ا': 5, 'أ': 5, 'إ': 5, 'آ': 5,
      'ب': 10,
      'ج': 15,
      'د': 20,
      'ه': 25, 'ة': 25,
      'و': 30,
      'ز': 35,
      'ح': 40,
      'ط': 45,
      'ي': 50, 'ى': 50, 'ئ': 50,
      'ك': 55,
      'ل': 60,
      'م': 65,
      'ن': 70,
      'س': 75,
      'ع': 80,
      'ف': 85,
      'ص': 90,
      'ق': 95,
      'ر': 100,
      'ش': 105,
      'ت': 110,
      'ث': 115,
      'خ': 120,
      'ذ': 125,
      'ض': 130,
      'ظ': 135,
      'غ': 140
    };
    let value = 0;
    for (let char of text) {
      if (custom1Values[char]) value += custom1Values[char];
    }
    results.push({ name: 'جدول مخصص 1', value });
  }

  // جدول مخصص 2 - قيم مضاعفة
  if ($('#checkCustom2').is(':checked')) {
    const custom2Values = {};
    for (let char in jummalValues) {
      custom2Values[char] = jummalValues[char] * 2;
    }
    let value = 0;
    for (let char of text) {
      if (custom2Values[char]) value += custom2Values[char];
    }
    results.push({ name: 'جدول مخصص 2', value });
  }

  // جدول مخصص 3 - قيم ثلاثية
  if ($('#checkCustom3').is(':checked')) {
    const custom3Values = {};
    for (let char in jummalValues) {
      custom3Values[char] = jummalValues[char] * 3;
    }
    let value = 0;
    for (let char of text) {
      if (custom3Values[char]) value += custom3Values[char];
    }
    results.push({ name: 'جدول مخصص 3', value });
  }

  return results;
}

// === إدارة السجل ===
const STORAGE_KEY = 'calculate_tables_history';
let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addToHistory(cleanText, tableName, value) {
  history.unshift({ text: cleanText, tableName, value });
  if (history.length > 50)
    history = history.slice(0, 50);
  saveHistory();
  updateHistoryDisplay();
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
    const row = $('<tr><td colspan="4" class="text-center text-muted py-3">لا توجد سجلات بعد</td></tr>');
    container.append(row);
    return;
  }

  history.forEach((item, index) => {
    const row = $(`
            <tr class="history-row">
              <td title="${item.text}">${item.text}</td>
              <td>${item.tableName}</td>
              <td>${item.value.toLocaleString()}</td>
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

    // نقرة مزدوجة على خلية القيمة: نسخ القيمة
    row.on('dblclick', 'td:nth-child(3)', function () {
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

  const results = calculateForTables(cleanText);
  
  if (results.length === 0) {
    $('#result')
      .removeClass('result-success')
      .addClass('result-error')
      .text('الرجاء اختيار جدول واحد على الأقل');
    return;
  }

  // عرض النتائج
  let resultHTML = '<div class="row g-2">';
  results.forEach(r => {
    resultHTML += `
      <div class="col-6 col-md-4">
        <div class="p-2 border rounded text-center">
          <small class="d-block text-muted">${r.name}</small>
          <strong class="fs-5">${r.value.toLocaleString()}</strong>
        </div>
      </div>
    `;
  });
  resultHTML += '</div>';

  $('#result')
    .removeClass('result-error')
    .addClass('result-success')
    .html(resultHTML);

  // إضافة كل نتيجة إلى السجل
  results.forEach(r => {
    addToHistory(cleanText, r.name, r.value);
  });

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

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

// حساب القيم للجداول المحددة باستخدام CHARS_INDEX و tablesData
function calculateForTables(text) {
  const results = [];

  // حساب الجمل
  if ($('#checkJummal').is(':checked')) {
    let value = 0;
    for (let char of text) {
      const idx = CHARS_INDEX[char];
      if (idx !== undefined) {
        value += tablesData.jummal.values[idx];
      }
    }
    results.push({ name: tablesData.jummal.name, value });
  }

  // حساب الأبجد
  if ($('#checkAbjad').is(':checked')) {
    let value = 0;
    for (let char of text) {
      const idx = CHARS_INDEX[char];
      if (idx !== undefined) {
        value += tablesData.abjad.values[idx];
      }
    }
    results.push({ name: tablesData.abjad.name, value });
  }

  // حساب الأيقغ
  if ($('#checkAyqagh').is(':checked')) {
    let value = 0;
    for (let char of text) {
      const idx = CHARS_INDEX[char];
      if (idx !== undefined) {
        value += tablesData.ayqagh.values[idx];
      }
    }
    results.push({ name: tablesData.ayqagh.name, value });
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

  // عرض النتائج كجدول مع المجموع في التذييل
  let resultHTML = `
    <table class=\"result-table\">
      <thead>
        <tr>
          <th>الجدول</th>
          <th>القيمة</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let totalSum = 0;
  results.forEach(r => {
    totalSum += r.value;
    resultHTML += `
      <tr>
        <td>${r.name}</td>
        <td>${r.value.toLocaleString()}</td>
      </tr>
    `;
  });
  
  // إضافة صف المجموع في تذييل الجدول
  resultHTML += `
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background: rgba(150, 130, 110, 0.2);">
          <td>المجموع الكلي</td>
          <td>${totalSum.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  `;

  $('#result')
    .removeClass('result-error')
    .addClass('result-success')
    .html(resultHTML);

  // إخفاء حاوية المجموع القديم (لم يعد مستخدماً)
  $('#totalSumContainer').hide();

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

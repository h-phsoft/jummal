// === تعريف الحروف المدعومة ===
const BAST_CHARS = {
  "ا": "الف",
  "ب": "با",
  "ج": "جيم",
  "د": "دال",
  "ه": "ها",
  "و": "واو",
  "ز": "زاي",
  "ح": "حا",
  "ط": "طا",
  "ي": "يا",
  "ك": "كاف",
  "ل": "لام",
  "م": "ميم",
  "ن": "نون",
  "س": "سين",
  "ع": "عين",
  "ف": "فا",
  "ص": "صاد",
  "ق": "قاف",
  "ر": "را",
  "ش": "شين",
  "ت": "تا",
  "ث": "ثا",
  "خ": "خا",
  "ذ": "ذال",
  "ض": "ضاد",
  "ظ": "ظا",
  "غ": "غين"
};
const BAST_ARRAY = [
  "الف",
  "با",
  "جيم",
  "دال",
  "ها",
  "واو",
  "زاي",
  "حا",
  "طا",
  "يا",
  "كاف",
  "لام",
  "ميم",
  "نون",
  "سين",
  "عين",
  "فا",
  "صاد",
  "قاف",
  "را",
  "شين",
  "تا",
  "ثا",
  "خا",
  "ذال",
  "ضاد",
  "ظا",
  "غين"
];
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

// === إدارة السجل ===
const STORAGE_KEY = 'calculate_tables_history';
let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addToHistory(cleanText, tableName) {
  history.unshift({text: cleanText, tableName});
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
    const row = $('<tr><td colspan="2" class="text-center text-muted py-3">لا توجد سجلات بعد</td></tr>');
    container.append(row);
    return;
  }

  history.forEach((item, index) => {
    const row = $(`
            <tr class="history-row">
              <td title="${item.text}">${item.text}</td>
              <td>${item.tableName}</td>
            </tr>
          `);

    // نقرة على السطر: استرجاع النص
    row.on('click', function (e) {
      if (!$(e.target).hasClass('btn-delete-item')) {
        $('#inputText').val(item.text).focus();
      }
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

// === توليد خانات الاختيار للجداول ديناميكياً ===
function renderTableCheckboxes() {
  const container = $('#tablesCheckboxes');
  container.empty();

  tablesData.forEach((table, index) => {
    const checkboxId = `checkTable${index}`;
    const row = $(`
      <tr>
        <td class="text-center">
          <input type="checkbox" id="${checkboxId}" class="table-checkbox" value="${index}">
        </td>
        <td>${table.name}</td>
      </tr>
    `);
    container.append(row);
  });
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

  // جمع الجداول المحددة
  const selectedTables = [];
  $('.table-checkbox:checked').each(function () {
    const tableIndex = parseInt($(this).val());
    selectedTables.push(tablesData[tableIndex]);
  });

  if (selectedTables.length === 0) {
    $('#result')
      .removeClass('result-success')
      .addClass('result-error')
      .text('الرجاء اختيار جدول واحد على الأقل');
    return;
  }

  // حساب القيم لكل جدول محدد باستخدام CHARS_INDEX و tablesData
  const results = [];
  selectedTables.forEach(table => {
    let value = 0;
    for (let char of cleanText) {
      const idx = CHARS_INDEX[char];
      if (idx !== undefined) {
        value += table.values[idx];
      }
    }
    results.push({name: table.name, value});
  });

  // عرض النتائج كجدول مع المجموع في التذييل
  let resultHTML = `
    <table class="result-table">
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
    addToHistory(cleanText, r.name);
  });

  $('#inputText').val('').focus();
});

$('#inputText').on('keypress', function (e) {
  if (e.which === 13) {
    $('#calculateBtn').click();
  }
});

$('#clearAllBtn').on('click', clearAllHistory);

// تحميل السجل عند البدء وتوليد خانات الاختيار
updateHistoryDisplay();
renderTableCheckboxes();

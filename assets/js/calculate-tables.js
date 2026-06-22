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

function addToHistory(cleanText) {
  // Check if this text already exists in history to avoid duplicates
  const exists = history.some(item => item.text === cleanText);
  if (!exists) {
    history.unshift({text: cleanText});
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
    const row = $('<tr><td colspan="3" class="text-center text-muted py-3">لا توجد سجلات بعد</td></tr>');
    container.append(row);
    return;
  }

  history.forEach((item, index) => {
    const row = $(`
            <tr class="history-row">
              <td>${index + 1}</td>
              <td title="${item.text}">${item.text}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" onclick="restoreHistory(${index})">استرجاع</button>
                <button class="btn btn-sm btn-outline-danger btn-delete-item" onclick="removeItem(${index})">حذف</button>
              </td>
            </tr>
          `);

    container.append(row);
  });
}

function restoreHistory(index) {
  $('#inputText').val(history[index].text).focus();
}

// جعل الدوال متاحة عالمياً
window.removeItem = removeItem;
window.restoreHistory = restoreHistory;

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

// === تصفية الجداول عند البحث ===
function filterTables() {
  const searchText = $('#searchTable').val().toLowerCase();
  $('#tablesCheckboxes tr').each(function() {
    const tableName = $(this).find('td:eq(1)').text().toLowerCase();
    if (tableName.includes(searchText)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

// === حدث الحساب ===
$('#calculateBtn').on('click', function () {
  const rawInput = $('#inputText').val();
  if (!rawInput || rawInput.trim() === '') {
    alert('الرجاء إدخال نص');
    return;
  }

  const cleanText = cleanArabicText(rawInput);
  if (cleanText === '') {
    alert('لا يوجد حروف عربية صالحة للحساب');
    return;
  }

  // جمع الجداول المحددة
  const selectedTables = [];
  $('.table-checkbox:checked').each(function () {
    const tableIndex = parseInt($(this).val());
    selectedTables.push(tablesData[tableIndex]);
  });

  if (selectedTables.length === 0) {
    alert('الرجاء اختيار جدول واحد على الأقل');
    return;
  }

  // تقسيم النص إلى كلمات
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  // حساب القيم لكل جدول محدد باستخدام CHARS_INDEX و tablesData
  const results = [];
  selectedTables.forEach(table => {
    let totalValue = 0;
    const wordValues = [];
    
    words.forEach(word => {
      let wordValue = 0;
      for (let char of word) {
        const idx = CHARS_INDEX[char];
        if (idx !== undefined) {
          wordValue += table.values[idx];
        }
      }
      wordValues.push(wordValue);
      totalValue += wordValue;
    });
    
    results.push({
      name: table.name,
      title: table.title || table.name,
      totalValue: totalValue,
      wordValues: wordValues
    });
  });

  // عرض النتائج في الجدول الجديد
  const headerRow = $('#resultHeaderRow');
  const wordsHeaderRow = $('#wordsHeaderRow');
  const tbody = $('#resultTableBody');
  
  // مسح المحتوى القديم
  wordsHeaderRow.empty();
  tbody.empty();
  
  // إضافة أعمدة الكلمات في الصف الثاني من الرأس
  words.forEach((word, index) => {
    wordsHeaderRow.append(`<th class="word-header">كلمة ${index + 1}<br><small>"${word}"</small></th>`);
  });
  
  // إضافة صفوف النتائج
  results.forEach(r => {
    let rowHTML = `<tr><td><strong>${r.name}</strong></td><td>${r.title}<br><span class="text-primary fw-bold">${r.totalValue.toLocaleString()}</span></td>`;
    
    r.wordValues.forEach(val => {
      rowHTML += `<td class="result-word-col">${val.toLocaleString()}</td>`;
    });
    
    rowHTML += `</tr>`;
    tbody.append(rowHTML);
  });
  
  // إظهار جدول النتائج وإخفاء رسالة "لا توجد نتائج"
  $('#resultTable').show();
  $('#noResultMsg').hide();

  // إضافة النص إلى السجل (مرة واحدة فقط)
  addToHistory(cleanText);

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

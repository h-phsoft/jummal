// الحروف وقيمها وتنقية النص والحساب في core/letters.js
// التخزين في core/common.js

// === إدارة السجل ===
const STORAGE_KEY = 'calculate_tables_history';
let history = loadStoredList(STORAGE_KEY);

function saveHistory() {
  saveStoredList(STORAGE_KEY, history);
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
              <td title="${item.text}" class="history-text-cell">${item.text}</td>
              <td style="width: 50px; text-align: center;">
                <button class="btn btn-sm btn-outline-danger delete-history-btn" data-index="${index}" title="حذف">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          `);

    container.append(row);
  });
  
  // Add double-click event to restore history (using delegated event handler)
  $(document).off('dblclick', '.history-text-cell');
  $(document).on('dblclick', '.history-text-cell', function() {
    const text = $(this).attr('title');
    $('#inputText').val(text).focus();
  });
  
  // Add click event for delete button
  $(document).off('click', '.delete-history-btn');
  $(document).on('click', '.delete-history-btn', function(e) {
    e.stopPropagation();
    const index = $(this).data('index');
    removeItem(index);
  });
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
  
  // Select all checkbox functionality
  $('#selectAllTables').on('change', function() {
    const isChecked = $(this).is(':checked');
    $('.table-checkbox').prop('checked', isChecked);
  });
  
  // Update select all checkbox state when individual checkboxes change
  $(document).on('change', '.table-checkbox', function() {
    const totalCheckboxes = $('.table-checkbox').length;
    const checkedCheckboxes = $('.table-checkbox:checked').length;
    $('#selectAllTables').prop('checked', totalCheckboxes === checkedCheckboxes && totalCheckboxes > 0);
  });
  
  // Select the first table (الجمل) by default
  if ($('.table-checkbox').length > 0) {
    $('.table-checkbox').first().prop('checked', true);
    $('#selectAllTables').prop('checked', false);
  }
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

// === Sidebar Toggle Functions ===
$(document).ready(function() {
  // Right Sidebar (Tables)
  $('#rightSidebarToggle').on('click', function() {
    $('#rightSidebar').addClass('show');
    $('#sidebarOverlay').addClass('show');
  });
  
  $('#closeRightSidebar').on('click', function() {
    $('#rightSidebar').removeClass('show');
    $('#sidebarOverlay').removeClass('show');
  });
  
  // Left Sidebar (History)
  $('#leftSidebarToggle').on('click', function() {
    $('#leftSidebar').addClass('show');
    $('#sidebarOverlay').addClass('show');
  });
  
  $('#closeLeftSidebar').on('click', function() {
    $('#leftSidebar').removeClass('show');
    $('#sidebarOverlay').removeClass('show');
  });
  
  // Close sidebars when clicking overlay
  $('#sidebarOverlay').on('click', function() {
    $('#rightSidebar').removeClass('show');
    $('#leftSidebar').removeClass('show');
    $('#sidebarOverlay').removeClass('show');
  });
  
  // Search table filter event
  $('#searchTable').on('input', filterTables);
  
  // تحميل السجل عند البدء وتوليد خانات الاختيار
  updateHistoryDisplay();
  renderTableCheckboxes();

  // قائمة خيارات الأرقام في جدول النتائج
  initNumberActions('#resultTableBody');
});

$('#clearAllBtn').on('click', clearAllHistory);

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

  // حساب القيم لكل جدول محدد (الحساب نفسه في core/letters.js)
  const words = splitWords(cleanText);
  const results = selectedTables.map(table => {
    const calc = calculateWords(cleanText, table.values);
    return {
      name: table.name,
      title: table.title || table.name,
      totalValue: calc.total,
      wordValues: calc.wordValues
    };
  });

  // عرض النتائج في الجدول الجديد
  const headerRow = $('#resultHeaderRow');
  const tbody = $('#resultTableBody');
  
  // مسح المحتوى القديم من الرأس
  headerRow.find('th:gt(1)').remove(); // إزالة أعمدة الكلمات القديمة
  
  // إضافة أعمدة الكلمات في الرأس (بعد عمودي "الجدول" و"العبارة")
  words.forEach((word, index) => {
    headerRow.append(`<th>${word}</th>`);
  });
  
  // إضافة صفوف النتائج
  tbody.empty();
  results.forEach(r => {
    let rowHTML = `<tr><td><strong>${r.name}</strong></td><td class="number-cell" data-number="${r.totalValue}">${numberCellContent(r.totalValue)}</td>`;
    
    r.wordValues.forEach(val => {
      rowHTML += `<td class="result-word-col number-cell" data-number="${val}">${numberCellContent(val)}</td>`;
    });
    
    rowHTML += `</tr>`;
    tbody.append(rowHTML);
  });
  
  // إظهار جدول النتائج وإخفاء رسالة "لا توجد نتائج"
  $('#resultTable').show();
  $('#noResultMsg').hide();

  // عرض إحصاءات الأحرف
  if (typeof renderTextStats === 'function') {
    renderTextStats(cleanText, '#textStats');
  }

  // إضافة النص إلى السجل (مرة واحدة فقط)
  addToHistory(cleanText);

  // لا نحذف النص من مربع الإدخال - نبقيه كما هو
  $('#inputText').focus();
});

$('#inputText').on('keypress', function (e) {
  if (e.which === 13) {
    $('#calculateBtn').click();
  }
});

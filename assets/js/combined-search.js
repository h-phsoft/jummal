// === البحث في QWords.json بناءً على حساب الجمل ===

let qwordsData = [];

// تحميل ملف QWords.json عند بدء الصفحة
async function loadQWords() {
  try {
    const response = await fetch('assets/js/data/QWords.json');
    qwordsData = await response.json();
    console.log('تم تحميل QWords.json:', qwordsData.length, 'كلمة');
  } catch (error) {
    console.error('خطأ في تحميل QWords.json:', error);
    qwordsData = [];
  }
}

// دالة البحث عن الكلمات المطابقة لقيمة الجمل المدخلة
function searchByJummalValue(jummalValue) {
  const checkJummal = document.getElementById('checkJummal').checked;
  const checkAbjad = document.getElementById('checkAbjad').checked;
  const checkAyqagh = document.getElementById('checkAyqagh').checked;

  const tbody = document.getElementById('searchResultsBody');
  tbody.innerHTML = '';

  if (!qwordsData.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">جاري تحميل البيانات...</td></tr>';
    return;
  }

  // تصفية الكلمات التي تطابق القيمة في أي من الحقول المحددة
  const results = qwordsData.filter(word => {
    if (checkJummal && word.jummal === jummalValue)
      return true;
    if (checkAbjad && word.abjad === jummalValue)
      return true;
    if (checkAyqagh && word.ayqagh === jummalValue)
      return true;
    return false;
  });

  if (results.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">لا توجد كلمات مطابقة</td></tr>';
    return;
  }

  // عرض النتائج (نحددها بـ 100 نتيجة كحد أقصى لتجنب البطء)
  const displayResults = results.slice(0, 100);

  displayResults.forEach(word => {
    const row = document.createElement('tr');
    row.className = 'history-row';

    // تحديد الخلايا التي تطابق القيمة وتلوينها
    const jummalMatch = checkJummal && word.jummal === jummalValue;
    const abjadMatch = checkAbjad && word.abjad === jummalValue;
    const ayqaghMatch = checkAyqagh && word.ayqagh === jummalValue;

    row.innerHTML = `
      <td title="${word.text28}">${word.text28}</td>
      <td class="${jummalMatch ? 'match-jummal' : ''}">${word.jummal}</td>
      <td class="${abjadMatch ? 'match-abjad' : ''}">${word.abjad}</td>
      <td class="${ayqaghMatch ? 'match-ayqagh' : ''}">${word.ayqagh}</td>
    `;

    tbody.appendChild(row);
  });

  // إذا كان هناك أكثر من 100 نتيجة
  if (results.length > 100) {
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `<td colspan="4" class="text-center text-muted py-2">عرض أول 100 نتيجة من أصل ${results.length}</td>`;
    tbody.appendChild(infoRow);
  }
}

// تعديل حدث الحساب في jummal.js ليشغل البحث
function initCombinedSearch() {
  // تحميل البيانات عند بدء الصفحة
  loadQWords();

  // الاستماع لتغييرات checkboxes
  document.getElementById('checkJummal').addEventListener('change', () => {
    const inputText = document.getElementById('inputText').value;
    if (inputText.trim()) {
      // إعادة البحث إذا كان هناك نص
      const currentResult = document.getElementById('jummalResult');
      if (currentResult.classList.contains('result-success')) {
        const jummalValue = parseInt(currentResult.textContent.replace(/[^0-9]/g, ''));
        if (!isNaN(jummalValue)) {
          searchByJummalValue(jummalValue);
        }
      }
    }
  });

  document.getElementById('checkAbjad').addEventListener('change', () => {
    const inputText = document.getElementById('inputText').value;
    if (inputText.trim()) {
      const currentResult = document.getElementById('jummalResult');
      if (currentResult.classList.contains('result-success')) {
        const jummalValue = parseInt(currentResult.textContent.replace(/[^0-9]/g, ''));
        if (!isNaN(jummalValue)) {
          searchByJummalValue(jummalValue);
        }
      }
    }
  });

  document.getElementById('checkAyqagh').addEventListener('change', () => {
    const inputText = document.getElementById('inputText').value;
    if (inputText.trim()) {
      const currentResult = document.getElementById('jummalResult');
      if (currentResult.classList.contains('result-success')) {
        const jummalValue = parseInt(currentResult.textContent.replace(/[^0-9]/g, ''));
        if (!isNaN(jummalValue)) {
          searchByJummalValue(jummalValue);
        }
      }
    }
  });
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initCombinedSearch);
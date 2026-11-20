// منطق البحث نفسه في core/word-search.js (مشترك مع صفحة البحث)

// قراءة أنواع البحث المحددة
function getSelectedSearchTypes() {
  return {
    jummal: document.getElementById('checkJummal').checked,
    abjad: document.getElementById('checkAbjad').checked,
    ayqagh: document.getElementById('checkAyqagh').checked
  };
}

// دالة البحث عن الكلمات المطابقة لقيمة الجمل المدخلة
function searchByJummalValue(jummalValue) {
  const types = getSelectedSearchTypes();
  const tbody = document.getElementById('searchResultsBody');
  tbody.innerHTML = '';

  if (typeof qWordsData === 'undefined' || !qWordsData.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">جاري تحميل البيانات...</td></tr>';
    return;
  }

  const found = findWordsByValue(jummalValue, types);
  updateWordSearchCounters(found.counts, types);

  if (found.items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">لا توجد كلمات مطابقة</td></tr>';
    return;
  }

  found.items.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'history-row';
    row.innerHTML = `
      <td title="${item.text}">${item.text}</td>
      <td class="number-cell ${item.match.jummal ? 'match-jummal' : ''}" data-number="${item.jummal}">${numberCellContent(item.jummal, false)}</td>
      <td class="number-cell ${item.match.abjad ? 'match-abjad' : ''}" data-number="${item.abjad}">${numberCellContent(item.abjad, false)}</td>
      <td class="number-cell ${item.match.ayqagh ? 'match-ayqagh' : ''}" data-number="${item.ayqagh}">${numberCellContent(item.ayqagh, false)}</td>
      <td>
        <button class="btn-delete-item" onclick="deleteSearchRow(this)" title="حذف">×</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// دالة حذف سطر من جدول البحث
function deleteSearchRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    // تحديث العدادات بعد الحذف
    const totalCountEl = document.getElementById('totalCount');
    const jummalCountEl = document.getElementById('jummalCount');
    const abjadCountEl = document.getElementById('abjadCount');
    const ayqaghCountEl = document.getElementById('ayqaghCount');
    
    const tbody = document.getElementById('searchResultsBody');
    const remainingRows = tbody.querySelectorAll('tr').length;
    
    if (totalCountEl) {
      const currentTotal = parseInt(totalCountEl.textContent.replace(/[()]/g, '')) || 0;
      totalCountEl.textContent = ` (${Math.max(0, currentTotal - 1)})`;
    }
    
    // إذا لم يبق أي صفوف، إظهار رسالة
    if (remainingRows === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">لا توجد كلمات مطابقة</td></tr>';
    }
  }
}

// تعديل حدث الحساب في jummal.js ليشغل البحث
function initCombinedSearch() {
  // قائمة خيارات الأرقام في نتائج البحث
  if (typeof initNumberActions === 'function') {
    initNumberActions('#searchResultsBody');
  }

  // إعادة البحث عند تغيير نوع البحث (نفس المعالج للأزرار الثلاثة)
  function researchFromResult() {
    const inputText = document.getElementById('inputText').value;
    if (!inputText.trim()) {
      return;
    }
    const currentResult = document.getElementById('jummalResult');
    if (currentResult.classList.contains('result-success')) {
      const jummalValue = parseInt(currentResult.textContent.replace(/[^0-9]/g, ''));
      if (!isNaN(jummalValue)) {
        searchByJummalValue(jummalValue);
      }
    }
  }

  ['checkJummal', 'checkAbjad', 'checkAyqagh'].forEach(id => {
    document.getElementById(id).addEventListener('change', researchFromResult);
  });
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initCombinedSearch);

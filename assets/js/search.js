/**
 * Search functionality for QWords.json
 * Searches by jummal, abjad, or ayqagh values based on checkbox selection
 * Uses embedded QWORDS_DATA for offline/flash memory usage
 */

async function performSearch() {
  const targetNum = parseInt(document.getElementById('searchNumber').value);
  // دعم كلا المعرفين للجدول: resultsTable في search.html و searchResultsTable في combined.html
  const tableEl = document.querySelector('#resultsTable tbody') || document.querySelector('#searchResultsTable tbody');
  const noResultsMsg = document.getElementById('noResultsMsg');

  // Get checkbox states
  const searchJummal = document.getElementById('checkJummal').checked;
  const searchAbjad = document.getElementById('checkAbjad').checked;
  const searchAyqagh = document.getElementById('checkAyqagh').checked;

  // Validate at least one checkbox is selected
  if (!searchJummal && !searchAbjad && !searchAyqagh) {
    alert('الرجاء اختيار نوع حساب واحد على الأقل للبحث فيه');
    return;
  }

  tableEl.innerHTML = '';
  if (noResultsMsg)
    noResultsMsg.style.display = 'none';

  if (isNaN(targetNum)) {
    alert('الرجاء إدخال رقم صحيح');
    return;
  }

  try {
    // منطق البحث نفسه في core/word-search.js (مشترك مع المنصة الموحدة)
    const types = {jummal: searchJummal, abjad: searchAbjad, ayqagh: searchAyqagh};
    const found = findWordsByValue(targetNum, types);

    found.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.text}</td>
        <td class="${item.match.jummal ? 'highlight-jummal' : ''}">${item.jummal}</td>
        <td class="${item.match.abjad ? 'highlight-abjad' : ''}">${item.abjad}</td>
        <td class="${item.match.ayqagh ? 'highlight-ayqagh' : ''}">${item.ayqagh}</td>
      `;
      tableEl.appendChild(tr);
    });

    updateWordSearchCounters(found.counts, types);

    if (noResultsMsg) {
      noResultsMsg.style.display = found.counts.total === 0 ? 'block' : 'none';
    }
  } catch (error) {
    console.error(error);
    tableEl.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
  }
}

$('#searchNumber').on('keypress', function (e) {
  if (e.which === 13) {
    performSearch();
  }
});

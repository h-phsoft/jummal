/**
 * Search functionality for QWords.json
 * Searches by jummal, abjad, or ayqagh values based on checkbox selection
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
    // محاولة جلب الملف
    // ملاحظة: بسبب سياسات المتصفح (CORS)، قد لا يعمل fetch مع file:// مباشرة
    // يجب تشغيل الصفحة عبر سيرفر محلي (مثل Live Server في VS Code)
    let response;
    try {
      response = await fetch('assets/js/data/QWords.json');
    } catch (e) {
      throw new Error("تعذر الوصول للملف. تأكد من وجود المسار assets/js/data/QWords.json وتشغيل الصفحة عبر سيرفر محلي.");
    }

    if (!response.ok)
      throw new Error('ملف البيانات غير موجود');

    const data = await response.json();
    // نفترض أن البيانات مصفوفة أو كائن يحتوي على مصفوفة
    const wordsArray = Array.isArray(data) ? data : (data.words || Object.values(data));

    let foundCount = 0;
    let jummalMatchCount = 0;
    let abjadMatchCount = 0;
    let ayqaghMatchCount = 0;

    wordsArray.forEach(item => {
      // نأخذ النص من الحقل text28 كما طلبت سابقاً أو الحقل النصي الأساسي
      const text = item.text28 || item.text || item.word || "";

      // نستخدم القيم المخزنة مباشرة في الملف دون إعادة حسابها
      const valJummal = item.jummal !== undefined ? item.jummal : 0;
      const valAbjad = item.abjad !== undefined ? item.abjad : 0;
      const valAyqagh = item.ayqagh !== undefined ? item.ayqagh : 0;

      let matchFound = false;
      let rowClassJummal = '';
      let rowClassAbjad = '';
      let rowClassAyqagh = '';

      // التحقق فقط من الحقول المحددة في الـ checkboxes
      if (searchJummal && valJummal === targetNum) {
        matchFound = true;
        rowClassJummal = 'highlight-jummal';
        jummalMatchCount++;
      }
      if (searchAbjad && valAbjad === targetNum) {
        matchFound = true;
        rowClassAbjad = 'highlight-abjad';
        abjadMatchCount++;
      }
      if (searchAyqagh && valAyqagh === targetNum) {
        matchFound = true;
        rowClassAyqagh = 'highlight-ayqagh';
        ayqaghMatchCount++;
      }

      if (matchFound) {
        foundCount++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${text}</td>
                    <td class="${rowClassJummal}">${valJummal}</td>
                    <td class="${rowClassAbjad}">${valAbjad}</td>
                    <td class="${rowClassAyqagh}">${valAyqagh}</td>
                `;
        tableEl.appendChild(tr);
      }
    });

    // تحديث عدادات العناوين
    const totalCountEl = document.getElementById('totalCount');
    const jummalCountEl = document.getElementById('jummalCount');
    const abjadCountEl = document.getElementById('abjadCount');
    const ayqaghCountEl = document.getElementById('ayqaghCount');

    if (totalCountEl)
      totalCountEl.textContent = ` (${foundCount})`;
    if (jummalCountEl)
      jummalCountEl.textContent = searchJummal ? ` (${jummalMatchCount})` : ' (0)';
    if (abjadCountEl)
      abjadCountEl.textContent = searchAbjad ? ` (${abjadMatchCount})` : ' (0)';
    if (ayqaghCountEl)
      ayqaghCountEl.textContent = searchAyqagh ? ` (${ayqaghMatchCount})` : ' (0)';

    if (foundCount === 0 && noResultsMsg) {
      noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
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

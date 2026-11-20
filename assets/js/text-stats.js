// === إحصاءات أحرف النص ===
// ترتيب العرض: SUPPORTED_CHARS من core/letters.js

// حساب الإحصاءات من النص المنقّى (تُستبعد المسافات)
function computeTextStats(cleanText) {
  const counts = {};
  let total = 0;

  for (const char of cleanText) {
    if (char.trim() === '') {
      continue;
    }
    counts[char] = (counts[char] || 0) + 1;
    total++;
  }

  const letters = Object.keys(counts).sort((a, b) => {
    const ia = SUPPORTED_CHARS.indexOf(a);
    const ib = SUPPORTED_CHARS.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return {
    total: total,
    unique: letters.length,
    letters: letters,
    counts: counts
  };
}

// عرض الإحصاءات داخل الحاوية المحددة
function renderTextStats(cleanText, containerSelector) {
  const container = $(containerSelector);
  if (container.length === 0) {
    return;
  }

  const stats = computeTextStats(cleanText || '');
  if (stats.total === 0) {
    container.empty().addClass('d-none');
    return;
  }

  let countCells = '';
  stats.letters.forEach(letter => {
    countCells += `
      <div class="text-stats-cell">
        <div class="text-stats-letter">${letter}</div>
        <div class="text-stats-count">${stats.counts[letter]}</div>
      </div>`;
  });

  const html = `
    <h6 class="fw-bold mb-2">إحصاءات الأحرف</h6>
    <div class="d-flex flex-wrap justify-content-center gap-2 mb-2">
      <span class="badge bg-primary fs-6">عدد الأحرف الكلي: ${stats.total.toLocaleString()}</span>
      <span class="badge bg-success fs-6">عدد الأحرف دون تكرار: ${stats.unique.toLocaleString()}</span>
    </div>
    <div class="mb-2">
      <span class="fw-bold">الأحرف المستخدمة:</span>
      <span class="text-stats-used">${stats.letters.join(' ')}</span>
    </div>
    <div class="fw-bold mb-1">تكرار كل حرف:</div>
    <div class="d-flex flex-wrap justify-content-center gap-1">${countCells}</div>`;

  container.html(html).removeClass('d-none');
}

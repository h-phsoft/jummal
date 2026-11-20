// =====================================================
// دوال مساعدة مشتركة بين الصفحات
// =====================================================

// نسخ نص إلى الحافظة
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(String(text)).catch(() => {
    });
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// قراءة قائمة محفوظة في المتصفح (السجل)
function loadStoredList(key) {
  try {
    const list = JSON.parse(localStorage.getItem(key));
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

// حفظ قائمة في المتصفح
function saveStoredList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    // التخزين غير متاح (وضع التصفح الخاص مثلاً)
  }
}

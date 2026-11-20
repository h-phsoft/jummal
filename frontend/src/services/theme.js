// =====================================================
// النمط الفاتح/الداكن: اختيار المستخدم يُحفظ في الجهاز،
// وإن لم يختر يتبع نمط نظام التشغيل
// =====================================================
const KEY = 'app_theme';

function readStored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// النمط الفعلي المعروض الآن
export function currentTheme() {
  return readStored() || systemTheme();
}

// تطبيق النمط المحفوظ قبل رسم الواجهة (يمنع وميض الألوان)
export function applyStoredTheme() {
  const stored = readStored();
  if (stored) {
    document.documentElement.dataset.theme = stored;
  }
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // التخزين غير متاح، يبقى النمط لهذه الجلسة فقط
  }
}

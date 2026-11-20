// =====================================================
// تحميل بيانات القرآن من ملفات JSON المحلية (مرة واحدة لكل ملف)
// تُحفظ في ذاكرة المتصفح عبر الـ PWA فتعمل دون إنترنت
// =====================================================
const cache = new Map();

function dataUrl(name) {
  return `${import.meta.env.BASE_URL}data/${name}.json`;
}

export function loadData(name) {
  if (!cache.has(name)) {
    const promise = fetch(dataUrl(name)).then(res => {
      if (!res.ok) {
        throw new Error(`Failed to load ${name} data (${res.status})`);
      }
      return res.json();
    });
    // عند الفشل يُحذف من الذاكرة لتُعاد المحاولة لاحقاً
    promise.catch(() => cache.delete(name));
    cache.set(name, promise);
  }
  return cache.get(name);
}

export const loadSwar = () => loadData('swar');
export const loadAyat = () => loadData('ayat');
export const loadWords = () => loadData('words');

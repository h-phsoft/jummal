// =====================================================
// تسجيل الـ Service Worker (العمل دون إنترنت) على الموقع فقط
// برنامج exe يقرأ الملفات من داخله فلا يحتاجه
// =====================================================
import {registerSW} from 'virtual:pwa-register';

export function registerOffline() {
  const isWeb = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  if (!isWeb || !('serviceWorker' in navigator) || import.meta.env.DEV) {
    return;
  }
  registerSW({immediate: true});
}

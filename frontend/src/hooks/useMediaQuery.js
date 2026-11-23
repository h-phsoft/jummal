// =====================================================
// متابعة استعلام وسائط CSS (مثل الشاشات الضيقة) وإعادة الرسم عند تغيّره
// =====================================================
import {useSyncExternalStore} from 'react';

export const NARROW_QUERY = '(max-width: 768px)';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

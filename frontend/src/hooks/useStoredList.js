// =====================================================
// قائمة محفوظة في المتصفح (السجل) مع حماية من تعذّر التخزين
// =====================================================
import {useCallback, useState} from 'react';

function read(key) {
  try {
    const list = JSON.parse(localStorage.getItem(key));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // التخزين غير متاح (وضع التصفح الخاص مثلاً)
  }
}

export function useStoredList(key, maxItems = 50) {
  const [items, setItems] = useState(() => read(key));

  const update = useCallback((next) => {
    setItems(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      const trimmed = value.slice(0, maxItems);
      write(key, trimmed);
      return trimmed;
    });
  }, [key, maxItems]);

  // إضافة في الأعلى إن لم يكن موجوداً (isSame يحدد التطابق)
  const add = useCallback((item, isSame) => {
    update(prev => (prev.some(x => isSame(x, item)) ? prev : [item, ...prev]));
  }, [update]);

  const remove = useCallback((index) => {
    update(prev => prev.filter((_, i) => i !== index));
  }, [update]);

  const clear = useCallback(() => {
    update([]);
  }, [update]);

  return {items, add, remove, clear};
}

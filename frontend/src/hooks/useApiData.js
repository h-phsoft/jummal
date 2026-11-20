// =====================================================
// تحميل نتيجة من واجهة البيانات المحلية مع حالة التحميل والخطأ
// =====================================================
import {useEffect, useState} from 'react';
import {apiGet} from '../services/api.js';

export function useApiData(path) {
  const [state, setState] = useState({data: null, loading: Boolean(path), error: null});

  useEffect(() => {
    if (!path) {
      return undefined;
    }
    let cancelled = false;
    apiGet(path)
      .then(data => {
        if (!cancelled) {
          setState({data: data, loading: false, error: null});
        }
      })
      .catch(err => {
        if (!cancelled) {
          setState({data: null, loading: false, error: err.message});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}

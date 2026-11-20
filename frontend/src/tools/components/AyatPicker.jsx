// =====================================================
// اختيار آية أو أكثر (F9 أو زر): بحث بدون تشكيل، تحديد متعدد بـ Ctrl
// يُرجع نص الآيات بالحروف الـ 28 مدموجة بمسافة
// =====================================================
import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {searchAyat} from '@jummal/core';
import {loadAyat} from '../../services/data.js';

export default function AyatPicker({open, initialQuery = '', onClose, onSelect}) {
  const {t} = useTranslation();
  const [ayat, setAyat] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery(initialQuery);
    setSelected(new Set());
    loadAyat().then(setAyat);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  }, [open, initialQuery]);

  const results = useMemo(() => (ayat ? searchAyat(ayat, query, 300) : []), [ayat, query]);

  if (!open) {
    return null;
  }

  const toggle = (id, multi) => {
    setSelected(prev => {
      const next = multi ? new Set(prev) : new Set();
      if (prev.has(id) && multi) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const confirm = (ids) => {
    const chosen = results.filter(a => ids.has(a.ayatId));
    if (chosen.length > 0) {
      onSelect(chosen.map(a => a.ayat28Text).join(' '));
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Enter') {
          confirm(selected.size > 0 ? selected : new Set(results.slice(0, 1).map(a => a.ayatId)));
        }
      }}>
        <h3 className="tool-section-title">{t('ayat_picker_title')}</h3>
        <input
          ref={inputRef}
          className="tool-input"
          placeholder={t('ayat_picker_search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="tool-hint">{t('ayat_picker_hint')}</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('col_surah')}</th>
                <th>#</th>
                <th>{t('col_ayah')}</th>
              </tr>
            </thead>
            <tbody>
              {!ayat && (
                <tr><td colSpan={3} className="empty-state">{t('loading')}</td></tr>
              )}
              {ayat && results.length === 0 && (
                <tr><td colSpan={3} className="empty-state">{t('no_results')}</td></tr>
              )}
              {results.map(a => (
                <tr
                  key={a.ayatId}
                  className={`clickable ${selected.has(a.ayatId) ? 'selected' : ''}`}
                  onClick={(e) => toggle(a.ayatId, e.ctrlKey || e.metaKey)}
                  onDoubleClick={() => confirm(new Set([a.ayatId]))}
                >
                  <td>{a.swarName}</td>
                  <td>{a.ayatNum}</td>
                  <td className="text-cell">{a.ayat28Text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tool-row" style={{justifyContent: 'flex-end'}}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>{t('cancel')}</button>
          <button type="button" className="btn btn-primary btn-sm" disabled={selected.size === 0} onClick={() => confirm(selected)}>
            {t('choose')} {selected.size > 1 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// حساب الجداول المخصصة: نص ← قيمة كل كلمة والمجموع في كل جدول مختار
// =====================================================
import {useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BookOpen, Trash2, X} from 'lucide-react';
import {calculateWords, cleanArabicText, splitWords, tablesData} from '@jummal/core';
import {useStoredList} from '../hooks/useStoredList.js';
import NumberValue from './components/NumberValue.jsx';
import TextStats from './components/TextStats.jsx';
import AyatPicker from './components/AyatPicker.jsx';

const HISTORY_KEY = 'calculate_tables_history';

export default function CustomTables() {
  const {t} = useTranslation();
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState(() => new Set([0]));
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef(null);
  const history = useStoredList(HISTORY_KEY);

  const visibleTables = useMemo(
    () => tablesData.map((table, index) => ({table, index})).filter(({table}) => table.name.includes(filter.trim())),
    [filter]
  );
  const allSelected = selected.size === tablesData.length;

  const toggle = (index) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const calculate = () => {
    if (!input.trim()) {
      setError(t('err_enter_text'));
      return;
    }
    const clean = cleanArabicText(input);
    if (!clean) {
      setError(t('err_no_letters'));
      return;
    }
    if (selected.size === 0) {
      setError(t('err_select_table'));
      return;
    }
    setError('');
    const rows = [...selected].sort((a, b) => a - b).map(index => ({
      name: tablesData[index].name,
      ...calculateWords(clean, tablesData[index].values)
    }));
    setResults({text: clean, words: splitWords(clean), rows: rows});
    history.add({text: clean}, (a, b) => a.text === b.text);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('tool_tables')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('tool_tables_desc')}</p>
        <textarea
          ref={inputRef}
          className="tool-textarea"
          placeholder={t('enter_text_f9')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              calculate();
            }
            if (e.key === 'F9') {
              e.preventDefault();
              setPickerOpen(true);
            }
          }}
        />
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '0.75rem'}}>
          <button type="button" className="btn btn-primary" onClick={calculate}>{t('calculate_phrase')}</button>
          <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
            <BookOpen size={16} style={{marginInlineEnd: 6}} /> {t('choose_ayah')}
          </button>
        </div>
        {error && <div className="result-banner error">{error}</div>}
      </div>

      <div className="tool-grid-2">
        <div className="tool-card">
          <h3 className="tool-section-title">{t('choose_tables')} ({selected.size})</h3>
          <div className="tool-row" style={{marginBottom: '0.5rem'}}>
            <input className="tool-input" style={{flex: 1}} placeholder={t('search_table')} value={filter} onChange={(e) => setFilter(e.target.value)} />
            <label className="tool-row" style={{gap: 6}}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? new Set() : new Set(tablesData.map((_, i) => i)))}
              />
              {t('select_all')}
            </label>
          </div>
          <div className="tables-picker">
            {visibleTables.map(({table, index}) => (
              <label key={table.name}>
                <input type="checkbox" checked={selected.has(index)} onChange={() => toggle(index)} />
                {table.name}
              </label>
            ))}
          </div>
        </div>

        <div className="tool-card">
          <div className="tool-row" style={{justifyContent: 'space-between', marginBottom: '0.75rem'}}>
            <h3 className="tool-section-title" style={{margin: 0}}>{t('history')}</h3>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={history.items.length === 0}
              onClick={() => {
                if (window.confirm(t('confirm_clear_history'))) {
                  history.clear();
                }
              }}
            >
              <Trash2 size={14} style={{marginInlineEnd: 4}} /> {t('clear_history')}
            </button>
          </div>
          <div className="table-wrap" style={{maxHeight: 340}}>
            <table className="data-table">
              <tbody>
                {history.items.length === 0 && (
                  <tr><td className="empty-state">{t('no_history')}</td></tr>
                )}
                {history.items.map((item, index) => (
                  <tr key={`${item.text}-${index}`} className="clickable" title={t('click_to_restore')}>
                    <td style={{width: 40}}>{index + 1}</td>
                    <td className="text-cell" onClick={() => setInput(item.text)}>{item.text}</td>
                    <td style={{width: 50}}>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => history.remove(index)} title={t('delete')}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {results && <TextStats text={results.text} />}

      <div className="tool-card">
        <h3 className="tool-section-title">{t('results')}</h3>
        {!results && <div className="empty-state">{t('tables_empty')}</div>}
        {results && (
          <div className="table-wrap" style={{maxHeight: '70vh'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('col_table')}</th>
                  <th>{t('col_phrase')}</th>
                  {results.words.map((word, i) => <th key={`${word}-${i}`}>{word}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.rows.map(row => (
                  <tr key={row.name}>
                    <td><strong>{row.name}</strong></td>
                    <td><strong><NumberValue value={row.total} /></strong></td>
                    {row.wordValues.map((value, i) => <td key={i}><NumberValue value={value} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AyatPicker
        open={pickerOpen}
        initialQuery={input}
        onClose={() => setPickerOpen(false)}
        onSelect={(text) => setInput(text)}
      />
    </div>
  );
}

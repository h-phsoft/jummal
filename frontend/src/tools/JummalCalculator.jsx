// =====================================================
// حساب الجمّل والحساب الثلاثي: نص ← الجمل والأبجد والأيقغ + السجل + إحصاءات الأحرف
// يُستخدم وحده وداخل المنصة الموحدة (onResult)
// =====================================================
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BookOpen, Download, Trash2, X} from 'lucide-react';
import {calculateTriple, cleanArabicText} from '@jummal/core';
import {useStoredList} from '../hooks/useStoredList.js';
import NumberValue from './components/NumberValue.jsx';
import TextStats from './components/TextStats.jsx';
import AyatPicker from './components/AyatPicker.jsx';
import {copyToClipboard, exportCsv} from './exportCsv.js';

const HISTORY_KEY = 'gematria_history_triple_v2';

export default function JummalCalculator({onResult, showTitle = true}) {
  const {t} = useTranslation();
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef(null);
  const history = useStoredList(HISTORY_KEY);

  const calculate = () => {
    if (!input.trim()) {
      setError(t('err_enter_text'));
      setResult(null);
      return;
    }
    const clean = cleanArabicText(input);
    if (!clean) {
      setError(t('err_no_letters'));
      setResult(null);
      return;
    }
    const values = calculateTriple(clean);
    setError('');
    setResult({text: clean, values: values});
    copyToClipboard(values.jummal);
    history.add({text: clean, ...values}, (a, b) => a.text === b.text && a.jummal === b.jummal);
    if (onResult) {
      onResult({text: clean, values: values});
    }
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      calculate();
    }
    if (e.key === 'F9') {
      e.preventDefault();
      setPickerOpen(true);
    }
  };

  const exportHistory = () => {
    exportCsv('jummal-history.csv',
      [t('col_text'), t('jummal'), t('abjad'), t('ayqagh'), t('triple')],
      history.items.map(h => [h.text, h.jummal, h.abjadi, h.iqghy, h.triple]));
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        {showTitle && (
          <>
            <h2 className="tool-title">{t('tool_jummal')}</h2>
            <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('tool_jummal_desc')}</p>
          </>
        )}
        <textarea
          ref={inputRef}
          className="tool-textarea"
          placeholder={t('enter_text_f9')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '0.75rem'}}>
          <button type="button" className="btn btn-primary" onClick={calculate}>{t('calculate')}</button>
          <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}>
            <BookOpen size={16} style={{marginInlineEnd: 6}} /> {t('choose_ayah')}
          </button>
        </div>
        {error && <div className="result-banner error">{error}</div>}
        {result && (
          <div className="result-banner">
            {t('jummal')}: <NumberValue value={result.values.jummal} />
          </div>
        )}
      </div>

      {result && <TextStats text={result.text} />}

      <div className="tool-card">
        <div className="tool-row" style={{justifyContent: 'space-between', marginBottom: '0.75rem'}}>
          <h3 className="tool-section-title" style={{margin: 0}}>{t('history')}</h3>
          <div className="tool-row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportHistory} disabled={history.items.length === 0}>
              <Download size={14} style={{marginInlineEnd: 4}} /> {t('export_table')}
            </button>
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
        </div>
        <div className="table-wrap" style={{maxHeight: 420}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('col_text')}</th>
                <th>{t('jummal')}</th>
                <th>{t('abjad')}</th>
                <th>{t('ayqagh')}</th>
                <th>{t('triple')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.items.length === 0 && (
                <tr><td colSpan={6} className="empty-state">{t('no_history')}</td></tr>
              )}
              {history.items.map((item, index) => (
                <tr
                  key={`${item.text}-${index}`}
                  className="clickable"
                  title={t('click_to_restore')}
                  onClick={(e) => {
                    if (!e.target.closest('.num, button')) {
                      setInput(item.text);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }
                  }}
                >
                  <td className="text-cell">{item.text}</td>
                  <td><NumberValue value={item.jummal} /></td>
                  <td><NumberValue value={item.abjadi} /></td>
                  <td><NumberValue value={item.iqghy} /></td>
                  <td><NumberValue value={item.triple} /></td>
                  <td>
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

      <AyatPicker
        open={pickerOpen}
        initialQuery={input}
        onClose={() => setPickerOpen(false)}
        onSelect={(text) => setInput(text)}
      />
    </div>
  );
}

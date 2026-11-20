// =====================================================
// البحث عن رقم في كلمات القرآن (الجمل / الأبجد / الأيقغ)
// =====================================================
import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {findWordsByValue} from '@jummal/core';
import {loadWords} from '../services/data.js';
import WordSearchTable from './components/WordSearchTable.jsx';

export default function NumberSearch() {
  const {t} = useTranslation();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('n') || '');
  const [types, setTypes] = useState({jummal: true, abjad: false, ayqagh: false});
  const [found, setFound] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const value = parseInt(input, 10);
    if (isNaN(value)) {
      window.alert(t('err_number'));
      return;
    }
    if (!types.jummal && !types.abjad && !types.ayqagh) {
      window.alert(t('err_select_type'));
      return;
    }
    setLoading(true);
    const words = await loadWords();
    setFound(findWordsByValue(words, value, types));
    setLoading(false);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('tool_number_search')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('tool_number_search_desc')}</p>
        <div className="tool-row" style={{justifyContent: 'center'}}>
          <input
            type="number"
            className="tool-input number"
            placeholder={t('enter_number')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            autoFocus
          />
          <button type="button" className="btn btn-primary" onClick={search} disabled={loading}>
            {loading ? t('loading') : t('search_button')}
          </button>
        </div>
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '0.75rem', gap: '1.25rem'}}>
          {['jummal', 'abjad', 'ayqagh'].map(key => (
            <label key={key} className="tool-row" style={{gap: 6}}>
              <input type="checkbox" checked={types[key]} onChange={() => setTypes(prev => ({...prev, [key]: !prev[key]}))} />
              {t(key)}
            </label>
          ))}
        </div>
      </div>
      <div className="tool-card">
        <WordSearchTable found={found} types={types} />
      </div>
    </div>
  );
}

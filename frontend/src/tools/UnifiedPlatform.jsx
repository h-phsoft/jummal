// =====================================================
// المنصة الموحدة: حساب الجمّل + الوفق المثلث للقيمة + البحث عن القيمة في الكلمات
// =====================================================
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {findWordsByValue, generateTriangleWefeq, triangleFraction, WEFEQ_MAGIC_CONSTANTS} from '@jummal/core';
import {loadWords} from '../services/data.js';
import JummalCalculator from './JummalCalculator.jsx';
import WefqView from './components/WefqView.jsx';
import WordSearchTable from './components/WordSearchTable.jsx';

// الحد الأدنى للمثلث من النواة (15) مثل صفحة عالم الأوفاق
const TRIANGLE_MIN = WEFEQ_MAGIC_CONSTANTS.triangle;
const SEARCH_TYPES = ['jummal', 'abjad', 'ayqagh'];

export default function UnifiedPlatform() {
  const {t} = useTranslation();
  const [target, setTarget] = useState('');
  const [wefq, setWefq] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [searchType, setSearchType] = useState('jummal');
  const [searchValue, setSearchValue] = useState(null);
  const [found, setFound] = useState(null);

  // البحث يُعاد عند تغيير القيمة أو نوع البحث
  useEffect(() => {
    if (searchValue === null) {
      return;
    }
    let cancelled = false;
    loadWords().then(words => {
      if (!cancelled) {
        setFound(findWordsByValue(words, searchValue, {[searchType]: true}));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [searchValue, searchType]);

  const onResult = ({values}) => {
    setTarget(String(values.jummal));
    setWefq(null);
    setShowGuide(false);
    setSearchValue(values.jummal);
  };

  const generate = () => {
    const n = parseInt(target, 10);
    if (isNaN(n)) {
      window.alert(t('err_number'));
      return;
    }
    if (n < TRIANGLE_MIN) {
      window.alert(t('err_min_triangle', {min: TRIANGLE_MIN}));
      return;
    }
    setWefq(generateTriangleWefeq(n));
  };

  const targetNumber = parseInt(target, 10);
  const fraction = !isNaN(targetNumber) && targetNumber >= TRIANGLE_MIN ? triangleFraction(targetNumber) : null;

  return (
    <div className="tool-page">
      <div>
        <h2 className="tool-title">{t('tool_unified')}</h2>
        <p className="tool-subtitle">{t('tool_unified_desc')}</p>
      </div>

      <JummalCalculator onResult={onResult} showTitle={false} />

      <div className="tool-grid-2">
        <div className="tool-card">
          <h3 className="tool-section-title">{t('shape_triangle')}</h3>
          <div className="tool-row">
            <input
              type="number"
              className="tool-input number"
              placeholder={t('enter_number')}
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setWefq(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
            {fraction !== null && (
              <span
                className="fraction-dot"
                title={fraction === 0 ? t('no_fraction') : t('has_fraction', {fraction: fraction})}
                style={{background: fraction === 0 ? '#16a34a' : '#dc2626'}}
              />
            )}
            <button type="button" className="btn btn-primary" onClick={generate}>{t('generate_wefq')}</button>
          </div>
          {wefq && (
            <>
              <WefqView result={wefq} shape="triangle" showInfo={showGuide} />
              <div style={{textAlign: 'center'}}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowGuide(v => !v)}>
                  {showGuide ? t('hide_guide') : t('show_guide')}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tool-card">
          <h3 className="tool-section-title">{t('word_search')}</h3>
          <div className="tool-row" style={{gap: '1.25rem', marginBottom: '0.75rem'}}>
            {SEARCH_TYPES.map(key => (
              <label key={key} className="tool-row" style={{gap: 6}}>
                <input type="radio" name="unified-search-type" checked={searchType === key} onChange={() => setSearchType(key)} />
                {t(key)}
              </label>
            ))}
          </div>
          <WordSearchTable found={found} types={{[searchType]: true}} maxHeight="45vh" />
        </div>
      </div>
    </div>
  );
}

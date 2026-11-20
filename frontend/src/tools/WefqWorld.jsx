// =====================================================
// عالم الأوفاق: دراسة الرقم في 7 أشكال وتعمير الوفق المختار
// =====================================================
import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {generateWefeq, studyWefeqNumber, WEFEQ_MAGIC_CONSTANTS} from '@jummal/core';
import WefqView from './components/WefqView.jsx';

const SHAPES = Object.keys(WEFEQ_MAGIC_CONSTANTS);

export default function WefqWorld() {
  const {t} = useTranslation();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('n') || '');
  const [studied, setStudied] = useState(null);
  const [shape, setShape] = useState(null);

  const execute = () => {
    const n = parseInt(input, 10);
    if (isNaN(n) || n < 1) {
      window.alert(t('err_positive_number'));
      return;
    }
    setStudied(n);
    setShape(null);
  };

  const chooseShape = (s) => {
    if (studied === null) {
      window.alert(t('err_execute_first'));
      return;
    }
    const study = studyWefeqNumber(studied, s);
    if (!study.possible) {
      window.alert(study.message);
      return;
    }
    setShape(s);
  };

  const buttonClass = (s) => {
    if (studied === null) {
      return '';
    }
    const study = studyWefeqNumber(studied, s);
    const state = !study.possible ? 'danger' : (study.needsFractionFix ? 'warning' : 'success');
    return `${state} ${shape === s ? 'active' : ''}`;
  };

  const result = shape && studied !== null ? generateWefeq(studied, shape) : null;

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('tool_wefq')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('tool_wefq_desc')}</p>
        <div className="tool-row" style={{justifyContent: 'center'}}>
          <input
            type="number"
            min="1"
            className="tool-input number"
            placeholder={t('enter_number')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && execute()}
            autoFocus
          />
          <button type="button" className="btn btn-primary" onClick={execute}>{t('execute')}</button>
        </div>
        <div className="shape-buttons" style={{marginTop: '1rem'}}>
          {SHAPES.map(s => (
            <button key={s} type="button" className={`shape-btn ${buttonClass(s)}`} onClick={() => chooseShape(s)}>
              {t(`shape_${s}`)}
            </button>
          ))}
        </div>
        {studied !== null && (
          <p className="tool-hint" style={{textAlign: 'center', marginTop: '0.75rem'}}>{t('wefq_legend')}</p>
        )}
      </div>

      {result && (
        <div className="tool-card">
          <h3 className="tool-section-title" style={{textAlign: 'center'}}>
            {t('wefq_result_title', {shape: t(`shape_${shape}`), number: studied})}
          </h3>
          <WefqView result={result} shape={shape} />
        </div>
      )}
    </div>
  );
}

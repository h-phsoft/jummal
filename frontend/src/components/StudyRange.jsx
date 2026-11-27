// =====================================================
// دراسة مقطع: من (سورة، آية، كلمة، حرف) إلى (سورة، آية، كلمة، حرف)
// إحصاءات شاملة للكلمات والحروف، مع اختيار جداول الحساب
// =====================================================
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApiData} from '../hooks/useApiData.js';
import {apiGet} from '../services/api.js';
import LoadingState from './stats/LoadingState.jsx';
import RangeSelector from './range/RangeSelector.jsx';
import {DEFAULT_RANGE, pointParam} from './range/rangePoints.js';
import RangeStatsView, {TablesChooser} from './range/RangeStatsView.jsx';

export default function StudyRange() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [tables, setTables] = useState(() => new Set([0, 1, 2]));
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const calculate = async () => {
    setBusy(true);
    const result = await apiGet(`/api/analysis/range?start=${pointParam(range.start)}&end=${pointParam(range.end)}`);
    setBusy(false);
    if (result.error) {
      setError(t(`range_err_${result.error}`));
      setStats(null);
      return;
    }
    setError('');
    setStats(result);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_study_range')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('study_range_desc')}</p>
        <RangeSelector swar={swar.data} value={range} onChange={setRange} />
        <div style={{marginTop: '1rem'}}>
          <TablesChooser selected={tables} onChange={setTables} />
        </div>
        <div className="tool-row" style={{justifyContent: 'center', marginTop: '1rem'}}>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={calculate}>
            {busy ? t('loading') : t('calculate')}
          </button>
        </div>
        {error && <div className="result-banner error">{error}</div>}
      </div>

      {stats && <RangeStatsView stats={stats} tables={tables} csvName="range" />}
    </div>
  );
}

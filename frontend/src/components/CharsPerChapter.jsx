// =====================================================
// حساب الحروف في السور: جدول السور × الحروف الـ 28 مع المجموع
// =====================================================
import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download} from 'lucide-react';
import {useApiData} from '../hooks/useApiData.js';
import {exportCsv} from '../tools/exportCsv.js';
import LoadingState from './stats/LoadingState.jsx';

export default function CharsPerChapter() {
  const {t} = useTranslation();
  const {data, loading, error} = useApiData('/api/stats/chapters');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({key: 'CpNo', dir: 1});

  const rows = useMemo(() => {
    if (!data) {
      return [];
    }
    const q = filter.trim();
    const value = (r, key) => (typeof key === 'number' ? r.letters[key] : r[key]);
    return data.rows
      .filter(r => !q || r.CpName.includes(q) || String(r.CpNo) === q)
      .slice()
      .sort((a, b) => (value(a, sort.key) > value(b, sort.key) ? 1 : -1) * sort.dir);
  }, [data, filter, sort]);

  if (loading || error) {
    return <LoadingState error={error} />;
  }

  const sortBy = (key) => {
    setSort(prev => ({key: key, dir: prev.key === key ? -prev.dir : 1}));
  };
  const arrow = (key) => (sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : '');

  const exportTable = () => {
    exportCsv('letters-per-surah.csv',
      [t('col_surah_no'), t('col_surah'), ...data.letters, t('total')],
      data.rows.map(r => [r.CpNo, r.CpName, ...r.letters, r.Cs]));
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <div className="tool-row" style={{justifyContent: 'space-between'}}>
          <div>
            <h2 className="tool-title">{t('menu_stats_chars_per_chapter')}</h2>
            <p className="tool-subtitle">{t('chars_per_chapter_desc')}</p>
          </div>
          <div className="tool-row">
            <input className="tool-input" placeholder={t('search_surah')} value={filter} onChange={(e) => setFilter(e.target.value)} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportTable}>
              <Download size={14} style={{marginInlineEnd: 4}} /> {t('export_table')}
            </button>
          </div>
        </div>
      </div>

      <div className="tool-card">
        <div className="table-wrap" style={{maxHeight: '75vh'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="clickable" onClick={() => sortBy('CpNo')}>#{arrow('CpNo')}</th>
                <th className="clickable" onClick={() => sortBy('CpName')}>{t('col_surah')}{arrow('CpName')}</th>
                {data.letters.map((letter, i) => (
                  <th key={letter} className="clickable" style={{fontSize: '1.1rem'}} onClick={() => sortBy(i)}>{letter}{arrow(i)}</th>
                ))}
                <th className="clickable" onClick={() => sortBy('Cs')}>{t('total')}{arrow('Cs')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.CpNo}>
                  <td>{r.CpNo}</td>
                  <td><strong>{r.CpName}</strong></td>
                  {r.letters.map((c, i) => (
                    <td key={i} style={{color: c === 0 ? 'var(--text-tertiary)' : undefined}}>{c.toLocaleString('en-US')}</td>
                  ))}
                  <td><strong>{r.Cs.toLocaleString('en-US')}</strong></td>
                </tr>
              ))}
              <tr style={{fontWeight: 700, background: 'var(--bg-tertiary)'}}>
                <td></td>
                <td>{t('total')}</td>
                {data.totals.letters.map((c, i) => <td key={i}>{c.toLocaleString('en-US')}</td>)}
                <td>{data.totals.Cs.toLocaleString('en-US')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

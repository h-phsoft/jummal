// =====================================================
// حساب الحروف: تكرار كل حرف من الحروف الـ 28 وبدايات ونهايات السور والآيات
// =====================================================
import {useTranslation} from 'react-i18next';
import {Download} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useApiData} from '../hooks/useApiData.js';
import {exportCsv} from '../tools/exportCsv.js';
import LoadingState from './stats/LoadingState.jsx';
import NumberValue from '../tools/components/NumberValue.jsx';

const COLUMNS = ['Count', 'versesWith', 'versesWithout', 'chaptersWith', 'FCs', 'LCs', 'FLCs', 'FVs', 'LVs', 'FLVs'];

export default function LetterStats() {
  const {t} = useTranslation();
  const {data, loading, error} = useApiData('/api/stats/letters');

  if (loading || error) {
    return <LoadingState error={error} />;
  }

  const exportTable = () => {
    exportCsv('letters.csv', [t('col_letter'), ...COLUMNS.map(c => t(`st_${c}`))], data.rows.map(r => [r.Char, ...COLUMNS.map(c => r[c])]));
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <div className="tool-row" style={{justifyContent: 'space-between'}}>
          <div>
            <h2 className="tool-title">{t('menu_stats_chars')}</h2>
            <p className="tool-subtitle">{t('stats_chars_desc')}</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportTable}>
            <Download size={14} style={{marginInlineEnd: 4}} /> CSV
          </button>
        </div>
      </div>

      <div className="tool-card">
        <div style={{height: 320, direction: 'ltr'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rows} margin={{top: 10, right: 20, left: 0, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
              <XAxis dataKey="Char" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 14}} interval={0} />
              <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <Tooltip
                cursor={{fill: 'var(--bg-secondary)'}}
                contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
                formatter={(value) => [Number(value).toLocaleString('en-US'), t('st_Count')]}
              />
              <Bar isAnimationActive={false} dataKey="Count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tool-card">
        <div className="table-wrap" style={{maxHeight: '70vh'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('col_letter')}</th>
                {COLUMNS.map(c => <th key={c} title={t(`st_${c}_hint`, '')}>{t(`st_${c}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.rows.map(r => (
                <tr key={r.Char}>
                  <td>{r.ChNo}</td>
                  <td style={{fontSize: '1.2rem', fontWeight: 700}}>{r.Char}</td>
                  {COLUMNS.map(c => <td key={c}><NumberValue value={r[c]} /></td>)}
                </tr>
              ))}
              <tr style={{fontWeight: 700, background: 'var(--bg-tertiary)'}}>
                <td></td>
                <td>{t('total')}</td>
                {COLUMNS.map(c => <td key={c}>{data.totals[c] !== undefined ? Number(data.totals[c]).toLocaleString('en-US') : ''}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

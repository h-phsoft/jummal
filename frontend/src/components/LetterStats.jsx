// =====================================================
// حساب الحروف: تكرار كل حرف من الحروف الـ 28 وبدايات ونهايات السور والآيات،
// مع تمييز الشمسية/القمرية والنورانية والطبيعة (من جدول الحروف في البيانات)
// =====================================================
import {useTranslation} from 'react-i18next';
import {Download} from 'lucide-react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useApiData} from '../hooks/useApiData.js';
import {exportCsv} from '../tools/exportCsv.js';
import LoadingState from './stats/LoadingState.jsx';
import {InfoGrid} from './stats/StudyDetails.jsx';
import {LetterBadges, LettersLegend} from './stats/LetterClass.jsx';
import {NATURE_KEYS, letterClassName} from './stats/letterClass.js';
import NumberValue from '../tools/components/NumberValue.jsx';

const COLUMNS = ['Count', 'versesWith', 'versesWithout', 'chaptersWith', 'FCs', 'LCs', 'FLCs', 'FVs', 'LVs', 'FLVs'];
const SOLAR_COLOR = '#d97706';
const LUNAR_COLOR = '#0284c7';

export default function LetterStats() {
  const {t} = useTranslation();
  const {data, loading, error} = useApiData('/api/stats/letters');

  if (loading || error) {
    return <LoadingState error={error} />;
  }

  const yesNo = (v) => (v ? t('yes') : t('no'));
  const natureName = (n) => (NATURE_KEYS[n] ? t(`nature_${NATURE_KEYS[n].key}`) : '');
  const exportTable = () => {
    exportCsv('letters.csv',
      [t('col_letter'), t('col_letter_name'), t('letter_solar'), t('letter_nurani'), t('col_letter_nature'), ...COLUMNS.map(c => t(`st_${c}`))],
      data.rows.map(r => [r.Char, r.name, yesNo(r.solar), yesNo(r.nurani), natureName(r.nature), ...COLUMNS.map(c => r[c])]));
  };

  const g = data.groups;

  return (
    <div className="tool-page">
      <div className="tool-card">
        <div className="tool-row" style={{justifyContent: 'space-between'}}>
          <div>
            <h2 className="tool-title">{t('menu_stats_chars')}</h2>
            <p className="tool-subtitle">{t('stats_chars_desc')}</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportTable}>
            <Download size={14} style={{marginInlineEnd: 4}} /> {t('export_table')}
          </button>
        </div>
      </div>

      {g && (
        <div className="tool-card">
          <InfoGrid items={[
            {label: t('group_solar', {n: g.solar.letters}), value: g.solar.count, isNumber: true},
            {label: t('group_lunar', {n: g.lunar.letters}), value: g.lunar.count, isNumber: true},
            {label: t('group_nurani', {n: g.nurani.letters}), value: g.nurani.count, isNumber: true},
            {label: t('group_non_nurani', {n: g.nonNurani.letters}), value: g.nonNurani.count, isNumber: true},
            ...g.natures.map(n => ({
              label: `${NATURE_KEYS[n.nature].icon} ${t('group_nature', {nature: natureName(n.nature), n: n.letters})}`,
              value: n.count,
              isNumber: true
            }))
          ]} />
        </div>
      )}

      <div className="tool-card">
        <LettersLegend />
        <div style={{height: 320, direction: 'ltr', marginTop: '0.75rem'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rows} margin={{top: 10, right: 10, left: 0, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
              <XAxis dataKey="Char" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 14}} interval={0} />
              <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <Tooltip
                cursor={{fill: 'var(--bg-secondary)'}}
                contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
                formatter={(value) => [Number(value).toLocaleString('en-US'), t('st_Count')]}
              />
              <Bar isAnimationActive={false} dataKey="Count" radius={[4, 4, 0, 0]}>
                {data.rows.map(r => <Cell key={r.Char} fill={r.solar ? SOLAR_COLOR : LUNAR_COLOR} />)}
              </Bar>
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
                <th>{t('col_letter_name')}</th>
                <th>{t('col_letter_class')}</th>
                {COLUMNS.map(c => <th key={c}>{t(`st_${c}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.rows.map(r => (
                <tr key={r.Char}>
                  <td>{r.ChNo}</td>
                  <td style={{fontSize: '1.3rem', fontWeight: 700}}>
                    <span className={letterClassName(r)} style={{padding: '0 8px'}}>{r.Char}</span>
                  </td>
                  <td>{r.name}</td>
                  <td><LetterBadges info={r} /></td>
                  {COLUMNS.map(c => <td key={c}><NumberValue value={r[c]} /></td>)}
                </tr>
              ))}
              <tr style={{fontWeight: 700, background: 'var(--bg-tertiary)'}}>
                <td></td>
                <td>{t('total')}</td>
                <td></td>
                <td></td>
                {COLUMNS.map(c => <td key={c}>{data.totals[c] !== undefined ? Number(data.totals[c]).toLocaleString('en-US') : ''}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

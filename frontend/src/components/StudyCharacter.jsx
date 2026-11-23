// =====================================================
// دراسة حرف: إحصاءاته في القرآن وتوزيعه على السور
// =====================================================
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BASE_LETTERS} from '@jummal/core';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useApiData} from '../hooks/useApiData.js';
import LoadingState from './stats/LoadingState.jsx';
import NumberValue from '../tools/components/NumberValue.jsx';
import {LetterBadges, LettersLegend} from './stats/LetterClass.jsx';
import {letterClassName, letterInfoMap} from './stats/letterClass.js';

const FIELDS = ['Count', 'versesWith', 'versesWithout', 'chaptersWith', 'FCs', 'LCs', 'FLCs', 'FVs', 'LVs', 'FLVs'];

export default function StudyCharacter() {
  const {t} = useTranslation();
  const [letter, setLetter] = useState('');
  const {data, loading, error} = useApiData(letter ? `/api/analysis/letter?char=${encodeURIComponent(letter)}` : null);
  const lettersTable = useApiData('/api/letters');
  const infoMap = letterInfoMap(lettersTable.data);

  const top = data ? data.chapters.slice().sort((a, b) => b.count - a.count).slice(0, 10) : [];

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_study_char')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('study_char_desc')}</p>
        <div className="letters-grid">
          {BASE_LETTERS.map(l => (
            <button
              key={l}
              type="button"
              className={`shape-btn ${letterClassName(infoMap.get(l))} ${letter === l ? 'active' : ''}`}
              title={infoMap.get(l) ? infoMap.get(l).name : l}
              onClick={() => setLetter(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{marginTop: '0.75rem'}}>
          <LettersLegend />
        </div>
      </div>

      {letter && (loading || error) && <LoadingState error={error} />}

      {letter && data && !loading && (
        <>
          <div className="tool-card">
            <h3 className="tool-section-title" style={{textAlign: 'center', fontSize: '2rem'}}>
              <span className={letterClassName(data)} style={{padding: '0 10px'}}>{data.Char}</span>
              {data.name && <span style={{fontSize: '1.2rem', marginInlineStart: 8}}>({data.name})</span>}
            </h3>
            <div style={{marginBottom: '0.5rem'}}>
              <LetterBadges info={data} />
            </div>
            <p className="tool-hint" style={{textAlign: 'center', marginBottom: '1rem'}}>
              {t('letter_rank', {rank: data.ChNo})} · {t('letter_percent', {percent: (data.percent * 100).toFixed(2)})}
            </p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem'}}>
              {FIELDS.map(f => (
                <div key={f} className="stat-box" style={{background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.75rem'}}>
                  <div className="stat-value" style={{fontSize: '1.5rem'}}><NumberValue value={data[f]} /></div>
                  <div className="stat-label" style={{textTransform: 'none'}}>{t(`st_${f}`)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tool-card">
            <h3 className="tool-section-title">{t('letter_by_surah')}</h3>
            <div style={{height: 360, direction: 'ltr'}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chapters} margin={{top: 10, right: 20, left: 0, bottom: 40}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
                  <XAxis dataKey="CpName" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 10}} angle={-60} textAnchor="end" height={60} />
                  <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                  <Tooltip
                    cursor={{fill: 'var(--bg-secondary)'}}
                    contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
                    formatter={(value) => [Number(value).toLocaleString('en-US'), t('st_Count')]}
                  />
                  <Bar isAnimationActive={false} dataKey="count" fill="var(--accent-primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="tool-card">
            <h3 className="tool-section-title">{t('letter_top_surahs')}</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('col_surah')}</th>
                    <th>{t('st_Count')}</th>
                    <th>{t('letter_share')}</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map(c => (
                    <tr key={c.CpNo}>
                      <td>{c.CpNo}</td>
                      <td><strong>{c.CpName}</strong></td>
                      <td><NumberValue value={c.count} /></td>
                      <td>{(c.share * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

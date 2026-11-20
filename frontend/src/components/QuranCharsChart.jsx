// =====================================================
// حروف القرآن: عدد الحروف في كل سورة + توزيع الحروف الـ 28 مرتبة حسب التكرار
// =====================================================
import {useTranslation} from 'react-i18next';
import {Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {useApiData} from '../hooks/useApiData.js';
import LoadingState from './stats/LoadingState.jsx';
import LineByChapter from './stats/LineByChapter.jsx';

export default function QuranCharsChart() {
  const {t} = useTranslation();
  const chapters = useApiData('/api/stats/chapters');
  const letters = useApiData('/api/stats/letters');

  if (chapters.loading || chapters.error || letters.loading || letters.error) {
    return <LoadingState error={chapters.error || letters.error} />;
  }

  const total = letters.data.totals.Count;
  const distribution = letters.data.rows
    .map(r => ({name: r.Char, value: r.Count, percent: (r.Count / total) * 100}))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_stats_quran_chars')}</h2>
        <p className="tool-subtitle">{t('quran_chars_desc', {total: total.toLocaleString('en-US')})}</p>
      </div>
      <div className="tool-card">
        <h3 className="tool-section-title">{t('letters_per_surah')}</h3>
        <LineByChapter data={chapters.data.rows} dataKey="Cs" label={t('st_letters')} />
      </div>
      <div className="tool-card">
        <h3 className="tool-section-title">{t('letters_distribution')}</h3>
        <div style={{height: 380, direction: 'ltr'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{top: 24, right: 20, left: 0, bottom: 10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 15}} interval={0} />
              <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <Tooltip
                cursor={{fill: 'var(--bg-secondary)'}}
                contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
                formatter={(value, name, item) => [`${Number(value).toLocaleString('en-US')} (${item.payload.percent.toFixed(2)}%)`, t('st_Count')]}
              />
              <Bar isAnimationActive={false} dataKey="value" fill="var(--gold-accent)" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="percent"
                  position="top"
                  formatter={(v) => `${Number(v).toFixed(1)}%`}
                  style={{fill: 'var(--text-secondary)', fontSize: 10}}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

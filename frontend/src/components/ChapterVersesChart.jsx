// =====================================================
// آيات سور القرآن: عدد الآيات والكلمات في كل سورة
// =====================================================
import {useTranslation} from 'react-i18next';
import {useApiData} from '../hooks/useApiData.js';
import LoadingState from './stats/LoadingState.jsx';
import LineByChapter from './stats/LineByChapter.jsx';

export default function ChapterVersesChart() {
  const {t} = useTranslation();
  const {data, loading, error} = useApiData('/api/stats/chapters');

  if (loading || error) {
    return <LoadingState error={error} />;
  }

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_stats_chapter_verses')}</h2>
        <p className="tool-subtitle">
          {t('chapter_verses_desc', {verses: data.totals.Vs.toLocaleString('en-US'), words: data.totals.Ws.toLocaleString('en-US')})}
        </p>
      </div>
      <div className="tool-card">
        <h3 className="tool-section-title">{t('verses_per_surah')}</h3>
        <LineByChapter data={data.rows} dataKey="Vs" label={t('st_verses')} />
      </div>
      <div className="tool-card">
        <h3 className="tool-section-title">{t('words_per_surah')}</h3>
        <LineByChapter data={data.rows} dataKey="Ws" label={t('st_words')} color="var(--gold-accent)" />
      </div>
    </div>
  );
}

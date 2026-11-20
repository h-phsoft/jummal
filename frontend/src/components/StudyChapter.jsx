// =====================================================
// دراسة سورة: رقمها وترتيب تنزيلها ونوعها، الحرف الأول والأخير،
// الآيات والكلمات والحروف، الحروف المستخدمة وغير المستخدمة
// =====================================================
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApiData} from '../hooks/useApiData.js';
import {apiGet} from '../services/api.js';
import LoadingState from './stats/LoadingState.jsx';
import {InfoGrid, LettersUsage} from './stats/StudyDetails.jsx';

export default function StudyChapter() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const [surahId, setSurahId] = useState('');
  const [result, setResult] = useState(null);

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const choose = async (value) => {
    setSurahId(value);
    setResult(value ? await apiGet(`/api/analysis/characters/surah/${value}`) : null);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_study_chapter')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('study_chapter_desc')}</p>
        <select className="tool-select" style={{width: '100%'}} value={surahId} onChange={(e) => choose(e.target.value)}>
          <option value="">{t('Please Select Chapter')}</option>
          {swar.data.map(s => <option key={s.swarId} value={s.swarId}>{s.swarId} - {s.swarName}</option>)}
        </select>
      </div>

      {result && (
        <div className="tool-card">
          <h3 className="tool-section-title" style={{textAlign: 'center', fontSize: '1.6rem'}}>{t('surah_title', {name: result.surahName})}</h3>
          <InfoGrid items={[
            {label: t('col_surah_no'), value: result.surahId, isNumber: true},
            {label: t('revelation_order'), value: result.revelationOrder, isNumber: true},
            {label: t('surah_type'), value: result.surahType},
            {label: t('first_letter'), value: result.firstLetter},
            {label: t('last_letter'), value: result.lastLetter},
            {label: t('st_verses'), value: result.totalAyahs, isNumber: true},
            {label: t('st_words'), value: result.words, isNumber: true},
            {label: t('st_letters'), value: result.letters, isNumber: true}
          ]} />
          <LettersUsage profile={result} />
        </div>
      )}
    </div>
  );
}

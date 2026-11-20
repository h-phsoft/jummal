// =====================================================
// دراسة آية: ملخص سورتها، ثم ترتيبها في السورة وفي القرآن، الحرف الأول والأخير،
// الكلمات والحروف، الحروف المستخدمة وغير المستخدمة
// =====================================================
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApiData} from '../hooks/useApiData.js';
import {apiGet} from '../services/api.js';
import LoadingState from './stats/LoadingState.jsx';
import {InfoGrid, LettersUsage} from './stats/StudyDetails.jsx';

export default function StudyVerse() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const [surahId, setSurahId] = useState('');
  const [ayahs, setAyahs] = useState([]);
  const [ayahId, setAyahId] = useState('');
  const [result, setResult] = useState(null);

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const chooseSurah = async (value) => {
    setSurahId(value);
    setAyahId('');
    setResult(null);
    setAyahs(value ? await apiGet(`/api/ayat?surah=${value}`) : []);
  };

  const chooseAyah = async (value) => {
    setAyahId(value);
    setResult(value ? await apiGet(`/api/analysis/characters/ayah/${value}`) : null);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_study_verse')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('study_verse_desc')}</p>
        <div className="tool-row">
          <select className="tool-select" style={{flex: 1, minWidth: 200}} value={surahId} onChange={(e) => chooseSurah(e.target.value)}>
            <option value="">{t('Please Select Chapter')}</option>
            {swar.data.map(s => <option key={s.swarId} value={s.swarId}>{s.swarId} - {s.swarName}</option>)}
          </select>
          <select
            className="tool-select"
            style={{minWidth: 160}}
            value={ayahId}
            disabled={ayahs.length === 0}
            onChange={(e) => chooseAyah(e.target.value)}
          >
            <option value="">{t('Please Select Verse')}</option>
            {ayahs.map(a => <option key={a.ayatId} value={a.ayatId}>{a.ayatNum}</option>)}
          </select>
        </div>
      </div>

      {result && (
        <>
          <div className="tool-card">
            <h3 className="tool-section-title">{t('surah_title', {name: result.surah.surahName})}</h3>
            <InfoGrid items={[
              {label: t('col_surah_no'), value: result.surah.surahId, isNumber: true},
              {label: t('revelation_order'), value: result.surah.revelationOrder, isNumber: true},
              {label: t('surah_type'), value: result.surah.surahType},
              {label: t('first_letter'), value: result.surah.firstLetter},
              {label: t('last_letter'), value: result.surah.lastLetter},
              {label: t('st_verses'), value: result.surah.totalAyahs, isNumber: true},
              {label: t('st_letters'), value: result.surah.letters, isNumber: true}
            ]} />
          </div>

          <div className="tool-card">
            <p style={{fontSize: '1.5rem', lineHeight: 2.2, textAlign: 'center', marginBottom: '0.5rem'}}>{result.textN}</p>
            <p className="tool-hint" style={{textAlign: 'center', marginBottom: '1rem'}}>{result.text28}</p>
            <InfoGrid items={[
              {label: t('ayah_in_surah'), value: result.ayahNum, isNumber: true},
              {label: t('ayah_in_quran'), value: result.quranOrder, isNumber: true},
              {label: t('first_letter'), value: result.firstLetter},
              {label: t('last_letter'), value: result.lastLetter},
              {label: t('st_words'), value: result.words, isNumber: true},
              {label: t('st_letters'), value: result.letters, isNumber: true}
            ]} />
            <LettersUsage profile={result} />
          </div>
        </>
      )}
    </div>
  );
}

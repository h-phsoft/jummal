// =====================================================
// تطابق الآيات: آيات السورة على محورين يبدآن من آية المحور
// (مثل تطابق السور: كل آية مع نظيرتها، ومجموع الكلمات والحروف لكل زوج)
// =====================================================
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useApiData} from '../hooks/useApiData.js';
import {apiGet} from '../services/api.js';
import LoadingState from './stats/LoadingState.jsx';
import NumberValue from '../tools/components/NumberValue.jsx';

export default function SymmetricVerses() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const [surahId, setSurahId] = useState('');
  const [startAyah, setStartAyah] = useState('1');
  const [result, setResult] = useState(null);

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const surah = swar.data.find(s => s.swarId === parseInt(surahId, 10));

  const execute = async () => {
    if (!surah) {
      return;
    }
    setResult(await apiGet(`/api/analysis/symmetric-verses/${surah.swarId}/${startAyah}`));
  };

  // صف لآية وحدها (المحور أو المقابلة له) يمتد عبر الجدول
  const singleRow = (verse, label) => (
    <tr style={{background: 'var(--bg-tertiary)'}}>
      <td colSpan={8} title={verse.text}>
        <strong>{label}: {t('col_ayah')} {verse.num}</strong> · {verse.words} {t('st_words')} · {verse.letters} {t('st_letters')}
      </td>
    </tr>
  );

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_symmetric_verses')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('symmetric_verses_desc')}</p>
        <div className="tool-row">
          <select
            className="tool-select"
            style={{flex: 1, minWidth: 200}}
            value={surahId}
            onChange={(e) => {
              setSurahId(e.target.value);
              setStartAyah('1');
              setResult(null);
            }}
          >
            <option value="">{t('Please Select Chapter', 'اختر السورة')}</option>
            {swar.data.map(s => <option key={s.swarId} value={s.swarId}>{s.swarId} - {s.swarName} ({s.swarAyat})</option>)}
          </select>
          <select
            className="tool-select"
            style={{minWidth: 160}}
            value={startAyah}
            disabled={!surah}
            onChange={(e) => {
              setStartAyah(e.target.value);
              setResult(null);
            }}
          >
            {surah && Array.from({length: surah.swarAyat}, (_, i) => (
              <option key={i + 1} value={i + 1}>{t('axis_ayah', {n: i + 1})}</option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" disabled={!surah} onClick={execute}>{t('execute')}</button>
        </div>
      </div>

      {result && (
        <div className="tool-card">
          <h3 className="tool-section-title" style={{textAlign: 'center'}}>
            {t('symmetric_verses_title', {surah: result.surahName, ayah: result.startAyah, total: result.totalAyahs})}
          </h3>
          <div className="table-wrap" style={{maxHeight: '70vh'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('right_axis')}</th>
                  <th>{t('st_words')}</th>
                  <th>{t('st_letters')}</th>
                  <th>{t('pair_words')}</th>
                  <th>{t('pair_letters')}</th>
                  <th>{t('st_letters')}</th>
                  <th>{t('st_words')}</th>
                  <th>{t('left_axis')}</th>
                </tr>
              </thead>
              <tbody>
                {singleRow(result.axis, t('axis_verse'))}
                {result.pairs.map(({right, left}) => (
                  <tr key={right.num}>
                    <td title={right.text}><strong>{right.num}</strong></td>
                    <td>{right.words}</td>
                    <td>{right.letters}</td>
                    <td className="cell-match"><NumberValue value={right.words + left.words} /></td>
                    <td className="cell-match"><NumberValue value={right.letters + left.letters} /></td>
                    <td>{left.letters}</td>
                    <td>{left.words}</td>
                    <td title={left.text}><strong>{left.num}</strong></td>
                  </tr>
                ))}
                {result.opposite && singleRow(result.opposite, t('opposite_verse'))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

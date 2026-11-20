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

  const pairs = result ? result.rightArray.map((right, i) => ({right: right, left: result.leftArray[i] || null})) : [];

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
                {pairs.map(({right, left}) => (
                  <tr key={right.num}>
                    <td title={right.text}><strong>{right.num}</strong></td>
                    <td>{right.words}</td>
                    <td>{right.letters}</td>
                    <td className="cell-match"><NumberValue value={right.words + (left ? left.words : 0)} /></td>
                    <td className="cell-match"><NumberValue value={right.letters + (left ? left.letters : 0)} /></td>
                    <td>{left ? left.letters : ''}</td>
                    <td>{left ? left.words : ''}</td>
                    <td title={left ? left.text : ''}><strong>{left ? left.num : '—'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

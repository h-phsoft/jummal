// =====================================================
// اختيار مقطع من القرآن: نقطة بداية ونقطة نهاية،
// كل نقطة = سورة + آية + كلمة + حرف (الحرف اختياري: 0 = الكلمة كاملة)
// =====================================================
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {splitWords} from '@jummal/core';
import {apiGet} from '../../services/api.js';

function PointPicker({label, swar, value, isEnd, onChange}) {
  const {t} = useTranslation();
  const [ayahs, setAyahs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    apiGet(`/api/ayat?surah=${value.surah}`).then(list => {
      if (!cancelled) {
        setAyahs(list);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value.surah]);

  const ayah = ayahs.find(a => a.ayatNum === value.ayah);
  const words = ayah ? splitWords(ayah.ayat28Text) : [];
  // كلمة النهاية الافتراضية: آخر كلمة في الآية
  const wordNum = value.word || (isEnd ? words.length : 1);
  const word = words[wordNum - 1] || '';

  const chooseSurah = (surah) => {
    const s = swar.find(x => x.swarId === surah);
    onChange({surah: surah, ayah: isEnd && s ? s.swarAyat : 1, word: isEnd ? 0 : 1, char: 0});
  };

  return (
    <fieldset className="range-point">
      <legend>{label}</legend>
      <div className="tool-row">
        <select
          className="tool-select"
          style={{flex: 2, minWidth: 150}}
          aria-label={t('col_surah')}
          value={value.surah}
          onChange={(e) => chooseSurah(parseInt(e.target.value, 10))}
        >
          {swar.map(s => <option key={s.swarId} value={s.swarId}>{s.swarId} - {s.swarName}</option>)}
        </select>
        <select
          className="tool-select"
          style={{flex: 1, minWidth: 90}}
          aria-label={t('range_ayah')}
          value={value.ayah}
          onChange={(e) => onChange({...value, ayah: parseInt(e.target.value, 10), word: isEnd ? 0 : 1, char: 0})}
        >
          {ayahs.map(a => <option key={a.ayatId} value={a.ayatNum}>{t('range_ayah')} {a.ayatNum}</option>)}
        </select>
      </div>
      <div className="tool-row" style={{marginTop: '0.5rem'}}>
        <select
          className="tool-select"
          style={{flex: 2, minWidth: 150}}
          aria-label={t('range_word')}
          value={wordNum}
          onChange={(e) => onChange({...value, word: parseInt(e.target.value, 10), char: 0})}
        >
          {words.map((w, i) => <option key={i} value={i + 1}>{i + 1} - {w}</option>)}
        </select>
        <select
          className="tool-select"
          style={{flex: 1, minWidth: 120}}
          aria-label={t('range_char')}
          value={value.char || 0}
          onChange={(e) => onChange({...value, word: wordNum, char: parseInt(e.target.value, 10)})}
        >
          <option value={0}>{t('range_whole_word')}</option>
          {[...word].map((c, i) => <option key={i} value={i + 1}>{i + 1} - {c}</option>)}
        </select>
      </div>
    </fieldset>
  );
}

// value: {start, end}
export default function RangeSelector({swar, value, onChange}) {
  const {t} = useTranslation();
  return (
    <div className="range-selector">
      <PointPicker
        label={t('range_from')}
        swar={swar}
        value={value.start}
        isEnd={false}
        onChange={(start) => onChange({...value, start: start})}
      />
      <PointPicker
        label={t('range_to')}
        swar={swar}
        value={value.end}
        isEnd={true}
        onChange={(end) => onChange({...value, end: end})}
      />
    </div>
  );
}

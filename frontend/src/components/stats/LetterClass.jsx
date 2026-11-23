// =====================================================
// تمييز الحروف حسب جدول الحروف في البيانات (data/letters-data.js):
// شمسي/قمري بلون الحرف، ونوراني بنقطة، والطبيعة بخط سفلي ملون، مع شارات ومفتاح للألوان
// =====================================================
import {useTranslation} from 'react-i18next';
import {NATURE_KEYS} from './letterClass.js';

// شارات الصنف: شمسي/قمري، نوراني/غير نوراني، والطبيعة
export function LetterBadges({info}) {
  const {t} = useTranslation();
  if (!info) {
    return null;
  }
  const nature = NATURE_KEYS[info.nature];
  return (
    <span className="tool-row" style={{gap: 4, justifyContent: 'center', flexWrap: 'wrap'}}>
      <span className={`badge ${info.solar ? 'badge-solar' : 'badge-lunar'}`}>{info.solar ? `☀ ${t('letter_solar')}` : `☾ ${t('letter_lunar')}`}</span>
      <span className={`badge ${info.nurani ? 'badge-nurani' : 'badge-plain'}`}>{info.nurani ? `✦ ${t('letter_nurani')}` : t('letter_non_nurani')}</span>
      {nature && <span className={`badge badge-nature-${nature.key}`}>{nature.icon} {t(`nature_${nature.key}`)}</span>}
    </span>
  );
}

// مفتاح الألوان
export function LettersLegend() {
  const {t} = useTranslation();
  return (
    <div className="letters-legend">
      <span><span className="letter-solar legend-char">ب</span> = {t('letter_solar')}</span>
      <span><span className="letter-lunar legend-char">ب</span> = {t('letter_lunar')}</span>
      <span><span className="letter-nurani legend-char">ب</span> = {t('letter_nurani')}</span>
      {Object.values(NATURE_KEYS).map(n => (
        <span key={n.key}><span className={`legend-char letter-nature-${n.key}`}>ب</span> = {n.icon} {t(`nature_${n.key}`)}</span>
      ))}
    </div>
  );
}

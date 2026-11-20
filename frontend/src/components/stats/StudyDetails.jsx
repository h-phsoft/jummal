// =====================================================
// تفاصيل دراسة سورة أو آية: بطاقات المعلومات + الحروف المستخدمة وغير المستخدمة
// =====================================================
import {useTranslation} from 'react-i18next';
import NumberValue from '../../tools/components/NumberValue.jsx';

// items: [{label, value, isNumber}]
export function InfoGrid({items}) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem'}}>
      {items.map(item => (
        <div key={item.label} className="stat-box" style={{background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.75rem'}}>
          <div className="stat-value" style={{fontSize: '1.4rem'}}>
            {item.isNumber ? <NumberValue value={item.value} /> : (item.value || '—')}
          </div>
          <div className="stat-label" style={{textTransform: 'none'}}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function LettersUsage({profile}) {
  const {t} = useTranslation();
  return (
    <div className="tool-grid-2" style={{marginTop: '1rem'}}>
      <div>
        <h4 className="tool-section-title">{t('used_letters')} ({profile.usedLetters.length})</h4>
        <div className="letter-counts" style={{justifyContent: 'flex-start'}}>
          {profile.usedLetters.map(x => (
            <div key={x.char} className="letter-chip">
              <div className="letter">{x.char}</div>
              <div className="count">{x.count.toLocaleString('en-US')}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="tool-section-title">{t('unused_letters')} ({profile.unusedLetters.length})</h4>
        {profile.unusedLetters.length === 0 ? (
          <p className="tool-hint">{t('all_letters_used')}</p>
        ) : (
          <div className="letter-counts" style={{justifyContent: 'flex-start'}}>
            {profile.unusedLetters.map(c => (
              <div key={c} className="letter-chip" style={{opacity: 0.7}}>
                <div className="letter">{c}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

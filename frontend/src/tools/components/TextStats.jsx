// =====================================================
// إحصاءات الأحرف: العدد الكلي، دون تكرار، الأحرف المستخدمة، تكرار كل حرف
// =====================================================
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {computeTextStats} from '@jummal/core';
import {useApiData} from '../../hooks/useApiData.js';
import {letterClassName, letterInfoMap} from '../../components/stats/letterClass.js';

export default function TextStats({text}) {
  const {t} = useTranslation();
  const stats = useMemo(() => computeTextStats(text || ''), [text]);
  const lettersTable = useApiData('/api/letters');
  const infoMap = letterInfoMap(lettersTable.data);

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="tool-card">
      <h3 className="tool-section-title">{t('text_stats')}</h3>
      <div className="stats-badges">
        <span className="badge primary">{t('stats_total')}: {stats.total.toLocaleString('en-US')}</span>
        <span className="badge success">{t('stats_unique')}: {stats.unique.toLocaleString('en-US')}</span>
      </div>
      <div className="letters-used">{stats.letters.join(' ')}</div>
      <div className="letters-grid">
        {stats.letters.map(letter => (
          <div key={letter} className="letter-chip">
            <div className={`letter ${letterClassName(infoMap.get(letter))}`}>{letter}</div>
            <div className="count">{stats.counts[letter]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

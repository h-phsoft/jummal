import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api.js';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function StudyChapter() {
  const { t } = useTranslation();
  const [swarList, setSwarList] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    apiGet('/api/swar')
      .then(data => {
        setSwarList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load swar", err);
        setLoading(false);
      });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedSurah) return;
    
    setAnalyzing(true);
    try {
      const data = await apiGet(`/api/analysis/characters/surah/${selectedSurah}`);
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} color="var(--accent-primary)" /></div>;

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('menu_study_chapter')}</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select 
          value={selectedSurah} 
          onChange={e => setSelectedSurah(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
            flex: 1
          }}
        >
          <option value="">{t('Please Select Chapter', 'Please Select Chapter')}</option>
          {swarList.map(surah => (
            <option key={surah.swarId} value={surah.swarId}>
              {surah.swarName} - {surah.swarId}
            </option>
          ))}
        </select>
        
        <button 
          onClick={handleAnalyze} 
          disabled={!selectedSurah || analyzing}
          className="btn btn-primary"
        >
          {analyzing ? <Loader2 className="animate-spin" size={20} /> : t('Execute', 'Execute')}
        </button>
      </div>

      {result && (
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
             <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="stat-label">Surah</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{result.surahName} ({result.surahId})</div>
             </div>
             <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="stat-label">Ayahs</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{result.totalAyahs}</div>
             </div>
             <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="stat-label">Words</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{result.totalWords}</div>
             </div>
             <div className="stat-box" style={{ textAlign: 'center' }}>
                <div className="stat-label">Characters</div>
                <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{result.totalChars}</div>
             </div>
          </div>

          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Character Frequency</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
            {result.charCounts.map(item => (
              <div key={item.char} style={{ 
                background: 'var(--glass-bg)', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{item.char}</span>
                <span style={{ fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

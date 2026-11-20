import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api.js';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function SymmetricChapters() {
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
      const data = await apiGet(`/api/analysis/symmetric-chapters/${selectedSurah}`);
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} color="var(--accent-primary)" /></div>;

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('menu_symmetric_chapters')}</h2>
      
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
          <option value="">{t('Please Select Start Axis', 'Please Select Start Axis')}</option>
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
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', textAlign: 'center', minWidth: '200px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{result.rightArray[0].id} - {result.rightArray[0].name}</div>
              <div style={{ fontSize: '1.5rem', marginTop: '0.5rem', fontWeight: 900 }}>{result.rightArray[0].ayahs} Ayahs</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 5fr', gap: '1rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
            <div style={{ background: 'var(--accent-tertiary)', color: 'white', padding: '0.75rem', borderRadius: '8px' }}>{t('Chapter and Verses', 'Chapter and Verses')} (Left Axis)</div>
            <div style={{ background: 'var(--gold-accent)', color: 'white', padding: '0.75rem', borderRadius: '8px' }}>{t('Total', 'Total')}</div>
            <div style={{ background: 'var(--accent-tertiary)', color: 'white', padding: '0.75rem', borderRadius: '8px' }}>{t('Chapter and Verses', 'Chapter and Verses')} (Right Axis)</div>
          </div>

          {result.leftArray.slice(0, -1).map((left, index) => {
            const right = result.rightArray[index + 1];
            return (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 2fr 1fr 4fr', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'right', border: '1px solid var(--border-light)' }}>{left.name} - {left.id}</div>
                <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{left.ayahs}</div>
                
                <div style={{ padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', border: '1px solid var(--gold-accent)', color: 'var(--gold-accent)' }}>
                  {left.ayahs + right.ayahs}
                </div>
                
                <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{right.ayahs}</div>
                <div style={{ padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: '6px', textAlign: 'left', border: '1px solid var(--border-light)' }}>{right.id} - {right.name}</div>
              </div>
            );
          })}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', textAlign: 'center', minWidth: '200px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>{result.leftArray[result.leftArray.length - 1].ayahs} Ayahs</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{result.leftArray[result.leftArray.length - 1].id} - {result.leftArray[result.leftArray.length - 1].name}</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

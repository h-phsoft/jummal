import React, { useState } from 'react';
import { apiGet } from '../services/api.js';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function SymmetricWords() {
  const { t } = useTranslation();
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const [withTashkil, setWithTashkil] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!word1 || !word2) return;
    
    setAnalyzing(true);
    try {
      const data = await apiGet(`/api/analysis/symmetric-words?word1=${encodeURIComponent(word1)}&word2=${encodeURIComponent(word2)}&tashkil=${withTashkil}`);
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('menu_symmetric_words', 'Symmetric 2 Words')}</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <input 
          type="text"
          value={word1} 
          onChange={e => setWord1(e.target.value)}
          placeholder={t('Word 1', 'Word 1')}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
            flex: '1 1 160px',
            minWidth: 0
          }}
        />
        
        <input 
          type="text"
          value={word2} 
          onChange={e => setWord2(e.target.value)}
          placeholder={t('Word 2', 'Word 2')}
          style={{ 
            padding: '0.75rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
            flex: '1 1 160px',
            minWidth: 0
          }}
        />
        
        <button 
          onClick={handleAnalyze} 
          disabled={!word1 || !word2 || analyzing}
          className="btn btn-primary"
        >
          {analyzing ? <Loader2 className="animate-spin" size={20} /> : t('Search', 'Search')}
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="tashkil-check" 
          checked={withTashkil} 
          onChange={e => setWithTashkil(e.target.checked)} 
        />
        <label htmlFor="tashkil-check" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
          {t('Search With Tashkil', 'Search With Tashkil')}
        </label>
      </div>

      {result && (
        <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: 'var(--accent-primary)', color: 'white' }}>
                <th style={{ padding: '0.75rem', borderRadius: '8px 0 0 0' }}>#</th>
                <th style={{ padding: '0.75rem' }}>{word1}</th>
                <th style={{ padding: '0.75rem' }}>{word2}</th>
                <th style={{ padding: '0.75rem' }}>{word1} & {word2}</th>
                <th style={{ padding: '0.75rem' }}>{t('Surah', 'Surah')}</th>
                <th style={{ padding: '0.75rem', borderRadius: '0 8px 0 0', textAlign: 'right' }}>{t('Ayah', 'Ayah')}</th>
              </tr>
            </thead>
            <tbody>
              {result.Data.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem' }}>{row.order}</td>
                  <td style={{ padding: '0.75rem', background: row.Count1 ? 'rgba(59, 130, 246, 0.2)' : 'transparent', fontWeight: row.Count1 ? 'bold' : 'normal' }}>{row.Count1}</td>
                  <td style={{ padding: '0.75rem', background: row.Count2 ? 'rgba(234, 179, 8, 0.2)' : 'transparent', fontWeight: row.Count2 ? 'bold' : 'normal' }}>{row.Count2}</td>
                  <td style={{ padding: '0.75rem', background: row.Count3 ? 'rgba(34, 197, 94, 0.2)' : 'transparent', fontWeight: row.Count3 ? 'bold' : 'normal' }}>{row.Count3}</td>
                  <td style={{ padding: '0.75rem' }}>{row.SNum} - {row.SName}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontSize: '1.1rem', fontFamily: 'Arial, sans-serif' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginRight: '10px' }}>{row.ANum}</span> - {row.AText}
                  </td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr style={{ background: 'var(--accent-secondary)', color: 'white', fontWeight: 'bold' }}>
                <td style={{ padding: '1rem', borderRadius: '0 0 0 8px' }}>{t('Total', 'Total')}</td>
                <td style={{ padding: '1rem' }}>{result.Counts[0]}</td>
                <td style={{ padding: '1rem' }}>{result.Counts[1]}</td>
                <td style={{ padding: '1rem' }}>{result.Counts[2]}</td>
                <td style={{ padding: '1rem' }}></td>
                <td style={{ padding: '1rem', borderRadius: '0 0 8px 0' }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

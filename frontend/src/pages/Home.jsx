import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Home() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="main-content" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      
      {/* Hero Section */}
      <section className="hero">
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          ✨ {t('offline_ready_badge')}
        </div>
        <h1>{t('welcome_title')}</h1>
        <p>{t('welcome_subtitle')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/workspace" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', textDecoration: 'none' }}>
            {t('start_analyzing')}
          </Link>
          <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            {t('view_models')}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>{t('features_title')}</h2>
        </div>
        
        <div className="feature-grid">
          <div className="glass-card">
            <div className="feature-icon">📊</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('feature_models')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('feature_models_desc')}</p>
          </div>
          
          <div className="glass-card">
            <div className="feature-icon">⚡</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('feature_perf')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('feature_perf_desc')}</p>
          </div>
          
          <div className="glass-card">
            <div className="feature-icon">🌐</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t('feature_api')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('feature_api_desc')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

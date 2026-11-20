import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import { Globe } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    // You could also toggle HTML dir for RTL support
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="app-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation Bar */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: 'var(--shadow-glow)' }}>
            PQ
          </div>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', textDecoration: 'none', color: 'var(--text-primary)' }}>
            PhsQuran
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleLanguage}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Globe size={16} />
            {i18n.language === 'en' ? 'عربي' : 'English'}
          </button>
          
          {location.pathname !== '/workspace' && (
            <Link to="/workspace" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>
              {t('open_workspace')}
            </Link>
          )}
        </div>
      </nav>

      {/* Main Routes */}
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace/*" element={<Workspace />} />
        </Routes>
      </div>
      
      {/* Footer */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-light)', marginTop: 'auto', background: 'var(--bg-secondary)' }}>
        <p>&copy; {new Date().getFullYear()} PhsQuran Platform. {t('All rights reserved', 'All rights reserved.')}</p>
      </footer>
    </div>
  );
}

export default App;

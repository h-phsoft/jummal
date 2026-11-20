import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import { Globe, Moon, Sun } from 'lucide-react';
import { currentTheme, setTheme } from './services/theme.js';

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // عنوان النافذة/التبويب باسم البرنامج حسب اللغة
  useEffect(() => {
    document.title = t('app_name');
  }, [t, i18n.language]);

  // النمط الفاتح/الداكن
  const [theme, setThemeState] = useState(currentTheme);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

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
          <img
            src={`${import.meta.env.BASE_URL}pwa-192x192.png`}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: '10px', boxShadow: 'var(--shadow-glow)' }}
          />
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
            {t('app_name')}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            aria-label={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Globe size={16} />
            {t('switch_language')}
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
        <p>&copy; {new Date().getFullYear()} {t('app_name')}. {t('All rights reserved', 'All rights reserved.')}</p>
      </footer>
    </div>
  );
}

export default App;

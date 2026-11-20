import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
// خطوط محلية (دون إنترنت): Tajawal للعربية، Inter و Outfit للاتينية
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import './index.css';
import './styles/tools.css';
import App from './App.jsx';
import './i18n';
import {registerOffline} from './services/offline.js';

// HashRouter ← الروابط تعمل في مجلد فرعي على الاستضافة وداخل برنامج exe دون إعداد خادم
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

registerOffline();

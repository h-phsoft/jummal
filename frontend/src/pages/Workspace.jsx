import React, { lazy, Suspense, useState } from 'react';
import { useApiData } from '../hooks/useApiData.js';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import { NARROW_QUERY, useMediaQuery } from '../hooks/useMediaQuery.js';
import SurahAnalytics from '../components/SurahAnalytics';
import SymmetricChapters from '../components/SymmetricChapters';
import StudyChapter from '../components/StudyChapter';
import StudyVerse from '../components/StudyVerse';
import SymmetricWords from '../components/SymmetricWords';
import JummalCalculator from '../tools/JummalCalculator';
import CustomTables from '../tools/CustomTables';
import WefqWorld from '../tools/WefqWorld';
import NumberSearch from '../tools/NumberSearch';
import NumberStudy from '../tools/NumberStudy';
import UnifiedPlatform from '../tools/UnifiedPlatform';
import SymmetricVerses from '../components/SymmetricVerses';
import StudyCharacter from '../components/StudyCharacter';
import StudyRange from '../components/StudyRange';
import CompareRanges from '../components/CompareRanges';
import CharsPerChapter from '../components/CharsPerChapter';
import LetterStats from '../components/LetterStats';
import SymmetryCircle from '../components/SymmetryCircle';
import QuranCharsChart from '../components/QuranCharsChart';
import ChapterVersesChart from '../components/ChapterVersesChart';
import LoadingState from '../components/stats/LoadingState.jsx';

// المختبر الرياضي يُحمَّل عند فتحه فقط (فيه مكتبة mathjs)
const MathLab = lazy(() => import('../components/MathLab'));

// لوحة البداية: أرقام حقيقية محسوبة من ملفات البيانات
function DashboardStats() {
  const { t } = useTranslation();
  const { data } = useApiData('/api/stats/chapters');
  const value = (n) => (data ? n.toLocaleString('en-US') : '...');
  const items = [
    { label: t('dash_surahs'), value: data ? value(data.rows.length) : '...' },
    { label: t('dash_verses'), value: data ? value(data.totals.Vs) : '...' },
    { label: t('dash_words'), value: data ? value(data.totals.Ws) : '...' },
    { label: t('dash_letters'), value: data ? value(data.totals.Cs) : '...' }
  ];

  return (
    <>
      <section className="dash-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
        {items.map(item => (
          <div key={item.label} className="stat-box">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label" style={{ textTransform: 'none' }}>{item.label}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <SurahAnalytics />
      </section>
    </>
  );
}

export default function Workspace() {
  // على الشاشات الضيقة: القائمة مطوية افتراضياً (أيقونات فقط) وتفتح فوق المحتوى
  const isNarrow = useMediaQuery(NARROW_QUERY);
  const [openState, setOpenState] = useState({ wide: true, narrow: false });
  const isSidebarOpen = isNarrow ? openState.narrow : openState.wide;
  const setIsSidebarOpen = (value) => setOpenState(s => ({ ...s, [isNarrow ? 'narrow' : 'wide']: value }));
  const overlay = isNarrow && isSidebarOpen;

  return (
    <div className="workspace">
      {overlay && <div className="sidebar-spacer" />}
      {overlay && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        overlay={overlay}
        onNavigate={() => { if (isNarrow) { setIsSidebarOpen(false); } }}
      />

      <div className="workspace-main">
        <Routes>
          <Route path="/" element={<DashboardStats />} />
          <Route path="/symmetric-chapters" element={<SymmetricChapters />} />
          <Route path="/symmetric-words" element={<SymmetricWords />} />
          <Route path="/study-chapter" element={<StudyChapter />} />
          <Route path="/study-verse" element={<StudyVerse />} />
          <Route path="/jummal" element={<JummalCalculator />} />
          <Route path="/tables" element={<CustomTables />} />
          <Route path="/wefq" element={<WefqWorld />} />
          <Route path="/number-search" element={<NumberSearch />} />
          <Route path="/number-study" element={<NumberStudy />} />
          <Route path="/unified" element={<UnifiedPlatform />} />
          <Route path="/symmetric-verses" element={<SymmetricVerses />} />
          <Route path="/study-char" element={<StudyCharacter />} />
          <Route path="/study-range" element={<StudyRange />} />
          <Route path="/compare-ranges" element={<CompareRanges />} />
          <Route path="/math-lab" element={<Suspense fallback={<LoadingState />}><MathLab /></Suspense>} />
          <Route path="/chars-per-chapter" element={<CharsPerChapter />} />
          <Route path="/stats-chars" element={<LetterStats />} />
          <Route path="/charts" element={<SymmetryCircle />} />
          <Route path="/quran-chars" element={<QuranCharsChart />} />
          <Route path="/chapter-verses" element={<ChapterVersesChart />} />
          
          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/workspace" />} />
        </Routes>
      </div>
    </div>
  );
}

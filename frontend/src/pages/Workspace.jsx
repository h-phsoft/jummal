import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api.js';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
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
import CharsPerChapter from '../components/CharsPerChapter';
import LetterStats from '../components/LetterStats';
import SymmetryCircle from '../components/SymmetryCircle';
import QuranCharsChart from '../components/QuranCharsChart';
import ChapterVersesChart from '../components/ChapterVersesChart';

function DashboardStats() {
  const [stats, setStats] = useState({
    surahs: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiGet('/api/swar');
        
        setStats({
          surahs: data.length,
          loading: false,
          error: null
        });
      } catch (err) {
        setStats(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };
    
    fetchStats();
  }, []);

  return (
    <>
      <section style={{ display: 'flex', gap: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
        <div className="stat-box" style={{ textAlign: 'left' }}>
          <div className="stat-value">
            {stats.loading ? '...' : (stats.error ? 'Error' : stats.surahs)}
          </div>
          <div className="stat-label">Surahs (Live API)</div>
        </div>
        <div className="stat-box" style={{ textAlign: 'left' }}>
          <div className="stat-value">6,236</div>
          <div className="stat-label">Ayahs (Indexed)</div>
        </div>
        <div className="stat-box" style={{ textAlign: 'left' }}>
          <div className="stat-value">118k+</div>
          <div className="stat-label">Words (Indexed)</div>
        </div>
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <SurahAnalytics />
      </section>
    </>
  );
}

export default function Workspace() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 73px)', overflow: 'hidden' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
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

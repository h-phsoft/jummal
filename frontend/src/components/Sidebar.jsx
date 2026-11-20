import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, Search, 
  BarChart2, Type, Hash, GitCommit, Settings,
  Calculator, Table2, Grid3x3, Sigma, Layers
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation();

  // ترتيب المجموعات: الدراسات، ثم أدوات الجمّل، ثم الإحصائيات
  const menuItems = [
    {
      title: t('studies'),
      items: [
        { name: t('menu_study_chapter'), icon: <Search size={18} />, path: '/workspace/study-chapter' },
        { name: t('menu_study_verse'), icon: <Search size={18} />, path: '/workspace/study-verse' },
        { name: t('menu_study_char'), icon: <Type size={18} />, path: '/workspace/study-char' },
        { name: t('menu_symmetric_chapters'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-chapters' },
        { name: t('menu_symmetric_verses'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-verses' },
        { name: t('menu_symmetric_words'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-words' },
      ]
    },
    {
      title: t('tools_jummal'),
      items: [
        { name: t('tool_unified'), icon: <Layers size={18} />, path: '/workspace/unified' },
        { name: t('tool_jummal'), icon: <Calculator size={18} />, path: '/workspace/jummal' },
        { name: t('tool_tables'), icon: <Table2 size={18} />, path: '/workspace/tables' },
        { name: t('tool_wefq'), icon: <Grid3x3 size={18} />, path: '/workspace/wefq' },
        { name: t('tool_number_search'), icon: <Search size={18} />, path: '/workspace/number-search' },
        { name: t('tool_number_study'), icon: <Sigma size={18} />, path: '/workspace/number-study' },
      ]
    },
    {
      title: t('statistics'),
      items: [
        { name: t('menu_stats_chapters'), icon: <Hash size={18} />, path: '/workspace' },
        { name: t('menu_stats_chars_per_chapter'), icon: <BarChart2 size={18} />, path: '/workspace/chars-per-chapter' },
        { name: t('menu_stats_chars'), icon: <Hash size={18} />, path: '/workspace/stats-chars' },
        { name: t('menu_stats_charts'), icon: <BarChart2 size={18} />, path: '/workspace/charts' },
        { name: t('menu_stats_quran_chars'), icon: <Type size={18} />, path: '/workspace/quran-chars' },
        { name: t('menu_stats_chapter_verses'), icon: <LayoutDashboard size={18} />, path: '/workspace/chapter-verses' },
      ]
    }
  ];

  return (
    <aside 
      style={{
        width: isOpen ? '280px' : '70px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--border-light)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflowY: 'auto'
      }}
    >
      <div style={{ padding: '1rem', display: 'flex', justifyContent: isOpen ? 'flex-end' : 'center', borderBottom: '1px solid var(--border-light)' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <div style={{ padding: isOpen ? '1rem' : '1rem 0' }}>
        {menuItems.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            {isOpen && (
              <div style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                marginBottom: '0.75rem',
                paddingLeft: '1rem'
              }}>
                {group.title}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '0.25rem' }}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/workspace'}
                    style={({ isActive }) => ({
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: isOpen ? '0.75rem 1rem' : '0.75rem',
                      justifyContent: isOpen ? 'flex-start' : 'center',
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'background 0.2s, color 0.2s',
                    })}
                    className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}
                  >
                    <span style={{ color: 'inherit' }}>{item.icon}</span>
                    {isOpen && <span style={{ fontSize: '0.9rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

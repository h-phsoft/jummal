import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, ChevronDown, LayoutDashboard, Search,
  BarChart2, Type, Hash, GitCommit, BookOpen, Wrench, PieChart,
  Calculator, Table2, Grid3x3, Sigma, Layers, TextSelect, Scale, FlaskConical
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

// حالة فتح المجموعات محفوظة في المتصفح (قد لا يتوفر التخزين، فنتجاهل الخطأ)
const GROUPS_STORAGE_KEY = 'jummal.sidebar.groups';

function loadOpenGroups() {
  try {
    const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    // التخزين غير متاح
  }
  return {};
}

function saveOpenGroups(value) {
  try {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(value));
  } catch (e) {
    // التخزين غير متاح
  }
}

// هل المسار الحالي يخص هذا العنصر؟ (لوحة البداية تطابق المسار تماماً)
function matchesPath(itemPath, pathname) {
  const current = pathname.replace(/\/+$/, '') || '/';
  if (itemPath === '/workspace') {
    return current === '/workspace';
  }
  return current === itemPath || current.startsWith(itemPath + '/');
}

export default function Sidebar({ isOpen, setIsOpen, overlay, onNavigate }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // ترتيب المجموعات: الدراسات، ثم أدوات الجمّل، ثم الإحصائيات
  const menuItems = [
    {
      key: 'studies',
      title: t('studies'),
      icon: <BookOpen size={18} />,
      items: [
        { name: t('menu_study_chapter'), icon: <Search size={18} />, path: '/workspace/study-chapter' },
        { name: t('menu_study_verse'), icon: <Search size={18} />, path: '/workspace/study-verse' },
        { name: t('menu_study_char'), icon: <Type size={18} />, path: '/workspace/study-char' },
        { name: t('menu_study_range'), icon: <TextSelect size={18} />, path: '/workspace/study-range' },
        { name: t('menu_compare_ranges'), icon: <Scale size={18} />, path: '/workspace/compare-ranges' },
        { name: t('menu_math_lab'), icon: <FlaskConical size={18} />, path: '/workspace/math-lab' },
        { name: t('menu_symmetric_chapters'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-chapters' },
        { name: t('menu_symmetric_verses'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-verses' },
        { name: t('menu_symmetric_words'), icon: <GitCommit size={18} />, path: '/workspace/symmetric-words' },
      ]
    },
    {
      key: 'tools_jummal',
      title: t('tools_jummal'),
      icon: <Wrench size={18} />,
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
      key: 'statistics',
      title: t('statistics'),
      icon: <PieChart size={18} />,
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

  const activeGroup = menuItems.find(group => group.items.some(item => matchesPath(item.path, pathname)));
  const activeKey = activeGroup ? activeGroup.key : null;

  // المجموعات مفتوحة افتراضياً، وما يغلقه المستخدم يبقى مغلقاً
  const [openGroups, setOpenGroups] = useState(loadOpenGroups);
  const isGroupOpen = (key) => openGroups[key] !== false;

  const updateOpenGroups = (updater) => {
    setOpenGroups(prev => {
      const next = updater(prev);
      saveOpenGroups(next);
      return next;
    });
  };

  // المجموعة التي فيها الصفحة الحالية تُفتح تلقائياً
  useEffect(() => {
    if (activeKey && openGroups[activeKey] === false) {
      updateOpenGroups(prev => ({ ...prev, [activeKey]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const toggleGroup = (key) => {
    updateOpenGroups(prev => ({ ...prev, [key]: !(prev[key] !== false) }));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'} ${overlay ? 'sidebar-overlay' : ''}`}>
      <div className="sidebar-head" style={{ justifyContent: isOpen ? 'flex-end' : 'center' }}>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('toggle_menu')}
          title={t('toggle_menu')}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label={t('sidebar_nav')}>
        {menuItems.map(group => {
          const open = isGroupOpen(group.key);
          const listId = `sidebar-group-${group.key}`;
          const groupLabel = open ? t('sidebar_group_collapse', { name: group.title }) : t('sidebar_group_expand', { name: group.title });
          return (
            <div key={group.key} className={`sidebar-group ${group.key === activeKey ? 'sidebar-group-active' : ''}`}>
              <button
                type="button"
                className="sidebar-group-header"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={open}
                aria-controls={listId}
                aria-label={isOpen ? undefined : groupLabel}
                title={isOpen ? groupLabel : group.title}
              >
                <span className="sidebar-group-icon">{group.icon}</span>
                {isOpen && <span className="sidebar-group-title">{group.title}</span>}
                <ChevronDown
                  size={isOpen ? 16 : 12}
                  className={`sidebar-group-chevron ${open ? 'is-open' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {open && (
                <ul id={listId} className="sidebar-group-items">
                  {group.items.map(item => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.path === '/workspace'}
                        title={isOpen ? undefined : item.name}
                        aria-label={isOpen ? undefined : item.name}
                        onClick={onNavigate}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active-nav-link' : 'nav-link'}`}
                      >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {isOpen && <span className="sidebar-link-text">{item.name}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// =====================================================
// رقم مع قائمة خيارات (زر أيمن أو زر صغير عند المرور):
// دراسة الرقم / في الأوفاق / البحث في الكلمات ← تبويب جديد والرقم معبّأ
// =====================================================
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import {MoreVertical, Calculator, Grid3x3, Search} from 'lucide-react';

const ACTIONS = [
  {key: 'tool_number_study', path: '/workspace/number-study', icon: Calculator},
  {key: 'tool_wefq_study', path: '/workspace/wefq', icon: Grid3x3},
  {key: 'tool_number_search', path: '/workspace/number-search', icon: Search}
];

function numberActionUrl(path, number) {
  const base = window.location.href.split('#')[0];
  return `${base}#${path}?n=${encodeURIComponent(number)}`;
}

export default function NumberValue({value, format = true}) {
  const {t} = useTranslation();
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);
  const display = format ? Number(value).toLocaleString('en-US') : String(value);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') {
        return;
      }
      if (e.type === 'mousedown' && menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      setMenu(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  // إبقاء القائمة داخل الشاشة
  const openAt = (x, y) => {
    const width = 240;
    const height = 170;
    setMenu({
      x: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - height - 8))
    });
  };

  const choose = (path) => {
    setMenu(null);
    window.open(numberActionUrl(path, value), '_blank');
  };

  return (
    <span
      className="num"
      onContextMenu={(e) => {
        e.preventDefault();
        openAt(e.clientX, e.clientY);
      }}
    >
      <span>{display}</span>
      <button
        type="button"
        className="num-btn"
        title={t('number_options')}
        onClick={(e) => {
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          openAt(r.left, r.bottom + 2);
        }}
      >
        <MoreVertical size={12} />
      </button>
      {menu && createPortal(
        <div ref={menuRef} className="num-menu" role="menu" style={{left: menu.x, top: menu.y}}>
          <div className="num-menu-title">{display}</div>
          {ACTIONS.map(({key, path, icon: Icon}) => (
            <button key={key} type="button" role="menuitem" className="num-menu-item" onClick={() => choose(path)}>
              <Icon size={16} /> {t(key)}
            </button>
          ))}
        </div>,
        document.body
      )}
    </span>
  );
}

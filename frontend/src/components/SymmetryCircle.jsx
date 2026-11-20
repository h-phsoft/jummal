// =====================================================
// مخطط تناظر السور: السور الـ 114 على دائرة، المحور من سورة البداية إلى مقابلتها
// المرور فوق سورة يرسم خط التناظر مع نظيرتها ومجموع آياتهما، والنقر يثبّته
// =====================================================
import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download} from 'lucide-react';
import {mirrorIndex} from '@jummal/core';
import {useApiData} from '../hooks/useApiData.js';
import LoadingState from './stats/LoadingState.jsx';

const SIZE = 900;
const CENTER = SIZE / 2;

export default function SymmetryCircle() {
  const {t} = useTranslation();
  const swar = useApiData('/api/swar');
  const svgRef = useRef(null);
  const [start, setStart] = useState(0);
  const [radius, setRadius] = useState(380);
  const [axisColor, setAxisColor] = useState('#1976d2');
  const [mirrorColor, setMirrorColor] = useState('#e67e22');
  const [bgColor, setBgColor] = useState('#f7f7f7');
  const [transparent, setTransparent] = useState(true);
  const [hovered, setHovered] = useState(-1);
  const [fixed, setFixed] = useState(() => new Set());

  if (swar.loading || swar.error) {
    return <LoadingState error={swar.error} />;
  }

  const words = swar.data.map(s => ({name: s.swarName, qnt: s.swarAyat}));
  const total = words.length;
  const opposite = (start + Math.floor(total / 2)) % total;

  const position = (i, r) => {
    const offset = (((i - start) % total) + total) % total;
    const angle = -Math.PI / 2 + offset * (2 * Math.PI / total);
    return {x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle), angle: angle};
  };

  const isFixed = (i) => fixed.has(i) || fixed.has(mirrorIndex(start, i, total));
  const isHover = (i) => hovered !== -1 && !fixed.has(hovered) && (i === hovered || i === mirrorIndex(start, hovered, total));

  const toggleFixed = (i) => {
    setFixed(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const mirrorLine = (i, color) => {
    const j = mirrorIndex(start, i, total);
    const a = position(i, radius - 30);
    const b = position(j, radius - 30);
    return (
      <g key={`line-${i}`}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={3} />
        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} fill="#2e7d32" fontSize={18} fontWeight={700} textAnchor="middle" dominantBaseline="middle">
          {words[i].qnt + words[j].qnt}
        </text>
      </g>
    );
  };

  // تحميل المخطط صورة PNG
  const download = () => {
    const svg = svgRef.current;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'symmetric-chapters.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  };

  return (
    <div className="tool-page">
      <div className="tool-card">
        <h2 className="tool-title">{t('menu_stats_charts')}: {t('menu_symmetric_chapters')}</h2>
        <p className="tool-subtitle" style={{marginBottom: '1rem'}}>{t('circle_desc')}</p>
        <div className="tool-row" style={{gap: '1rem'}}>
          <select
            className="tool-select"
            value={start}
            onChange={(e) => {
              setStart(parseInt(e.target.value, 10));
              setFixed(new Set());
            }}
          >
            {swar.data.map((s, i) => <option key={s.swarId} value={i}>{s.swarId} - {s.swarName}</option>)}
          </select>
          <label className="tool-row" style={{gap: 6}}>
            {t('circle_radius')}
            <input type="range" min={200} max={400} value={radius} onChange={(e) => setRadius(parseInt(e.target.value, 10))} />
          </label>
          <label className="tool-row" style={{gap: 6}}>
            {t('circle_axis_color')}
            <input type="color" value={axisColor} onChange={(e) => setAxisColor(e.target.value)} />
          </label>
          <label className="tool-row" style={{gap: 6}}>
            {t('circle_mirror_color')}
            <input type="color" value={mirrorColor} onChange={(e) => setMirrorColor(e.target.value)} />
          </label>
          <label className="tool-row" style={{gap: 6}}>
            {t('circle_bg_color')}
            <input type="color" value={bgColor} disabled={transparent} onChange={(e) => setBgColor(e.target.value)} />
          </label>
          <label className="tool-row" style={{gap: 6}}>
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            {t('circle_transparent')}
          </label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={download}>
            <Download size={14} style={{marginInlineEnd: 4}} /> {t('download_image')}
          </button>
          {fixed.size > 0 && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setFixed(new Set())}>{t('clear_lines')}</button>
          )}
        </div>
      </div>

      <div className="tool-card" style={{padding: '0.5rem'}}>
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{width: '100%', maxWidth: SIZE, display: 'block', margin: '0 auto', fontFamily: 'Tajawal, Arial, sans-serif'}}
          onMouseLeave={() => setHovered(-1)}
        >
          {!transparent && <rect width={SIZE} height={SIZE} fill={bgColor} />}
          <line
            x1={CENTER}
            y1={CENTER - radius + 34}
            x2={CENTER}
            y2={CENTER + radius - 34}
            stroke={axisColor}
            strokeWidth={3}
          />
          {[...fixed].map(i => mirrorLine(i, '#b71c1c'))}
          {hovered !== -1 && !fixed.has(hovered) && mirrorLine(hovered, mirrorColor)}
          {words.map((w, i) => {
            const highlight = isFixed(i) || isHover(i);
            const pos = position(i, highlight ? radius + 18 : radius);
            const onAxis = i === start || i === opposite;
            // النصوص في النصف الأيسر تُقلب لتبقى مقروءة
            const flip = Math.cos(pos.angle) < -0.01;
            const rotation = (pos.angle * 180) / Math.PI + (flip ? 180 : 0);
            let fill = 'var(--text-primary)';
            if (onAxis) {
              fill = axisColor;
            } else if (isFixed(i)) {
              fill = '#b71c1c';
            } else if (isHover(i)) {
              fill = mirrorColor;
            }
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                transform={`rotate(${rotation} ${pos.x} ${pos.y})`}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={onAxis || highlight ? 16 : 13}
                fontWeight={onAxis || highlight ? 700 : 400}
                fill={fill}
                style={{cursor: 'pointer'}}
                onMouseEnter={() => setHovered(i)}
                onClick={() => toggleFixed(i)}
              >
                {highlight ? `${w.qnt} - ${w.name}` : w.name}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

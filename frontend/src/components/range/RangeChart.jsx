// =====================================================
// رسم أعمدة لنتائج المقطع: سلسلة واحدة أو سلسلتان (A و B)
// series: [{key, label, color}]، والبيانات [{name, [key]: قيمة}]
// =====================================================
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {NARROW_QUERY, useMediaQuery} from '../../hooks/useMediaQuery.js';

export default function RangeChart({data, series, height = 320, tickSize = 14, angle = 0}) {
  // على الشاشات الضيقة: خط أصغر للمحور حتى لا تتداخل الحروف الـ 28
  const isNarrow = useMediaQuery(NARROW_QUERY);
  const tick = isNarrow ? Math.min(tickSize, 9) : tickSize;
  const formatValue = (v) => (Number.isInteger(v) ? Number(v).toLocaleString('en-US') : Number(v).toFixed(4));
  return (
    <div style={{height: height, direction: 'ltr'}}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top: 16, right: 16, left: 0, bottom: angle ? 40 : 10}}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--text-tertiary)"
            tick={{fill: 'var(--text-secondary)', fontSize: tick}}
            interval={0}
            angle={angle}
            textAnchor={angle ? 'end' : 'middle'}
          />
          <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickFormatter={formatValue} />
          <Tooltip
            cursor={{fill: 'var(--bg-secondary)'}}
            contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8}}
            formatter={(value, name) => [formatValue(value), name]}
          />
          {series.length > 1 && <Legend />}
          {series.map(s => (
            <Bar key={s.key} isAnimationActive={false} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// =====================================================
// مخطط خطي/مساحي لقيمة عبر السور الـ 114 (بنفس ألوان مساحة العمل)
// =====================================================
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

export default function LineByChapter({data, dataKey, label, height = 420, color = 'var(--accent-primary)'}) {
  const gradientId = `grad-${dataKey}`;
  return (
    <div style={{height: height, direction: 'ltr'}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{top: 10, right: 20, left: 0, bottom: 40}}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.45} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
          <XAxis
            dataKey="CpName"
            stroke="var(--text-tertiary)"
            tick={{fill: 'var(--text-secondary)', fontSize: 10}}
            angle={-60}
            textAnchor="end"
            interval="preserveStartEnd"
            height={60}
          />
          <YAxis stroke="var(--text-tertiary)" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
          <Tooltip
            contentStyle={{background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 8, direction: 'rtl'}}
            labelStyle={{color: 'var(--text-primary)', fontWeight: 700}}
            formatter={(value) => [Number(value).toLocaleString('en-US'), label]}
            labelFormatter={(name, payload) => (payload && payload[0] ? `${payload[0].payload.CpNo} - ${name}` : name)}
          />
          <Area isAnimationActive={false} type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

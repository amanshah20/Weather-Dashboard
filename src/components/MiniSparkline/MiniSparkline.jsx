import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function MiniSparkline({ color, data, dataKey, title }) {
  return (
    <article className="glass-card spark-card">
      <p>{title}</p>
      <div className="spark-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ background: 'rgba(5,10,20,0.9)', border: '1px solid rgba(0,180,255,0.3)' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#spark-${dataKey})`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

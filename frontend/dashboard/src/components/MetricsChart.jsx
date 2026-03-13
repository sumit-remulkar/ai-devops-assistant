import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BarChart2 } from 'lucide-react'

export default function MetricsChart({ history = [] }) {
  const chartData = history.slice(-20).map((snapshot, i) => {
    const nodes = Object.values(snapshot.nodes || {})
    const avgCpu = nodes.length ? nodes.reduce((sum, n) => sum + n.cpu_usage, 0) / nodes.length : 0
    const avgMem = nodes.length ? nodes.reduce((sum, n) => sum + n.memory_usage, 0) / nodes.length : 0
    const svcs = Object.values(snapshot.services || {})
    const avgLatency = svcs.length ? svcs.reduce((sum, s) => sum + s.avg_latency_ms, 0) / svcs.length : 0

    return {
      time: i,
      cpu: parseFloat(avgCpu.toFixed(1)),
      memory: parseFloat(avgMem.toFixed(1)),
      latency: parseFloat((avgLatency / 20).toFixed(1)), // scaled
    }
  })

  if (chartData.length < 2) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '20px' }}>
          Collecting metrics history...
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '11px',
      }}>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color, marginBottom: '2px' }}>
            {p.name.toUpperCase()}: {p.value}{p.name !== 'latency' ? '%' : ' (scaled)'}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <BarChart2 size={14} color="#00e5ff" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Metrics Trend
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '10px' }}>
          <Legend color="#00e5ff" label="CPU" />
          <Legend color="#00ff88" label="Memory" />
          <Legend color="#ffd700" label="Latency" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffd700" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
          <XAxis dataKey="time" hide />
          <YAxis tick={{ fontSize: 9, fill: '#44445a' }} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="cpu" stroke="#00e5ff" fill="url(#cpuGrad)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="memory" stroke="#00ff88" fill="url(#memGrad)" strokeWidth={1.5} dot={false} />
          <Area type="monotone" dataKey="latency" stroke="#ffd700" fill="url(#latGrad)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ width: 20, height: 2, background: color, borderRadius: '1px' }} />
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

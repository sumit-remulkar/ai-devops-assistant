import { Server } from 'lucide-react'
import MetricCard from './MetricCard'
import { getUsageColor } from '../utils/formatters'

export default function NodePanel({ nodes = {} }) {
  const nodeList = Object.entries(nodes)

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Server size={14} color="#00e5ff" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Nodes ({nodeList.length})
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {nodeList.map(([name, metrics]) => (
          <div key={name} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            animation: 'slide-in-up 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#00e5ff', fontSize: '13px' }}>
                {name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88' }} />
                <span style={{ color: '#00ff88', fontSize: '10px' }}>ONLINE</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <MetricCard label="CPU" value={metrics.cpu_usage} />
              <MetricCard label="Memory" value={metrics.memory_usage} />
              <MetricCard label="Disk" value={metrics.disk_usage} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>NET IN</span>
                <span style={{ color: '#00e5ff', fontSize: '11px' }}>{metrics.network_in} MB/s</span>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>NET OUT</span>
                <span style={{ color: '#7c3aed', fontSize: '11px' }}>{metrics.network_out} MB/s</span>
              </div>
            </div>
          </div>
        ))}
        {nodeList.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
            No nodes data available
          </div>
        )}
      </div>
    </section>
  )
}

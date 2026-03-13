import { Package } from 'lucide-react'
import { statusColor } from '../utils/formatters'

export default function ContainersPanel({ containers = {} }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Package size={14} color="#00e5ff" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Containers
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(containers).map(([name, c]) => {
          const sc = statusColor(c.status)
          return (
            <div key={name} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
              alignItems: 'center', gap: '10px',
              padding: '8px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>{name}</span>
              </div>
              <Pill label={c.status} color={sc} />
              <Metric label="CPU" value={`${c.cpu_pct}%`} />
              <Metric label="MEM" value={`${c.memory_mb}MB`} />
              <Metric label="↺" value={c.restarts} />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Pill({ label, color }) {
  return (
    <div style={{
      padding: '2px 8px', borderRadius: '10px',
      background: `${color}15`, border: `1px solid ${color}33`,
      color, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '9px', marginRight: '4px' }}>{label}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}

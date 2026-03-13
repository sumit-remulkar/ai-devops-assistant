import { Layers, Activity } from 'lucide-react'
import { statusColor, getUsageColor } from '../utils/formatters'

export default function ServicesPanel({ services = {} }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Layers size={14} color="#00e5ff" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Services
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {Object.entries(services).map(([name, svc]) => (
          <ServiceCard key={name} name={name} svc={svc} />
        ))}
      </div>
    </section>
  )
}

function ServiceCard({ name, svc }) {
  const sc = statusColor(svc.status)
  const lcol = getUsageColor(svc.avg_latency_ms / 10)
  const ecol = svc.error_rate > 5 ? '#ff3355' : svc.error_rate > 2 ? '#ff6b35' : '#00ff88'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
            {name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc }} />
            <span style={{ color: sc, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {svc.status}
            </span>
          </div>
        </div>
        <div style={{
          background: '#00e5ff15',
          border: '1px solid #00e5ff33',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          color: '#00e5ff',
        }}>
          ×{svc.replicas}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <Stat label="REQ/S" value={`${svc.requests_per_sec}`} color="#00e5ff" />
        <Stat label="LATENCY" value={`${svc.avg_latency_ms}ms`} color={lcol} />
        <Stat label="ERRORS" value={`${svc.error_rate}%`} color={ecol} />
        <Stat label="CPU" value={`${svc.cpu_limit_pct}%`} color={getUsageColor(svc.cpu_limit_pct)} />
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ padding: '5px 8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '1px', marginBottom: '1px' }}>{label}</div>
      <div style={{ color, fontSize: '11px', fontWeight: 600 }}>{value}</div>
    </div>
  )
}

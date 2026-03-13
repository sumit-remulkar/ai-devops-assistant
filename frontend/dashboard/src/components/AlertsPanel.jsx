import { AlertTriangle, Bell, Check, Eye } from 'lucide-react'
import { severityColor, timeAgo } from '../utils/formatters'

export default function AlertsPanel({ alerts = [], onDiagnose, onAcknowledge }) {
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9)
  })

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={14} color="#ff3355" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Active Alerts
          </h2>
        </div>
        {alerts.length > 0 && (
          <span style={{
            background: '#ff335522',
            border: '1px solid #ff335544',
            color: '#ff3355',
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '11px',
            fontWeight: 700,
          }}>
            {alerts.length}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sorted.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: '#00ff88',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>✓</div>
            <div style={{ fontSize: '12px' }}>All systems nominal</div>
          </div>
        ) : (
          sorted.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDiagnose={onDiagnose}
              onAcknowledge={onAcknowledge}
            />
          ))
        )}
      </div>
    </section>
  )
}

function AlertCard({ alert, onDiagnose, onAcknowledge }) {
  const color = severityColor(alert.severity)
  const isPulsing = alert.severity === 'critical'

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08 0%, var(--bg-card) 60%)`,
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--radius)',
      padding: '12px 14px',
      animation: 'slide-in-right 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertTriangle size={12} color={color} className={isPulsing ? 'animate-pulse-glow' : ''} />
            <span style={{ color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {alert.severity}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
              {timeAgo(alert.created_at)}
            </span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
            {alert.title}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {alert.description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={() => onDiagnose && onDiagnose(alert)}
            style={{
              background: '#00e5ff15',
              border: '1px solid #00e5ff33',
              color: '#00e5ff',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#00e5ff25'; e.target.style.boxShadow = '0 0 10px #00e5ff33' }}
            onMouseLeave={e => { e.target.style.background = '#00e5ff15'; e.target.style.boxShadow = 'none' }}
          >
            <Eye size={10} /> DIAGNOSE
          </button>
        </div>
      </div>
    </div>
  )
}

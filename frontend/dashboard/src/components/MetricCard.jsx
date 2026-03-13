import { getUsageColor } from '../utils/formatters'

export default function MetricCard({ label, value, unit = '%', sublabel, trend, style = {} }) {
  const numVal = parseFloat(value) || 0
  const color = unit === '%' ? getUsageColor(numVal) : '#00e5ff'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border)`,
      borderRadius: 'var(--radius)',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color + '66'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ color, fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{unit}</span>
      </div>
      {sublabel && (
        <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>{sublabel}</div>
      )}

      {/* Progress bar */}
      {unit === '%' && (
        <div style={{
          marginTop: '10px',
          height: '3px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(numVal, 100)}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: '2px',
            transition: 'width 0.8s ease',
            boxShadow: `0 0 6px ${color}`,
          }} />
        </div>
      )}
    </div>
  )
}

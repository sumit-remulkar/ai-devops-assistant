import { Activity, Zap, Wifi, WifiOff } from 'lucide-react'

export default function Header({ alerts = [], lastUpdated, error }) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const highCount = alerts.filter(a => a.severity === 'high').length

  return (
    <header style={{
      background: 'linear-gradient(90deg, rgba(0,229,255,0.05) 0%, rgba(0,0,0,0) 60%)',
      borderBottom: '1px solid #1a1a2e',
      padding: '0 28px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #00e5ff22, #00e5ff44)',
          border: '1px solid #00e5ff66',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={18} color="#00e5ff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#e8e8f0', letterSpacing: '-0.3px' }}>
            AI DevOps
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Command Center
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {criticalCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', animation: 'pulse-glow 2s infinite' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3355' }} className="animate-pulse-glow" />
            <span style={{ color: '#ff3355', fontSize: '11px', fontWeight: 600 }}>
              {criticalCount} CRITICAL
            </span>
          </div>
        )}
        {highCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b35' }} />
            <span style={{ color: '#ff6b35', fontSize: '11px', fontWeight: 600 }}>
              {highCount} HIGH
            </span>
          </div>
        )}
        {alerts.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88' }} />
            <span style={{ color: '#00ff88', fontSize: '11px' }}>ALL SYSTEMS NORMAL</span>
          </div>
        )}

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: error ? '#ff6b35' : '#00e5ff', fontSize: '11px' }}>
          {error ? <WifiOff size={12} /> : <Wifi size={12} />}
          <span>{error ? 'DEMO MODE' : 'LIVE'}</span>
        </div>

        {lastUpdated && (
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        )}
      </div>
    </header>
  )
}

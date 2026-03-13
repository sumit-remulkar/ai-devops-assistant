import { Box, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function ClusterPanel({ cluster = {} }) {
  const { total_pods = 0, running_pods = 0, failed_pods = 0, pending_pods = 0, nodes_ready = 0, nodes_total = 0 } = cluster
  const healthPct = total_pods > 0 ? (running_pods / total_pods) * 100 : 100

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Box size={14} color="#7c3aed" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Cluster
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: healthPct > 90 ? '#00ff88' : healthPct > 70 ? '#ffd700' : '#ff3355' }} />
          <span style={{ fontSize: '10px', color: healthPct > 90 ? '#00ff88' : '#ffd700' }}>
            {healthPct.toFixed(0)}% HEALTHY
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
        <PodStat icon={<CheckCircle size={12} color="#00ff88" />} label="RUNNING" value={running_pods} color="#00ff88" />
        <PodStat icon={<XCircle size={12} color="#ff3355" />} label="FAILED" value={failed_pods} color="#ff3355" />
        <PodStat icon={<Clock size={12} color="#ffd700" />} label="PENDING" value={pending_pods} color="#ffd700" />
      </div>

      {/* Health bar */}
      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${healthPct}%`,
          background: `linear-gradient(90deg, #00ff8888, #00ff88)`,
          borderRadius: '2px',
          transition: 'width 1s ease',
          boxShadow: '0 0 8px #00ff8866',
        }} />
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Nodes: {nodes_ready}/{nodes_total} ready</span>
        <span>Total pods: {total_pods}</span>
      </div>
    </div>
  )
}

function PodStat({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius)',
      padding: '10px',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div>
      <div style={{ color, fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '1px', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

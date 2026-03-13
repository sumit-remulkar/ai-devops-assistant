export function formatUptime(seconds) {
  if (!seconds) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatBytes(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

export function formatTimestamp(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function severityColor(severity) {
  const map = {
    critical: '#ff3355',
    high: '#ff6b35',
    medium: '#ffd700',
    low: '#00ff88',
    info: '#00e5ff',
  }
  return map[severity?.toLowerCase()] || '#8888aa'
}

export function statusColor(status) {
  const map = {
    running: '#00ff88',
    healthy: '#00ff88',
    active: '#ff3355',
    acknowledged: '#ffd700',
    resolved: '#8888aa',
    unhealthy: '#ff3355',
    exited: '#ff6b35',
    pending: '#ffd700',
  }
  return map[status?.toLowerCase()] || '#8888aa'
}

export function getUsageColor(pct) {
  if (pct >= 90) return '#ff3355'
  if (pct >= 75) return '#ff6b35'
  if (pct >= 60) return '#ffd700'
  return '#00ff88'
}

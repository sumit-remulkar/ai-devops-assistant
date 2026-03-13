import { TrendingUp, AlertTriangle } from 'lucide-react'

function predictTrend(history, metricGetter, hours = 2) {
  if (!history || history.length < 5) return null
  const values = history.slice(-10).map(metricGetter).filter(v => !isNaN(v))
  if (values.length < 3) return null
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((s, v, i) => s + i * v, 0)
  const sumX2 = values.reduce((s, _, i) => s + i * i, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const futureSteps = (hours * 60) / 15 // 15s intervals
  const predicted = intercept + slope * (n - 1 + futureSteps)
  return { current: values[values.length - 1], predicted: Math.max(0, Math.min(100, predicted)), slope }
}

export default function PredictivePanel({ history = [] }) {
  const cpuPred = predictTrend(history, snap => {
    const nodes = Object.values(snap.nodes || {})
    return nodes.length ? nodes.reduce((s, n) => s + n.cpu_usage, 0) / nodes.length : NaN
  })
  const memPred = predictTrend(history, snap => {
    const nodes = Object.values(snap.nodes || {})
    return nodes.length ? nodes.reduce((s, n) => s + n.memory_usage, 0) / nodes.length : NaN
  })

  const predictions = [
    { label: 'CPU', pred: cpuPred, threshold: 90, unit: '%' },
    { label: 'Memory', pred: memPred, threshold: 85, unit: '%' },
  ].filter(p => p.pred)

  if (predictions.length === 0) {
    return null
  }

  const risks = predictions.filter(p => p.pred.predicted >= p.threshold)

  return (
    <div style={{
      background: risks.length ? 'linear-gradient(135deg, #ffd70008, var(--bg-card))' : 'var(--bg-card)',
      border: `1px solid ${risks.length ? '#ffd70033' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <TrendingUp size={14} color="#ffd700" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Predictive Analysis (2h)
        </h3>
      </div>
      {predictions.map(({ label, pred, threshold, unit }) => {
        const willExceed = pred.predicted >= threshold
        const color = willExceed ? '#ffd700' : '#00ff88'
        return (
          <div key={label} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ color }}>
                {pred.current.toFixed(0)}% → {pred.predicted.toFixed(0)}%
                {willExceed && ' ⚠'}
              </span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${Math.min(pred.current, 100)}%`,
                background: '#4444aa', borderRadius: '2px',
              }} />
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${Math.min(pred.predicted, 100)}%`,
                background: `${color}88`,
                borderRadius: '2px',
              }} />
              <div style={{
                position: 'absolute',
                left: `${threshold}%`,
                top: '-3px',
                width: '1px',
                height: '9px',
                background: '#ff335566',
              }} />
            </div>
            {willExceed && (
              <div style={{ fontSize: '10px', color: '#ffd700', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={9} />
                Predicted to exceed {threshold}% threshold in ~2h
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

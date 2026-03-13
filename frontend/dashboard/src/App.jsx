import { useState } from 'react'
import Header from './components/Header'
import NodePanel from './components/NodePanel'
import ServicesPanel from './components/ServicesPanel'
import AlertsPanel from './components/AlertsPanel'
import DiagnosisPanel from './components/DiagnosisPanel'
import ClusterPanel from './components/ClusterPanel'
import ContainersPanel from './components/ContainersPanel'
import MetricsChart from './components/MetricsChart'
import PredictivePanel from './components/PredictivePanel'
import ChatBot from './components/ChatBot'
import { useMetrics } from './hooks/useMetrics'
import { useDiagnosis } from './hooks/useDiagnosis'
import { RefreshCw } from 'lucide-react'

export default function App() {
  const { metrics, history, alerts, loading, error, lastUpdated, refresh } = useMetrics(15000)
  const { rca, plan, loading: diagLoading, remediating, executionResult, diagnose, generatePlan, executeRemediation, reset } = useDiagnosis()
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleDiagnose = (alert) => {
    setSelectedAlert(alert)
    setActiveTab('diagnosis')
    diagnose(alert)
  }

  if (loading && !metrics) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #00e5ff33', borderTop: '2px solid #00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Initializing AI DevOps System...
        </div>
      </div>
    )
  }

  const nodes = metrics?.nodes || {}
  const services = metrics?.services || {}
  const containers = metrics?.containers || {}
  const cluster = metrics?.cluster || {}

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header alerts={alerts} lastUpdated={lastUpdated} error={error} />

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: '0', padding: '0 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        {[
          { id: 'dashboard', label: '⬡ Dashboard' },
          { id: 'diagnosis', label: '⬡ AI Diagnosis' },
          { id: 'remediation', label: '⬡ Remediation Log' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '11px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#00e5ff' : 'transparent'}`,
              color: activeTab === tab.id ? '#00e5ff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
          <button
            onClick={refresh}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '5px 8px',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px',
            }}
          >
            <RefreshCw size={11} /> REFRESH
          </button>
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: '20px 28px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '20px', alignItems: 'start' }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ClusterPanel cluster={cluster} />
              <AlertsPanel alerts={alerts} onDiagnose={handleDiagnose} />
            </div>

            {/* Center column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <MetricsChart history={history} />
              <PredictivePanel history={history} />
              <ServicesPanel services={services} />
              <ContainersPanel containers={containers} />
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <NodePanel nodes={nodes} />
            </div>
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alerts.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>SELECT AN ALERT TO DIAGNOSE:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {alerts.map(alert => (
                    <button
                      key={alert.id}
                      onClick={() => handleDiagnose(alert)}
                      style={{
                        background: selectedAlert?.id === alert.id ? '#00e5ff10' : 'var(--bg-card)',
                        border: `1px solid ${selectedAlert?.id === alert.id ? '#00e5ff44' : 'var(--border)'}`,
                        borderRadius: 'var(--radius)',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ color: alert.severity === 'critical' ? '#ff3355' : '#ff6b35', marginRight: '8px' }}>
                        [{alert.severity?.toUpperCase()}]
                      </span>
                      {alert.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <DiagnosisPanel
              selectedAlert={selectedAlert}
              rca={rca}
              plan={plan}
              loading={diagLoading}
              remediating={remediating}
              executionResult={executionResult}
              onDiagnose={() => selectedAlert && diagnose(selectedAlert)}
              onGeneratePlan={() => generatePlan()}
              onExecute={executeRemediation}
            />
          </div>
        )}

        {activeTab === 'remediation' && (
          <RemediationLog />
        )}
      </main>

      <ChatBot />
    </div>
  )
}

function RemediationLog() {
  const { executeRemediation } = useDiagnosis()
  const quickActions = [
    { label: 'Scale api-service ×3', command: 'kubectl scale deployment api-service --replicas=3', risk: 'low', color: '#00ff88' },
    { label: 'Scale api-service ×5', command: 'kubectl scale deployment api-service --replicas=5', risk: 'low', color: '#00ff88' },
    { label: 'Restart auth-service', command: 'kubectl rollout restart deployment/auth-service', risk: 'medium', color: '#ffd700' },
    { label: 'Clear old logs', command: 'find /var/log -name "*.log" -mtime +7 -delete', risk: 'low', color: '#00e5ff' },
    { label: 'Restart web-app container', command: 'docker restart web-app', risk: 'low', color: '#00e5ff' },
    { label: 'Rollback api-service', command: 'kubectl rollout undo deployment/api-service', risk: 'medium', color: '#ffd700' },
  ]

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Remediation Controls
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          All actions run in DRY RUN mode by default. Set DRY_RUN=false in .env to execute for real.
        </p>
      </div>

      <div style={{
        padding: '12px 16px',
        background: '#ffd70010',
        border: '1px solid #ffd70033',
        borderRadius: 'var(--radius)',
        marginBottom: '20px',
        fontSize: '11px',
        color: '#ffd700',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        ⚠ DRY RUN MODE ACTIVE — Commands will be simulated, not executed
      </div>

      <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        Quick Actions
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {quickActions.map((action, i) => (
          <QuickActionCard key={i} action={action} />
        ))}
      </div>
    </div>
  )
}

function QuickActionCard({ action }) {
  const [status, setStatus] = useState(null)

  const run = () => {
    setStatus('running')
    setTimeout(() => setStatus('done'), 1500)
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <div style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500 }}>{action.label}</div>
        <span style={{
          padding: '2px 6px', borderRadius: '4px', fontSize: '9px',
          background: action.risk === 'low' ? '#00ff8815' : '#ffd70015',
          border: `1px solid ${action.risk === 'low' ? '#00ff8833' : '#ffd70033'}`,
          color: action.risk === 'low' ? '#00ff88' : '#ffd700',
          whiteSpace: 'nowrap',
        }}>
          {action.risk} risk
        </span>
      </div>
      <div style={{
        padding: '6px 10px',
        background: 'var(--bg-secondary)',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#00e5ff',
        marginBottom: '10px',
        fontFamily: 'var(--font-mono)',
      }}>
        $ {action.command}
      </div>
      <button
        onClick={run}
        disabled={status === 'running'}
        style={{
          width: '100%',
          padding: '7px',
          background: status === 'done' ? '#00ff8815' : `${action.color}15`,
          border: `1px solid ${status === 'done' ? '#00ff8844' : action.color + '44'}`,
          borderRadius: 'var(--radius)',
          color: status === 'done' ? '#00ff88' : action.color,
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          cursor: status ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {status === 'running' ? '⏳ Executing...' : status === 'done' ? '✓ COMPLETED (DRY RUN)' : '▶ RUN'}
      </button>
    </div>
  )
}

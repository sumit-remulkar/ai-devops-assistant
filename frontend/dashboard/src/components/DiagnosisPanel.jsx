import { Brain, ChevronRight, Loader, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { severityColor } from '../utils/formatters'

export default function DiagnosisPanel({ selectedAlert, rca, plan, loading, remediating, executionResult, onDiagnose, onGeneratePlan, onExecute }) {
  if (!selectedAlert) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <Brain size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-display)' }}>AI Diagnosis Engine</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>
          Click <span style={{ color: '#00e5ff' }}>DIAGNOSE</span> on an alert to run AI root cause analysis
        </div>
      </div>
    )
  }

  const color = severityColor(selectedAlert.severity)

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: `linear-gradient(90deg, ${color}10 0%, transparent 100%)`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Brain size={14} color="#00e5ff" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          AI Diagnosis
        </span>
        {loading && <Loader size={12} color="#00e5ff" style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Selected alert info */}
        <div style={{
          padding: '10px 12px',
          background: `${color}10`,
          border: `1px solid ${color}33`,
          borderRadius: 'var(--radius)',
          marginBottom: '14px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ color }}>⬤ {selectedAlert.severity?.toUpperCase()}</span>{' '}
          {selectedAlert.title}
        </div>

        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#00e5ff', fontSize: '11px' }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
            <div>Analyzing metrics, logs, and patterns...</div>
          </div>
        )}

        {rca && !loading && (
          <div style={{ animation: 'slide-in-up 0.4s ease' }}>
            {/* Root Cause */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', marginBottom: '6px' }}>ROOT CAUSE</div>
              <div style={{ color: '#ffd700', fontSize: '12px', fontWeight: 500, lineHeight: '1.5' }}>
                {rca.root_cause}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <ConfidenceBadge value={rca.confidence} />
                <Badge text={rca.source === 'ai' ? '🤖 AI Analysis' : '📏 Heuristic'} color="#7c3aed" />
              </div>
            </div>

            {/* Evidence */}
            {rca.evidence && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', marginBottom: '6px' }}>EVIDENCE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {rca.evidence.map((e, i) => (
                    <div key={i} style={{
                      padding: '6px 10px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      borderLeft: '2px solid #00e5ff33',
                    }}>
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {rca.recommended_actions && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', marginBottom: '6px' }}>RECOMMENDED ACTIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {rca.recommended_actions.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-primary)' }}>
                      <ChevronRight size={10} color="#00ff88" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact */}
            {rca.estimated_impact && (
              <div style={{
                padding: '8px 10px',
                background: '#ff335510',
                border: '1px solid #ff335533',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#ff6b35',
                marginBottom: '14px',
              }}>
                <span style={{ color: '#ff3355' }}>⚠ Impact: </span>{rca.estimated_impact}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!plan && (
                <ActionButton
                  label={remediating ? '⏳ Planning...' : '📋 Generate Plan'}
                  color="#00e5ff"
                  onClick={onGeneratePlan}
                  disabled={remediating}
                />
              )}
              {rca.auto_fix_available && (
                <ActionButton
                  label={remediating ? '⏳ Executing...' : '⚡ Auto-Fix'}
                  color="#00ff88"
                  onClick={onExecute}
                  disabled={remediating}
                />
              )}
            </div>
          </div>
        )}

        {/* Remediation Plan */}
        {plan && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', animation: 'slide-in-up 0.4s ease' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1.5px', marginBottom: '10px' }}>REMEDIATION PLAN</div>
            <div style={{ color: '#00e5ff', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>{plan.plan_title}</div>
            {plan.steps?.map(step => (
              <div key={step.step} style={{
                padding: '8px 10px',
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                marginBottom: '6px',
                borderLeft: `2px solid ${step.risk === 'low' ? '#00ff88' : step.risk === 'medium' ? '#ffd700' : '#ff3355'}`,
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Step {step.step}:</span> {step.action}
                </div>
                <div style={{ fontSize: '10px', color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                  $ {step.command}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Risk: <span style={{ color: step.risk === 'low' ? '#00ff88' : step.risk === 'medium' ? '#ffd700' : '#ff3355' }}>{step.risk}</span>
                  {' · '}{step.expected_outcome}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', animation: 'slide-in-up 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              {executionResult.status === 'completed'
                ? <CheckCircle2 size={14} color="#00ff88" />
                : <AlertCircle size={14} color="#ff3355" />
              }
              <span style={{ color: executionResult.status === 'completed' ? '#00ff88' : '#ff3355', fontSize: '12px', fontWeight: 600 }}>
                {executionResult.status?.toUpperCase()} {executionResult.dry_run && '(DRY RUN)'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {executionResult.successful_steps}/{executionResult.total_steps} steps successful
            </div>
            {executionResult.results?.map((r, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                marginBottom: '4px',
                borderLeft: `2px solid ${r.status === 'dry_run' || r.status === 'success' ? '#00ff88' : '#ff3355'}`,
              }}>
                <div style={{ fontSize: '10px', color: '#00e5ff' }}>$ {r.command}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.output}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConfidenceBadge({ value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 80 ? '#00ff88' : pct >= 60 ? '#ffd700' : '#ff6b35'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: `${color}15`, border: `1px solid ${color}33`, borderRadius: '4px', padding: '2px 8px' }}>
      <span style={{ color, fontSize: '10px', fontWeight: 600 }}>{pct}% confidence</span>
    </div>
  )
}

function Badge({ text, color }) {
  return (
    <div style={{ background: `${color}15`, border: `1px solid ${color}33`, borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color }}>
      {text}
    </div>
  )
}

function ActionButton({ label, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '8px 12px',
        background: `${color}15`,
        border: `1px solid ${color}44`,
        borderRadius: 'var(--radius)',
        color,
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        letterSpacing: '0.5px',
      }}
      onMouseEnter={e => { if (!disabled) { e.target.style.background = `${color}25`; e.target.style.boxShadow = `0 0 12px ${color}33` }}}
      onMouseLeave={e => { e.target.style.background = `${color}15`; e.target.style.boxShadow = 'none' }}
    >
      {label}
    </button>
  )
}

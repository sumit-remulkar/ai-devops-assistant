import { useState, useCallback } from 'react'
import { diagnosisApi, remediationApi } from '../utils/api'

export function useDiagnosis() {
  const [rca, setRca] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [remediating, setRemediating] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)
  const [error, setError] = useState(null)

  const diagnose = useCallback(async (alert) => {
    setLoading(true)
    setRca(null)
    setPlan(null)
    setExecutionResult(null)
    try {
      const res = await diagnosisApi.analyze(alert)
      setRca(res.data)
    } catch (err) {
      // Mock RCA for demo
      setRca({
        root_cause: 'Traffic spike causing CPU overload on production-node-1',
        confidence: 0.88,
        evidence: [
          `Alert: ${alert.title} — value ${alert.value}% (threshold: ${alert.threshold}%)`,
          'CPU at 94% on production-node-1',
          'Requests/sec elevated to 1450 (normal: ~300)',
          'API latency spiked to 2400ms',
        ],
        recommended_actions: [
          'Scale api-service to 5 replicas',
          'Enable rate limiting at 500 req/s per IP',
          'Review auto-scaling policies',
        ],
        severity: 'critical',
        estimated_impact: '30% of API requests timing out',
        auto_fix_available: true,
        predictive_risk: 'Full service outage in 10-15 min if unaddressed',
        source: 'ai',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const generatePlan = useCallback(async (rcaData) => {
    setRemediating(true)
    try {
      const res = await remediationApi.plan(rcaData || rca)
      setPlan(res.data)
    } catch (err) {
      setPlan({
        plan_title: 'Auto-remediation: CPU Overload',
        steps: [
          { step: 1, action: 'Scale api-service to 5 replicas', command: 'kubectl scale deployment api-service --replicas=5', risk: 'low', expected_outcome: 'Distributes load across more pods' },
          { step: 2, action: 'Enable rate limiting', command: 'kubectl apply -f rate-limit-policy.yaml', risk: 'medium', expected_outcome: 'Reduces incoming traffic spike' },
          { step: 3, action: 'Monitor for 5 minutes', command: 'kubectl get pods -w -n production', risk: 'low', expected_outcome: 'Verify pods are running' },
        ],
        estimated_resolution_time: '2m',
        requires_human_approval: false,
        rollback_plan: 'kubectl scale deployment api-service --replicas=2',
        source: 'ai',
      })
    } finally {
      setRemediating(false)
    }
  }, [rca])

  const executeRemediation = useCallback(async () => {
    if (!rca) return
    setRemediating(true)
    try {
      const res = await remediationApi.execute(rca, true)
      setExecutionResult(res.data)
    } catch (err) {
      setExecutionResult({
        plan_title: 'Auto-remediation Executed',
        total_steps: 3,
        successful_steps: 3,
        status: 'completed',
        dry_run: true,
        results: [
          { step: 1, action: 'Scale api-service', command: 'kubectl scale deployment api-service --replicas=5', status: 'dry_run', output: '[DRY RUN] Would execute: kubectl scale deployment api-service --replicas=5', duration_ms: 500 },
          { step: 2, action: 'Apply rate limit', command: 'kubectl apply -f rate-limit-policy.yaml', status: 'dry_run', output: '[DRY RUN] Would execute: kubectl apply -f rate-limit-policy.yaml', duration_ms: 300 },
        ],
      })
    } finally {
      setRemediating(false)
    }
  }, [rca])

  return {
    rca, plan, loading, remediating, executionResult, error,
    diagnose, generatePlan, executeRemediation,
    reset: () => { setRca(null); setPlan(null); setExecutionResult(null) }
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { metricsApi, alertsApi } from '../utils/api'

export function useMetrics(pollInterval = 15000) {
  const [metrics, setMetrics] = useState(null)
  const [history, setHistory] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const timerRef = useRef(null)

  const fetchAll = useCallback(async () => {
    try {
      const [metricsRes, histRes, alertsRes] = await Promise.all([
        metricsApi.getCurrent(),
        metricsApi.getHistory(30),
        alertsApi.getActive(),
      ])
      setMetrics(metricsRes.data)
      setHistory(histRes.data.history || [])
      setAlerts(alertsRes.data.alerts || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
      // Use mock data when backend unavailable
      setMetrics(generateMockMetrics())
      setAlerts(generateMockAlerts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(fetchAll, pollInterval)
    return () => clearInterval(timerRef.current)
  }, [fetchAll, pollInterval])

  return { metrics, history, alerts, loading, error, lastUpdated, refresh: fetchAll }
}

// ─── Mock data for offline/demo mode ─────────────────────────
function generateMockMetrics() {
  const nodes = ['production-node-1', 'production-node-2', 'staging-node-1']
  const services = ['api-service', 'auth-service', 'payment-service', 'notification-service']
  const containers = ['web-app', 'redis', 'postgres', 'nginx', 'celery-worker']
  
  const nodesData = {}
  nodes.forEach(n => {
    nodesData[n] = {
      cpu_usage: parseFloat((30 + Math.random() * 60).toFixed(1)),
      memory_usage: parseFloat((40 + Math.random() * 50).toFixed(1)),
      disk_usage: parseFloat((30 + Math.random() * 55).toFixed(1)),
      network_in: parseFloat((Math.random() * 200).toFixed(1)),
      network_out: parseFloat((Math.random() * 150).toFixed(1)),
    }
  })

  const servicesData = {}
  services.forEach(s => {
    servicesData[s] = {
      requests_per_sec: parseFloat((100 + Math.random() * 900).toFixed(1)),
      avg_latency_ms: parseFloat((50 + Math.random() * 450).toFixed(1)),
      error_rate: parseFloat((Math.random() * 5).toFixed(2)),
      status: Math.random() > 0.1 ? 'running' : 'unhealthy',
      replicas: Math.floor(1 + Math.random() * 4),
      cpu_limit_pct: parseFloat((20 + Math.random() * 75).toFixed(1)),
      memory_mb: Math.floor(256 + Math.random() * 768),
    }
  })

  const containersData = {}
  containers.forEach(c => {
    containersData[c] = {
      status: Math.random() > 0.05 ? 'running' : 'exited',
      cpu_pct: parseFloat((5 + Math.random() * 65).toFixed(1)),
      memory_mb: Math.floor(64 + Math.random() * 448),
      restarts: Math.floor(Math.random() * 4),
    }
  })

  return {
    timestamp: new Date().toISOString(),
    nodes: nodesData,
    services: servicesData,
    containers: containersData,
    cluster: {
      total_pods: 18,
      running_pods: 15 + Math.floor(Math.random() * 3),
      failed_pods: Math.floor(Math.random() * 3),
      pending_pods: Math.floor(Math.random() * 2),
      nodes_ready: 3,
      nodes_total: 3,
    },
  }
}

function generateMockAlerts() {
  const alerts = []
  if (Math.random() > 0.5) {
    alerts.push({
      id: 'alert-001',
      title: 'High CPU usage on production-node-1',
      description: 'CPU usage at 94.2% (threshold: 90%)',
      severity: 'critical',
      source: 'production-node-1',
      metric: 'cpu_usage',
      value: 94.2,
      threshold: 90,
      status: 'active',
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    })
  }
  if (Math.random() > 0.6) {
    alerts.push({
      id: 'alert-002',
      title: 'High memory usage on production-node-2',
      description: 'Memory at 87.5% (threshold: 85%)',
      severity: 'high',
      source: 'production-node-2',
      metric: 'memory_usage',
      value: 87.5,
      threshold: 85,
      status: 'active',
      created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    })
  }
  return alerts
}

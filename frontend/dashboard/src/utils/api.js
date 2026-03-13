import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const metricsApi = {
  getCurrent: () => api.get('/api/metrics/current'),
  getHistory: (limit = 20) => api.get(`/api/metrics/history?limit=${limit}`),
  triggerCollection: () => api.post('/api/metrics/collect'),
}

export const alertsApi = {
  getActive: () => api.get('/api/alerts/active'),
  getHistory: () => api.get('/api/alerts/history'),
  acknowledge: (alertId) => api.post('/api/alerts/action', { alert_id: alertId, action: 'acknowledge' }),
  resolve: (alertId, remediation) => api.post('/api/alerts/action', { alert_id: alertId, action: 'resolve', remediation }),
}

export const diagnosisApi = {
  analyze: (alert) => api.post('/api/diagnosis/analyze', { alert }),
  demo: () => api.get('/api/diagnosis/demo'),
}

export const remediationApi = {
  plan: (rca) => api.post('/api/remediation/plan', { rca }),
  execute: (rca, autoExecute = false) => api.post('/api/remediation/execute', { rca, auto_execute: autoExecute }),
  getLog: () => api.get('/api/remediation/log'),
  demo: () => api.get('/api/remediation/demo'),
}

export const chatApi = {
  sendMessage: (message, history = []) => api.post('/api/chat/message', { message, history }),
}

export default api

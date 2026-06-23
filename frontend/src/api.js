import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

export const getHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export const getApplicationMetricDefinitions = async () => {
  const response = await api.get('/api/application-metric-definitions')
  return response.data
}

export const getApplicationMetrics = async (month) => {
  const response = await api.get('/api/application-metrics', {
    params: month ? { month } : {},
  })
  return response.data
}

export const upsertApplicationMetric = async (payload) => {
  const response = await api.post('/api/application-metrics', payload)
  return response.data
}

export default api
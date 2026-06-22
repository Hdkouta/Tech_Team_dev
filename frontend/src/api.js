import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

export const getHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export const getMetricDefinitions = async (kind) => {
  const response = await api.get('/api/metric-definitions', {
    params: kind ? { kind } : undefined,
  })
  return response.data
}

export const createMetricDefinition = async (payload) => {
  const response = await api.post('/api/metric-definitions', payload)
  return response.data
}

export const getMetrics = async (month, kind) => {
  const params = {}
  if (month) params.month = month
  if (kind) params.kind = kind

  const response = await api.get('/api/metrics', {
    params: Object.keys(params).length > 0 ? params : undefined,
  })
  return response.data
}

export const saveMetricRecord = async (payload) => {
  const response = await api.post('/api/metrics', payload)
  return response.data
}

export const getRecruitmentPipeline = async (month) => {
  const response = await api.get('/api/recruitment-pipeline', {
    params: month ? { month } : undefined,
  })
  return response.data
}

export const saveRecruitmentPipeline = async (payload) => {
  const response = await api.post('/api/recruitment-pipeline', payload)
  return response.data
}

export const getWebViews = async (month) => {
  const response = await api.get('/api/web-views', {
    params: month ? { month } : undefined,
  })
  return response.data
}

export const saveWebViewRecord = async (payload) => {
  const response = await api.post('/api/web-views', payload)
  return response.data
}

export default api
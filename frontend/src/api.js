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

// data.jsx が参照する旧関数名との互換レイヤー
export const getMetricDefinitions = async () => getApplicationMetricDefinitions()

export const getMetrics = async (month) => getApplicationMetrics(month)

export const saveMetricRecord = async (payload) => {
  const normalizedPayload = {
    month: payload.month,
    metric_definition_id: payload.metric_definition_id,
    target_total: payload.target_value ?? payload.target_total ?? 0,
    actual_new_graduate: payload.actual_value ?? payload.actual_new_graduate ?? 0,
    actual_mid_career: payload.actual_mid_career ?? 0,
    memo: payload.memo ?? '',
  }

  return upsertApplicationMetric(normalizedPayload)
}

export const getRecruitmentPipeline = async () => ({ rows: [] })

export const getWebViews = async () => ({ rows: [] })

export const saveRecruitmentPipeline = async () => ({ message: '保存しました' })

export const saveWebViewRecord = async () => ({ message: '保存しました' })

export default api
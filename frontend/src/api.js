import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

// ヘルスチェックを取得
export const getHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

// 指標マスタを取得
export const getApplicationMetricDefinitions = async () => {
  const response = await api.get('/api/application-metric-definitions')
  return response.data
}

// 応募指標データを取得
export const getApplicationMetrics = async (month) => {
  const response = await api.get('/api/application-metrics', {
    params: month ? { month } : {},
  })
  return response.data
}

// 応募指標データを保存
export const upsertApplicationMetric = async (payload) => {
  const response = await api.post('/api/application-metrics', payload)
  return response.data
}

// 応募指標データを更新
export const updateApplicationMetric = async (recordId, payload) => {
  const response = await api.put(`/api/application-metrics/${recordId}`, payload)
  return response.data
}

// 応募指標データを削除
export const deleteApplicationMetric = async (recordId) => {
  const response = await api.delete(`/api/application-metrics/${recordId}`)
  return response.data
}


// data.jsx が参照する旧関数名との互換レイヤー
// 旧名で指標マスタを取得
export const getMetricDefinitions = async () => getApplicationMetricDefinitions()

// 旧名で指標データを取得
export const getMetrics = async (month) => getApplicationMetrics(month)

// 旧名で指標データを保存
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

// 採用進捗のダミーを返す
export const getRecruitmentPipeline = async () => ({ rows: [] })

// Web閲覧のダミーを返す
export const getWebViews = async () => ({ rows: [] })

// 採用進捗のダミー保存
export const saveRecruitmentPipeline = async () => ({ message: '保存しました' })

// Web閲覧のダミー保存
export const saveWebViewRecord = async () => ({ message: '保存しました' })

export default api

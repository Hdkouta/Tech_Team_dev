import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
})

export const getHealth = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export default api
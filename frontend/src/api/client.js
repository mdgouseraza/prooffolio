import axios from 'axios'

const memory = { access: null }

export function setAccessToken(token) {
  memory.access = token
}

export function getAccessToken() {
  return memory.access
}

export const api = axios.create({
  baseURL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '65224') 
    ? 'http://localhost:8000/api' 
    : 'https://prooffolio.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const t = memory.access
  if (t) {
    config.headers.Authorization = `Bearer ${t}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const refresh = localStorage.getItem('refresh') // 🔥 FIX

        const { data } = await api.post('/auth/token/refresh/', {
          refresh,
        })

        if (data?.access) {
          memory.access = data.access
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        }
      } catch {
        memory.access = null
      }
    }

    return Promise.reject(err)
  }
)

import axios from 'axios'

const memory = { access: null }

export function setAccessToken(token) {
  memory.access = token
}

export function getAccessToken() {
  return memory.access
}

export const api = axios.create({
  baseURL: 'https://prooffolio.onrender.com/api',
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
        const { data } = await axios.post(
          'https://prooffolio.onrender.com/api/auth/token/refresh/',
          {},
          { withCredentials: true },
        )
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
  },
)

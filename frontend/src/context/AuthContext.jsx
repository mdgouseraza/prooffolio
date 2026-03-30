import axios from 'axios'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getAccessToken, setAccessToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me/')
      setUser(data)
      return data
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let token = getAccessToken()
      if (!token) {
        try {
          const { data } = await api.post('/auth/token/refresh/', {})
          if (data?.access) {
            token = data.access
            setAccessToken(data.access)
          }
        } catch {
          /* no session */
        }
      }
      if (cancelled) return
      if (getAccessToken()) await refreshMe()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshMe])

  const loginWithTokens = useCallback(
    async (access) => {
      setAccessToken(access)
      await refreshMe()
    },
    [refreshMe],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout/')
    } catch {
      /* ignore */
    }
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshMe,
      loginWithTokens,
      logout,
    }),
    [user, loading, refreshMe, loginWithTokens, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

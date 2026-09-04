import { useCallback, useEffect, useState } from 'react'
import { apiFetch, fetchCsrfCookie } from '../api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkSession = useCallback(async () => {
    try {
      const data = await apiFetch('/user')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = useCallback(async ({ email, password }) => {
    setError(null)
    await fetchCsrfCookie()
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user ?? data)
    return data
  }, [])

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setError(null)
    await fetchCsrfCookie()
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    setUser(data.user ?? data)
    return data
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return { user, loading, error, login, register, logout, checkSession, isAuthenticated: Boolean(user) }
}
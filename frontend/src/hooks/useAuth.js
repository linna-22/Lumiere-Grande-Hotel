import { useCallback, useEffect, useState } from 'react'
import { apiFetch, setToken, clearToken } from '../api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkSession = useCallback(async () => {
    try {
      const res = await apiFetch('/user/me')
      setUser(res.data)
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
    const data = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.access_token) {
      setToken(data.access_token)
      setUser(data.user)
    }
    return data
  }, [])

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setError(null)
    const data = await apiFetch('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    if (data.access_token) setToken(data.access_token)
    setUser(data.user ?? data)
    return data
  }, [])

  const verifyOtp = useCallback(async ({ email, otp_code }) => {
    setError(null)
    const data = await apiFetch('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code }),
    })
    if (data.access_token) setToken(data.access_token)
    setUser(data.user ?? data)
    return data
  }, [])

  const logout = useCallback(async () => {
    await apiFetch('/logout', { method: 'POST' })
    clearToken()
    setUser(null)
  }, [])

  return { user, loading, error, login, register, verifyOtp, logout, checkSession, isAuthenticated: Boolean(user) }
}
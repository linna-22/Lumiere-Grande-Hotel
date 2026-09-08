import { useCallback, useEffect, useState } from 'react'
import { apiFetch, fetchCsrfCookie, setToken, clearToken } from '../api/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkSession = useCallback(async () => {
    try {
      const data = await apiFetch('/user/me')
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
    // requires_2fa === true means no token yet — caller must route to VerifyOtp.
    if (data.access_token) {
      setToken(data.access_token)
      setUser(data.user)
    }
    return data
  }, [])

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    setError(null)
    await fetchCsrfCookie()
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
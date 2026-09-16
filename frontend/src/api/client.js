const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const TOKEN_KEY = 'auth_token'
const LOGIN_TIME_KEY = 'auth_login_time'

// ========================================
// Frontend Session Duration
// ========================================

// 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}


// ========================================
// Token
// ========================================
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  const loginTime = localStorage.getItem(LOGIN_TIME_KEY)

  if (!token) {
    return null
  }

  /**
   * If an old token exists but doesn't have
   * our frontend timestamp, remove it.
   */
  if (!loginTime) {
    console.warn('[Auth] Token exists without login timestamp.')
    clearToken()
    return null
  }

  const loginTimestamp = Number(loginTime)

  /**
   * Protect against an invalid timestamp.
   */
  if (!Number.isFinite(loginTimestamp)) {
    console.warn('[Auth] Invalid login timestamp.')
    clearToken()
    return null
  }

  const elapsedTime = Date.now() - loginTimestamp

  /**
   * 24-hour frontend session expired.
   */
  if (elapsedTime >= SESSION_DURATION) {
    console.log('[Auth] Frontend session expired.')
    clearToken()
    return null
  }

  return token
}

// ========================================
// Set Token
// ========================================

export function setToken(token) {
  if (!token) return

  localStorage.setItem(TOKEN_KEY, token)

  // Start a new frontend session timer.
  localStorage.setItem(
    LOGIN_TIME_KEY,
    Date.now().toString()
  )
}


// ========================================
// Clear Token
// ========================================

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LOGIN_TIME_KEY)
}


// ========================================
// Check Session Expiration
// ========================================

export function isSessionExpired() {
  const token = localStorage.getItem(TOKEN_KEY)
  const loginTime = localStorage.getItem(LOGIN_TIME_KEY)

  if (!token || !loginTime) {
    return true
  }

  const elapsedTime = Date.now() - Number(loginTime)

  return elapsedTime >= SESSION_DURATION
}


// ========================================
// Main API Request
// ========================================

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      Accept: 'application/json',

      ...(isFormData
        ? {}
        : {
            'Content-Type': 'application/json',
          }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  })

  const contentType = res.headers.get('content-type') || ''

  let body

  if (contentType.includes('application/json')) {
    body = await res.json()
  } else {
    body = await res.text()
  }

  // Laravel says the token is invalid.
  if (res.status === 401) {
    clearToken()
  }

  if (!res.ok) {
    const message =
      (body && body.message) || res.statusText

    throw new ApiError(
      message,
      res.status,
      body
    )
  }

  return body
}


// ========================================
// File Download Helper
// ========================================

export async function apiDownload(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearToken()
  }

  if (!res.ok) {
    const contentType =
      res.headers.get('content-type') || ''

    let body

    if (contentType.includes('application/json')) {
      body = await res.json()
    } else {
      body = await res.text()
    }

    const message =
      (body && body.message) || res.statusText

    throw new ApiError(
      message,
      res.status,
      body
    )
  }

  return await res.blob()
}
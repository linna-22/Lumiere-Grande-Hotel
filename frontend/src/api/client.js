const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api'
const SANCTUM_BASE_URL = import.meta.env.VITE_SANCTUM_URL || 'http://localhost:9000'
const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function fetchCsrfCookie() {
  await fetch(`${SANCTUM_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

export async function apiFetch(path, options = {}) {
  const xsrfToken = getCookie('XSRF-TOKEN')
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const message = (body && body.message) || res.statusText
    throw new ApiError(message, res.status, body)
  }

  return body
}
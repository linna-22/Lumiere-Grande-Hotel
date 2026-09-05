const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const SANCTUM_BASE_URL = import.meta.env.VITE_SANCTUM_URL || 'http://localhost:8000'

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

export async function fetchCsrfCookie() {
  await fetch(`${SANCTUM_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })
}

export async function apiFetch(path, options = {}) {
  const xsrfToken = getCookie('XSRF-TOKEN')
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      // Only set Content-Type for JSON bodies — FormData needs the browser
      // to set its own Content-Type with the multipart boundary included.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
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
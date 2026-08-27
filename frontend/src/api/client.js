const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
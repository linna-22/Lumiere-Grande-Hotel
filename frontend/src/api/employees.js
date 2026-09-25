import { apiFetch } from './client'

export function listEmployees(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()

  return apiFetch(`/employees${query ? `?${query}` : ''}`)
}

export function createEmployee(data) {
  return apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getEmployee(id) {
  return apiFetch(`/employees/${id}`)
}

export function updateEmployee(id, data) {
  return apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteEmployee(id) {
  return apiFetch(`/employees/${id}`, {
    method: 'DELETE',
  })
}

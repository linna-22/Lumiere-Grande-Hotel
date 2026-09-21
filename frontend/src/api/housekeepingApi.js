import { apiFetch } from './client'

/**
 * All housekeeping API calls live in this file.
 *
 * CHECK THESE TWO THINGS against how your other pages call apiFetch:
 *  1. API_PREFIX  - set to '' if apiFetch already adds "/api" itself.
 *  2. request()   - if apiFetch already JSON-stringifies the body for you,
 *                   pass `data` directly instead of JSON.stringify(data).
 */
const API_PREFIX = ''

function request(path, method = 'GET', data) {
  const options = { method }

  if (data !== undefined) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(data)
  }

  return apiFetch(`${API_PREFIX}${path}`, options)
}

/**
 * Accepts [], { data: [] } or { data: { data: [] } } (Laravel pagination)
 * and always returns an array.
 */
export function toList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

// ---- Housekeeping routes (from your route:list) -------------------------
export const getTasks = () => request('/housekeeping/tasks')

export const createTask = (payload) =>
  request('/housekeeping/tasks', 'POST', payload)

export const updateTaskStatus = (id, status, notes) =>
  request(
    `/housekeeping/tasks/${id}/status`,
    'PATCH',
    notes ? { status, notes } : { status }
  )

export const approveTask = (id) =>
  request(`/housekeeping/tasks/${id}/approve`, 'POST')

export const assignStaff = (id, userId) =>
  request(`/housekeeping/tasks/${id}/assign`, 'PATCH', { assigned_to: userId })

// ---- Lookups for the forms (CONFIRM THESE ROUTES with `php artisan route:list`)
export const getRooms = () => request('/rooms')
export const getStaff = () => request('/admin/user')
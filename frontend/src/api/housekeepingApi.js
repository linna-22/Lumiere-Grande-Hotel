import { apiFetch } from './client'

function request(path, method = 'GET', data) {
  const options = { method }

  if (data !== undefined) {
    options.body = JSON.stringify(data)
  }

  return apiFetch(path, options)
}

export function toList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

export const getTasks = () =>
  request('/housekeeping/tasks')

export const createTask = (payload) =>
  request('/housekeeping/tasks', 'POST', payload)

export const updateTaskStatus = (id, status, notes) =>
  request(
    `/housekeeping/tasks/${id}/status`,
    'PATCH',
    notes ? { status, notes } : { status },
  )

export const approveTask = (id) =>
  request(`/housekeeping/tasks/${id}/approve`, 'POST')

export const assignStaff = (id, userId) =>
  request(`/housekeeping/tasks/${id}/assign`, 'PATCH', {
    assigned_to: userId,
  })

export const getRooms = () =>
  request('/rooms')

export const getStaff = () =>
  request('/admin/user')

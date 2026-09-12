// src/api/user.js
import { apiFetch } from './client'

export function changePassword(data) {
  return apiFetch('/user/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function updateOwnProfile(userId, data) {
  return apiFetch(`/admin/user/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
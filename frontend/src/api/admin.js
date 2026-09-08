import { apiFetch } from './client'

// Guests
export function listGuests() {
  return apiFetch('/admin/guests')
}

export function createWalkInGuest(data) {
  return apiFetch('/admin/guests/walk-in', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getGuest(id) {
  return apiFetch(`/admin/guests/${id}`)
}

// Rooms
export function createRoom(data) {
  return apiFetch('/admin/rooms/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateRoom(id, data) {
  return apiFetch(`/admin/rooms/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteRoom(id) {
  return apiFetch(`/admin/rooms/${id}`, { method: 'DELETE' })
}

// Room Types
export function createRoomType(data) {
  return apiFetch('/admin/room-types/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateRoomType(id, data) {
  return apiFetch(`/admin/room-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteRoomType(id) {
  return apiFetch(`/admin/room-types/${id}`, { method: 'DELETE' })
}
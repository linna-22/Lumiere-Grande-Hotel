import { apiFetch } from './client'

export async function searchCheckIn(query = '') {
  const params = new URLSearchParams()
  if (query.trim()) params.set('query', query.trim())
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch(`/check-in/search${suffix}`)
}

export function createWalkIn(data) {
  return apiFetch('/check-in/walk-in', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function verifyGuest(reservationId, data) {
  const form = new FormData()
  form.append('first_name', data.first_name || '')
  form.append('last_name', data.last_name || '')
  if (data.nationality) form.append('nationality', data.nationality)
  if (data.id_card) form.append('id_card', data.id_card)
  if (data.id_photo) form.append('id_photo', data.id_photo)

  return apiFetch(`/check-in/${reservationId}/verify-guest`, {
    method: 'POST',
    body: form,
  })
}

export function assignRoom(reservationId, roomId) {
  return apiFetch(`/check-in/${reservationId}/assign-room`, {
    method: 'POST',
    body: JSON.stringify({ room_id: roomId }),
  })
}

export function completeCheckIn(reservationCode, roomAssignments, paymentMethod = 'cash') {
  return apiFetch(`/check-in/reservation/${encodeURIComponent(reservationCode)}/check-in`, {
    method: 'POST',
    body: JSON.stringify({
      payment_method: paymentMethod,
      room_assignments: roomAssignments,
    }),
  })
}

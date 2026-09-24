import { apiFetch } from './client'

export async function getCheckedInGuests() {
  // The dedicated backend route currently points to a differently named
  // controller method, so use the working reservations endpoint as the
  // frontend source of truth for the checked-in list.
  return apiFetch('/reservations?status=checked_in&per_page=100')
}

export function getBillingSummary(reservationId) {
  return apiFetch(`/check-out/${reservationId}/billing`)
}

export function completeCheckOut(reservationId, payload = {}) {
  return apiFetch(`/check-out/${reservationId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

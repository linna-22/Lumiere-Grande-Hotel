import { apiFetch } from "./client";

export function updateReservation(id, data) {
  return apiFetch(`/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteReservation(id) {
  return apiFetch(`/reservations/${id}`, {
    method: "DELETE",
  });
}
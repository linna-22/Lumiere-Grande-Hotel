const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked-in',
  checked_out: 'Checked-out',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS = {
  paid: 'Paid',
  partially_paid: 'Partial',
  unpaid: 'Unpaid',
}

const day = (d) => String(d ?? '').slice(0, 10)

const formatDate = (d) => {
  const value = day(d)
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const nightsBetween = (from, to) => {
  const a = new Date(`${day(from)}T00:00:00`)
  const b = new Date(`${day(to)}T00:00:00`)
  const n = Math.round((b - a) / 86400000)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function normalizeReservation(r) {
  const guest = r.guest ?? {}
  const guestName =
    `${guest.first_name ?? ''} ${guest.last_name ?? ''}`.trim() || 'Guest'

  const rooms = r.reservation_rooms ?? []

  // NOTE: adjust these two field names to your rooms / room_types columns.
  const roomNumbers = rooms
    .map((x) => x.room?.room_number)
    .filter(Boolean)
  const roomTypes = [
    ...new Set(rooms.map((x) => x.room_type?.name).filter(Boolean)),
  ]

  return {
    dbId: r.id ?? r.reservation_id,
    id: r.reservation_code,
    statusKey: r.status,
    guest: guestName,
    email: guest.email ?? '',
    // Physical rooms are only assigned at check-in.
    room: roomNumbers.length ? roomNumbers.join(', ') : 'Unassigned',
    roomType: roomTypes.join(', ') || '—',
    checkIn: formatDate(r.check_in_date),
    checkOut: formatDate(r.check_out_date),
    nights: nightsBetween(r.check_in_date, r.check_out_date),
    status: STATUS_LABELS[r.status] ?? r.status,
    payment: PAYMENT_LABELS[r.payment_status] ?? r.payment_status,
    // created_by is null for public website bookings.
    source: r.creator ? 'Staff' : 'Website',
    amount: Number(r.total_amount ?? 0),
    paid: Number(r.paid_amount ?? 0),
    raw: r,
  }
}
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Camera, CheckCircle2, KeyRound, Loader2, Search, UserPlus } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { apiFetch } from '../../api/client'
import { searchCheckIn, createWalkIn, verifyGuest, assignRoom, completeCheckIn } from '../../api/checkinApi'

const STEPS = [
  { key: 'search', label: 'Search Reservation', icon: Search },
  { key: 'verify', label: 'Verify Guest', icon: Camera },
  { key: 'assign', label: 'Assign Room', icon: KeyRound },
  { key: 'complete', label: 'Complete', icon: CheckCircle2 },
]

function unwrapList(response) {
  const data = response?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function guestName(reservation) {
  const guest = reservation?.guest || {}
  return [guest.first_name, guest.last_name].filter(Boolean).join(' ') || guest.name || reservation?.guest_name || 'Guest'
}

function mapReservation(r) {
  const guest = r.guest || {}
  const rr = r.reservation_rooms || r.reservationRooms || []
  const firstRoom = rr[0]?.room || null

  return {
    raw: r,
    id: r.id,
    code: r.reservation_code,
    guestName: guestName(r),
    firstName: guest.first_name || '',
    lastName: guest.last_name || '',
    email: guest.email || '',
    phone: guest.phone || '',
    nationality: guest.nationality || '',
    idCard: guest.id_card_no || '',
    room: firstRoom?.room_number || 'Not assigned',
    roomType: rr[0]?.roomType?.name || rr[0]?.room_type?.name || 'Standard',
    checkIn: r.check_in_date || '',
    checkOut: r.check_out_date || '',
    status: String(r.status || '').toUpperCase(),
    paid: r.payment_status === 'paid',
    reservationRooms: rr,
  }
}

export default function CheckIn({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [reservations, setReservations] = useState([])
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [idType, setIdType] = useState('Passport')
  const [idNumber, setIdNumber] = useState('')
  const [nationality, setNationality] = useState('')
  const [idPhoto, setIdPhoto] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  async function loadReservations(search = query) {
    setLoading(true)
    setError('')
    try {
      const response = await searchCheckIn(search)
      setReservations(unwrapList(response).map(mapReservation))
    } catch (err) {
      setError(err.message || 'Unable to load reservations.')
    } finally {
      setLoading(false)
    }
  }

  async function loadRooms() {
    setRoomsLoading(true)
    try {
      const response = await apiFetch('/rooms?status=available&per_page=100')
      setRooms(response?.data || [])
    } catch (err) {
      setError(err.message || 'Unable to load available rooms.')
    } finally {
      setRoomsLoading(false)
    }
  }

  useEffect(() => {
    loadReservations('')
    loadRooms()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return reservations
    return reservations.filter((r) =>
      [r.guestName, r.code, r.room, r.phone].some((value) => String(value || '').toLowerCase().includes(q)),
    )
  }, [reservations, query])

  function handleSelectReservation(reservation) {
    setSelectedReservation(reservation)
    setIdNumber(reservation.idCard || '')
    setNationality(reservation.nationality || '')
    setSelectedRoomId('')
    setStepIndex(1)
    setError('')
  }

  async function handleVerifyAndContinue(event) {
    event.preventDefault()
    if (!selectedReservation) return

    setLoading(true)
    setError('')
    try {
      await verifyGuest(selectedReservation.id, {
        first_name: selectedReservation.firstName,
        last_name: selectedReservation.lastName,
        nationality,
        id_card: idNumber,
        id_photo: idPhoto,
      })
      await loadRooms()
      setStepIndex(2)
    } catch (err) {
      setError(err.message || 'Guest verification failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignRoom() {
    if (!selectedReservation || !selectedRoomId) return

    setLoading(true)
    setError('')
    try {
      await assignRoom(selectedReservation.id, Number(selectedRoomId))
      setStepIndex(3)
    } catch (err) {
      setError(err.message || 'Room assignment failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteCheckIn() {
    if (!selectedReservation || !selectedRoomId) return

    const reservationRoom = selectedReservation.reservationRooms?.[0]
    if (!reservationRoom?.id) {
      setError('This reservation has no reservation room to check in.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await completeCheckIn(
        selectedReservation.code,
        [{
          reservation_room_id: reservationRoom.id,
          room_id: Number(selectedRoomId),
        }],
        paymentMethod,
      )
      setShowSuccessModal(true)
    } catch (err) {
      setError(err.message || 'Check-in could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  // async function handleWalkIn() {
  //   const first_name = window.prompt('Guest first name')
  //   if (!first_name) return
  //   const last_name = window.prompt('Guest last name') || ''
  //   const phone = window.prompt('Guest phone') || ''
  //   if (!phone) return

  //   setLoading(true)
  //   setError('')
  //   try {
  //     const response = await createWalkIn({ first_name, last_name, phone })
  //     const mapped = mapReservation(response?.reservation)
  //     setReservations((current) => [mapped, ...current])
  //     handleSelectReservation(mapped)
  //   } catch (err) {
  //     setError(err.message || 'Unable to create walk-in.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  function reset() {
    setShowSuccessModal(false)
    setSelectedReservation(null)
    setSelectedRoomId('')
    setIdNumber('')
    setNationality('')
    setIdPhoto(null)
    setStepIndex(0)
    loadReservations(query)
    loadRooms()
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="Check In" onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">Check In</h1>
              <p className="text-sm text-slate-400 mt-1">Process guest arrivals using the live Laravel API.</p>
            </div>
            {/* <button onClick={handleWalkIn} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold px-4 py-2.5 rounded-lg">
              <UserPlus size={16} /> Walk-in Guest
            </button> */}
          </div>

          {error && <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 px-4 py-3 text-sm">{error}</div>}

          <div className="bg-base-850 border border-base-border rounded-2xl mt-6 p-6 sm:p-8">
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                const isActive = i === stepIndex
                const isDone = i < stepIndex
                return (
                  <div key={step.key} className={`flex items-center ${i === STEPS.length - 1 ? '' : 'flex-1'}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-400 text-base-950' : 'bg-base-800 border border-base-border text-slate-500'}`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-amber-400' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</span>
                    </div>
                    {i !== STEPS.length - 1 && <div className={`h-px flex-1 mx-3 mb-6 ${isDone ? 'bg-emerald-500' : 'bg-base-border'}`} />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6">
            <div className="bg-base-850 border border-base-border rounded-2xl p-5 h-fit">
              <h2 className="text-white font-serif font-bold text-lg mb-4">Search Reservation</h2>
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadReservations(query)} placeholder="Guest name, booking code, phone..." className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200" />
              </div>
              {/* <button onClick={() => loadReservations(query)} className="w-full mb-4 bg-base-800 border border-base-border text-slate-200 rounded-lg py-2 text-sm">Search</button> */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {loading && reservations.length === 0 && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-amber-400" /></div>}
                {filtered.map((r) => (
                  <button key={r.id} onClick={() => handleSelectReservation(r)} className={`w-full text-left p-3 rounded-xl border ${selectedReservation?.id === r.id ? 'bg-base-800 border-amber-400/50' : 'bg-base-800/50 border-base-border hover:bg-base-800'}`}>
                    <p className="text-white text-sm font-semibold truncate">{r.guestName}</p>
                    <p className="text-xs text-slate-400">{r.code} · Room {r.room}</p>
                    <p className="text-xs text-slate-500 mt-1">{r.checkIn} → {r.checkOut}</p>
                  </button>
                ))}
                {!loading && filtered.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No eligible reservations found.</p>}
              </div>
            </div>

            <div className="space-y-6">
              {!selectedReservation && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <ArrowRight size={22} className="text-slate-500 mb-4" />
                  <h3 className="text-white font-serif font-bold text-lg">Select a reservation to begin check-in</h3>
                  <p className="text-sm text-slate-500 mt-1">Search by guest name, booking code, or phone.</p>
                </div>
              )}

              {selectedReservation && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Guest & Reservation Details</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Guest</p><p className="text-white font-semibold">{selectedReservation.guestName}</p></div>
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Booking Code</p><p className="text-white font-semibold">{selectedReservation.code}</p></div>
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Phone</p><p className="text-white font-semibold">{selectedReservation.phone || '—'}</p></div>
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Reserved Room</p><p className="text-white font-semibold">{selectedReservation.room}</p></div>
                  </div>
                </div>
              )}

              {selectedReservation && stepIndex === 1 && (
                <form onSubmit={handleVerifyAndContinue} className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Verify Guest Identity</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input value={selectedReservation.firstName} onChange={(e) => setSelectedReservation((r) => ({ ...r, firstName: e.target.value }))} placeholder="First name" className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" required />
                    <input value={selectedReservation.lastName} onChange={(e) => setSelectedReservation((r) => ({ ...r, lastName: e.target.value }))} placeholder="Last name" className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" required />
                    <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Nationality" className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
                    <div className="flex gap-2">
                      <select value={idType} onChange={(e) => setIdType(e.target.value)} className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white"><option>Passport</option><option>ID Card</option></select>
                      <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder={idType === 'Passport' ? 'Passport number' : 'ID number'} className="flex-1 bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
                    </div>
                    {/* h u<input type="file" accept="image/*,.pdf" onChange={(e) => setIdPhoto(e.target.files?.[0] || null)} className="sm:col-span-2 text-sm text-slate-400" /> */}
                  </div>
                  <button disabled={loading} className="mt-5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold px-5 py-2.5 rounded-lg">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
                </form>
              )}

              {selectedReservation && stepIndex === 2 && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Assign Available Room</h2>
                  {roomsLoading ? <Loader2 className="animate-spin text-amber-400" /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rooms.map((room) => (
                        <button key={room.id} onClick={() => setSelectedRoomId(String(room.id))} className={`text-left p-4 rounded-xl border ${String(selectedRoomId) === String(room.id) ? 'border-amber-400 bg-amber-400/10' : 'border-base-border bg-base-800 hover:bg-base-700'}`}>
                          <p className="text-white font-semibold">Room {room.room_number}</p>
                          <p className="text-xs text-slate-400 mt-1">{room.room_type?.name || room.roomType?.name || 'Room'} · Floor {room.floor ?? '—'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={handleAssignRoom} disabled={!selectedRoomId || loading} className="mt-5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold px-5 py-2.5 rounded-lg">{loading ? 'Assigning...' : 'Assign Room'}</button>
                </div>
              )}

              {selectedReservation && stepIndex === 3 && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Settle & Complete Check-In</h2>
                  <p className="text-sm text-slate-400 mb-4">Room {rooms.find((r) => String(r.id) === String(selectedRoomId))?.room_number || selectedRoomId} will be occupied after successful check-in.</p>
                  <div className="flex gap-3 mb-5">
                    {['cash', 'bakong_khqr'].map((method) => <button key={method} onClick={() => setPaymentMethod(method)} className={`px-4 py-2 rounded-lg border text-sm ${paymentMethod === method ? 'border-amber-400 text-amber-400' : 'border-base-border text-slate-300'}`}>{method === 'cash' ? 'Cash' : 'Bakong KHQR'}</button>)}
                  </div>
                  <button onClick={handleCompleteCheckIn} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg">{loading ? 'Completing...' : 'Complete Check-In'}</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-sm p-7 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h2 className="text-white font-bold text-xl mt-4">Check-In Complete</h2>
            <p className="text-slate-400 text-sm mt-2">{selectedReservation?.guestName} has been checked in successfully.</p>
            <button onClick={reset} className="mt-6 w-full bg-emerald-400 hover:bg-emerald-500 text-base-950 font-semibold py-2.5 rounded-lg">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

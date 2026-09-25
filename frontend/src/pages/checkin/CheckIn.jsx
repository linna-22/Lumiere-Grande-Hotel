import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Camera, CheckCircle2, KeyRound, Loader2, Search, UserPlus, Banknote, WalletCards, AlertCircle, CalendarDays } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import CashPayment from '../../components/reservations/CashPayment'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { apiFetch } from '../../api/client'
import { searchCheckIn, createWalkIn, verifyGuest, assignRoom, completeCheckIn, generateCheckInKhqr, verifyCheckInKhqr } from '../../api/checkinApi'

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
  const [payment, setPayment] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const cashPaymentRef = useRef(null)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [walkInIdType, setWalkInIdType] = useState('Passport')
  const [walkInIdNumber, setWalkInIdNumber] = useState('')
  const [walkInNationality, setWalkInNationality] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const [walkInForm, setWalkInForm] = useState({ first_name: '', last_name: '', phone: '', email: '', check_in_date: today, check_out_date: '' })

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
    setIsWalkIn(false)
    setSelectedReservation(reservation)
    setIdNumber(reservation.idCard || '')
    setNationality(reservation.nationality || '')
    const bookedRooms = reservation.reservationRooms || []
    const firstBookedRoom = bookedRooms[0]?.room_id || bookedRooms[0]?.room?.id || ''
    setSelectedRoomId(firstBookedRoom ? String(firstBookedRoom) : '')
    setStepIndex(1)
    setPayment(null)
    setPaymentError('')
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
      const bookedRooms = selectedReservation.reservationRooms || []
      const hasBookedPhysicalRoom = bookedRooms.length > 0 && bookedRooms.every((rr) => rr.room_id || rr.room?.id)
      setStepIndex(hasBookedPhysicalRoom ? 3 : 2)
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
      const response = await assignRoom(selectedReservation.id, Number(selectedRoomId))
      const updated = mapReservation(response?.reservation || response?.data || response)
      setSelectedReservation(updated)
      setSelectedRoomId(String(updated.reservationRooms?.[0]?.room_id || selectedRoomId))
      setStepIndex(3)
    } catch (err) {
      setError(err.message || 'Room assignment failed.')
    } finally {
      setLoading(false)
    }
  }

  async function completeAfterCashPayment() {
    if (!selectedReservation) return

    const assignments = (selectedReservation.reservationRooms || []).map((rr) => ({
      reservation_room_id: rr.id,
      room_id: Number(rr.room_id || rr.room?.id),
    }))

    if (!assignments.length || assignments.some((item) => !item.room_id)) {
      setError('Please assign a room before completing check-in.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await completeCheckIn(selectedReservation.code, assignments, 'cash')
      setShowSuccessModal(true)
    } catch (err) {
      setError(err.message || 'Check-in could not be completed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteCheckIn() {
    if (!selectedReservation) return

    // Cash uses the existing CashPayment component to create/process the payment.
    // The receptionist only needs one button: Complete Check-In.
    if (paymentMethod === 'cash' && needsPayment && !payment?.paid) {
      const cashButton = Array.from(cashPaymentRef.current?.querySelectorAll('button') || [])
        .find((button) => button.textContent?.trim() === 'Add reservation')

      if (!cashButton) {
        setError('Cash payment button is not available.')
        return
      }

      cashButton.click()
      return
    }

    const assignments = (selectedReservation.reservationRooms || []).map((rr) => ({
      reservation_room_id: rr.id,
      room_id: Number(rr.room_id || rr.room?.id),
    }))

    if (!assignments.length || assignments.some((item) => !item.room_id)) {
      setError('Please assign a room before completing check-in.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await completeCheckIn(selectedReservation.code, assignments, paymentMethod)
      setShowSuccessModal(true)
    } catch (err) {
      setError(err.message || 'Check-in could not be completed.')
    } finally {
      setLoading(false)
    }
  }


  const remainingBalance = Math.max(0, Number(selectedReservation?.raw?.total_amount || 0) - Number(selectedReservation?.raw?.paid_amount || 0))
  const invoiceId = selectedReservation?.raw?.invoice?.id || selectedReservation?.raw?.invoice_id || null
  const needsPayment = remainingBalance > 0.009 && selectedReservation?.raw?.payment_status !== 'paid'

  async function handleGenerateKhqr() {
    if (!invoiceId) {
      setPaymentError('Invoice is not available for this check-in.')
      return
    }
    if (remainingBalance <= 0) {
      setPaymentError('There is no remaining balance to pay.')
      return
    }
    setPaymentLoading(true)
    setPaymentError('')
    try {
      const data = await generateCheckInKhqr({
        reservationId: selectedReservation.id,
        invoiceId,
        amount: remainingBalance,
        currency: 'USD',
      })
      setPayment(data)
      setShowQrModal(true)
    } catch (err) {
      setPaymentError(err.message || 'Failed to generate KHQR payment.')
    } finally {
      setPaymentLoading(false)
    }
  }

  useEffect(() => {
    if (!showQrModal || !payment?.payment_id) return undefined
    let stopped = false
    let intervalId
    let timeoutId

    const verify = async () => {
      try {
        const data = await verifyCheckInKhqr(payment.payment_id)
        if (data.paid === true) {
          stopped = true
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          setShowQrModal(false)
          setPayment({ ...payment, paid: true, status: 'completed' })
          setPaymentMethod('bakong_khqr')
          setPaymentError('')
        }
      } catch (err) {
        if (!stopped) setPaymentError(err.message || 'Unable to verify KHQR payment.')
      }
    }

    verify()
    intervalId = setInterval(verify, 3000)
    timeoutId = setTimeout(() => {
      stopped = true
      clearInterval(intervalId)
      setShowQrModal(false)
      setPaymentError('KHQR payment window expired. Please generate a new QR code.')
    }, 5 * 60 * 1000)

    return () => {
      stopped = true
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [showQrModal, payment?.payment_id])

  function openWalkInModal() {
    setWalkInForm({ first_name: '', last_name: '', phone: '', email: '', check_in_date: today, check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] })
    setWalkInIdType('Passport')
    setWalkInIdNumber('')
    setWalkInNationality('')
    setError('')
    setShowWalkInModal(true)
  }

  async function handleWalkIn(event) {
    event.preventDefault()
    const { first_name, last_name, phone, email, check_in_date, check_out_date } = walkInForm
    if (!first_name.trim() || !last_name.trim() || !phone.trim() || !check_in_date || !check_out_date) return
    if (check_out_date <= check_in_date) {
      setError('Check-out date must be after the check-in date.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await createWalkIn({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        check_in_date,
        check_out_date,
        nationality: walkInNationality.trim() || undefined,
        id_type: walkInIdType,
        id_number: walkInIdNumber.trim() || undefined,
      })
      const mapped = mapReservation(response?.reservation)
      const walkInMapped = {
        ...mapped,
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        nationality: walkInNationality.trim(),
        idCard: walkInIdNumber.trim(),
        idType: walkInIdType,
        checkIn: check_in_date,
        checkOut: check_out_date,
      }
      setReservations((current) => [walkInMapped, ...current])
      setShowWalkInModal(false)
      setIsWalkIn(true)
      setSelectedReservation(walkInMapped)
      setIdNumber(walkInIdNumber.trim())
      setNationality(walkInNationality.trim())
      setSelectedRoomId('')
      setPayment(null)
      setPaymentError('')
      setStepIndex(2)
    } catch (err) {
      setError(err.message || 'Unable to create walk-in.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setShowSuccessModal(false)
    setSelectedReservation(null)
    setIsWalkIn(false)
    setSelectedRoomId('')
    setIdNumber('')
    setNationality('')
    setIdPhoto(null)
    setPayment(null)
    setShowQrModal(false)
    setPaymentError('')
    setStepIndex(0)
    loadReservations(query)
    loadRooms()
  }

  return (
    <>
      <style>{`
        .cash-payment-checkin-wrapper > div > div:last-child > button:last-child {
          display: none;
        }
      `}</style>
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
            <button onClick={openWalkInModal} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold px-4 py-2.5 rounded-lg">
              <UserPlus size={16} /> Walk-in Guest
            </button>
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
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Check-in Date</p><p className="text-white font-semibold">{selectedReservation.checkIn || '—'}</p></div>
                    <div className="bg-base-800 rounded-lg p-3"><p className="text-xs text-slate-500">Check-out Date</p><p className="text-white font-semibold">{selectedReservation.checkOut || '—'}</p></div>
                  </div>
                </div>
              )}

              {selectedReservation && stepIndex === 1 && (
                <form onSubmit={handleVerifyAndContinue} className="bg-base-850 border border-base-border rounded-2xl p-6">
                  {selectedReservation.reservationRooms?.length > 0 ? (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-white font-serif font-bold text-lg">Booked Guest Information</h2>
                          <p className="text-sm text-slate-400 mt-1">Guest information from the existing reservation. ID number is read-only.</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">Existing Booking</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name</label>
                          <input value={selectedReservation.firstName} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name</label>
                          <input value={selectedReservation.lastName} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                          <input value={selectedReservation.phone || '—'} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                          <input value={selectedReservation.email || '—'} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Nationality</label>
                          <input value={selectedReservation.nationality || '—'} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">ID Number</label>
                          <input value={idNumber || 'Not provided'} readOnly className="w-full bg-base-800/70 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                        The guest details above were retrieved from the reservation. They cannot be changed during check-in.
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-white font-serif font-bold text-lg mb-4">Verify Guest Identity</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input value={selectedReservation.firstName} onChange={(e) => setSelectedReservation((r) => ({ ...r, firstName: e.target.value }))} placeholder="First name" className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" required />
                        <input value={selectedReservation.lastName} placeholder="Last name" onChange={(e) => setSelectedReservation((r) => ({ ...r, lastName: e.target.value }))} className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" required />
                        <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Nationality" className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
                        <div className="flex gap-2">
                          <select value={idType} onChange={(e) => setIdType(e.target.value)} className="bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white"><option>Passport</option><option>ID Card</option></select>
                          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder={idType === 'Passport' ? 'Passport number' : 'ID number'} className="flex-1 bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
                        </div>
                        {/* h u<input type="file" accept="image/*,.pdf" onChange={(e) => setIdPhoto(e.target.files?.[0] || null)} className="sm:col-span-2 text-sm text-slate-400" /> */}
                      </div>
                    </>
                  )}
                  <button disabled={loading} className="mt-5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold px-5 py-2.5 rounded-lg">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
                </form>
              )}

              {selectedReservation && stepIndex === 2 && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Assign Available Room</h2>
                  <p className="text-sm text-slate-400 mb-4">This guest is a walk-in, so select an available physical room.</p>
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
                  <h2 className="text-white font-serif font-bold text-lg mb-2">Payment & Complete Check-In</h2>
                  <p className="text-sm text-slate-400 mb-4">
                    {selectedReservation.reservationRooms?.length > 0
                      ? `Room${selectedReservation.reservationRooms.length > 1 ? 's' : ''}: ${selectedReservation.reservationRooms.map((rr) => rr.room?.room_number || rr.room_id).join(', ')}`
                      : 'Room assigned'}
                  </p>

                  {needsPayment ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button type="button" onClick={() => { setPaymentMethod('cash'); setPaymentError('') }} className={`rounded-xl border p-4 text-left ${paymentMethod === 'cash' ? 'border-amber-400 bg-amber-400/10' : 'border-base-border bg-base-800'}`}>
                          <Banknote className="text-emerald-400 mb-2" size={20} />
                          <p className="text-white font-semibold">Cash</p>
                          <p className="text-xs text-slate-400 mt-1">Accept cash and calculate change</p>
                        </button>
                        <button type="button" onClick={() => { setPaymentMethod('bakong_khqr'); setPaymentError('') }} className={`rounded-xl border p-4 text-left ${paymentMethod === 'bakong_khqr' ? 'border-amber-400 bg-amber-400/10' : 'border-base-border bg-base-800'}`}>
                          <WalletCards className="text-amber-400 mb-2" size={20} />
                          <p className="text-white font-semibold">Bakong KHQR</p>
                          <p className="text-xs text-slate-400 mt-1">Generate QR and verify payment</p>
                        </button>
                      </div>

                      {paymentMethod === 'cash' && invoiceId && (
                        <div ref={cashPaymentRef} className="cash-payment-checkin-wrapper">
                          <CashPayment
                            apiBaseUrl={import.meta.env.VITE_API_URL || '/api'}
                            amountToPay={remainingBalance}
                            reservationId={selectedReservation.id}
                            invoiceId={invoiceId}
                            onSuccess={(data) => {
                              setPayment({ ...(data || {}), paid: true, status: 'completed', method: 'cash' })
                              setPaymentError('')
                              completeAfterCashPayment()
                            }}
                          />
                        </div>
                      )}

                      {paymentMethod === 'bakong_khqr' && (
                        <div className="rounded-xl border border-base-border bg-base-800 p-5">
                          <p className="text-white font-semibold">Remaining balance</p>
                          <p className="text-2xl font-bold text-amber-400 mt-1">${remainingBalance.toFixed(2)}</p>
                          <button type="button" onClick={handleGenerateKhqr} disabled={paymentLoading || payment?.paid} className="mt-4 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold px-5 py-2.5 rounded-lg">
                            {payment?.paid ? 'Payment Verified' : paymentLoading ? 'Generating QR...' : 'Generate Bakong KHQR'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 mb-4">
                      <p className="text-emerald-300 font-semibold">Payment already settled</p>
                      <p className="text-xs text-slate-400 mt-1">No additional payment is required before check-in.</p>
                    </div>
                  )}

                  {paymentError && <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 px-4 py-3 text-sm flex gap-2"><AlertCircle size={16} className="mt-0.5" />{paymentError}</div>}

                  <button
                    onClick={handleCompleteCheckIn}
                    disabled={loading || (paymentMethod === 'bakong_khqr' && needsPayment && !payment?.paid)}
                    className="mt-5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg"
                  >
                    {loading ? 'Completing...' : 'Complete Check-In'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleWalkIn} className="bg-base-900 border border-base-border rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-white font-bold text-xl">Walk-in Guest</h2>
                <p className="text-slate-400 text-sm mt-1">Enter the guest information before creating the walk-in reservation.</p>
              </div>
              <button type="button" onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name *</label>
                <input required value={walkInForm.first_name} onChange={(e) => setWalkInForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="First name" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name *</label>
                <input required value={walkInForm.last_name} onChange={(e) => setWalkInForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Last name" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone *</label>
                <input required type="tel" value={walkInForm.phone} onChange={(e) => setWalkInForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone number" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input type="email" value={walkInForm.email} onChange={(e) => setWalkInForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
                          <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nationality *</label>
                <input required value={walkInNationality} onChange={(e) => setWalkInNationality(e.target.value)} placeholder="Nationality" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">ID Type *</label>
                <select required value={walkInIdType} onChange={(e) => setWalkInIdType(e.target.value)} className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white">
                  <option value="Passport">Passport</option>
                  <option value="National ID">National ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">ID Number *</label>
                <input required value={walkInIdNumber} onChange={(e) => setWalkInIdNumber(e.target.value)} placeholder="ID / Passport number" className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Check-in Date *</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input required type="date" min={today} value={walkInForm.check_in_date} onChange={(e) => setWalkInForm((f) => ({ ...f, check_in_date: e.target.value, check_out_date: f.check_out_date && f.check_out_date > e.target.value ? f.check_out_date : '' }))} className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Check-out Date *</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input required type="date" min={walkInForm.check_in_date ? new Date(new Date(walkInForm.check_in_date).getTime() + 86400000).toISOString().split('T')[0] : today} value={walkInForm.check_out_date} onChange={(e) => setWalkInForm((f) => ({ ...f, check_out_date: e.target.value }))} className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowWalkInModal(false)} className="px-4 py-2.5 rounded-lg border border-base-border text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold">
                {loading ? 'Creating...' : 'Create Walk-in'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showQrModal && payment?.qr_code && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-md p-7 text-center">
            <h2 className="text-white font-bold text-xl">Scan Bakong KHQR</h2>
            <p className="text-slate-400 text-sm mt-2">Ask the guest to scan this QR code and complete the payment.</p>
            <div className="bg-white rounded-2xl p-5 mx-auto mt-5 w-fit">
              <QRCodeSVG value={payment.qr_code} size={240} includeMargin />
            </div>
            <p className="text-amber-400 text-lg font-bold mt-5">${remainingBalance.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Waiting for Bakong payment confirmation...</p>
            {paymentError && <p className="text-xs text-rose-400 mt-3">{paymentError}</p>}
            <button type="button" onClick={() => setShowQrModal(false)} className="mt-5 w-full border border-base-border text-slate-300 hover:text-white py-2.5 rounded-lg">Close</button>
          </div>
        </div>
      )}

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
    </>
  )
}

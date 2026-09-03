import { useMemo, useState } from 'react'
import {
  Search,
  LogOut as CheckOutIcon,
  CheckCircle2,
  Printer,
  Mail,
  X,
} from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

// Mock data — replace with a real fetch (e.g. GET /api/checkouts?status=in-house)
const MOCK_GUESTS = [
  {
    id: 'HD-2024',
    guestName: 'Santiago Reyes',
    initials: 'SR',
    avatarColor: 'bg-sky-500/30 text-sky-300',
    room: '401',
    roomType: 'Suite',
    checkIn: '2024-07-31',
    checkOut: '2024-08-04',
    nights: 4,
    ratePerNight: 15000,
    paid: true,
    extraCharges: [
      { label: 'Mini Bar (Day 1)', amount: 850 },
      { label: 'Restaurant - Breakfast x2', amount: 1200 },
      { label: 'Laundry Service', amount: 480 },
      { label: 'Spa - 60min Massage', amount: 2800 },
    ],
  },
  {
    id: 'HD-2025',
    guestName: 'Maria Santos',
    initials: 'MS',
    avatarColor: 'bg-rose-500/30 text-rose-300',
    room: '201',
    roomType: 'Deluxe',
    checkIn: '2024-07-31',
    checkOut: '2024-08-02',
    nights: 2,
    ratePerNight: 6500,
    paid: true,
    extraCharges: [{ label: 'Room Service', amount: 650 }],
  },
  {
    id: 'HD-2027',
    guestName: 'Ana Villanueva',
    initials: 'AV',
    avatarColor: 'bg-sky-500/30 text-sky-300',
    room: '501',
    roomType: 'Presidential Suite',
    checkIn: '2024-08-01',
    checkOut: '2024-08-07',
    nights: 6,
    ratePerNight: 25000,
    paid: true,
    extraCharges: [],
  },
  {
    id: 'HD-2029',
    guestName: 'Grace Tan',
    initials: 'GT',
    avatarColor: 'bg-violet-500/30 text-violet-300',
    room: '402',
    roomType: 'Suite',
    checkIn: '2024-08-02',
    checkOut: '2024-08-05',
    nights: 3,
    ratePerNight: 15000,
    paid: false,
    extraCharges: [{ label: 'Mini Bar', amount: 1100 }],
  },
  {
    id: 'HD-2030',
    guestName: 'Roberto Garcia',
    initials: 'RG',
    avatarColor: 'bg-amber-500/30 text-amber-300',
    room: '101',
    roomType: 'Standard',
    checkIn: '2024-08-02',
    checkOut: '2024-08-05',
    nights: 3,
    ratePerNight: 3500,
    paid: true,
    extraCharges: [],
  },
]

const INSPECTION_ITEMS = ['Bathroom', 'Bedroom', 'Mini Bar', 'Electronics', 'Furniture', 'Balcony']
const VAT_RATE = 0.12

function formatCurrency(n) {
  return `₱${n.toLocaleString('en-US')}`
}

export default function CheckOut({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)
  const [inspectedItems, setInspectedItems] = useState({})
  const [discount, setDiscount] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedCheckout, setCompletedCheckout] = useState(null)

  const filtered = MOCK_GUESTS.filter((g) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return g.guestName.toLowerCase().includes(q) || g.id.toLowerCase().includes(q)
  })

  const allInspected = useMemo(() => {
    if (!selectedGuest) return false
    return INSPECTION_ITEMS.every((item) => inspectedItems[item])
  }, [selectedGuest, inspectedItems])

  const billing = useMemo(() => {
    if (!selectedGuest) return null
    const roomCharges = selectedGuest.ratePerNight * selectedGuest.nights
    const extrasTotal = selectedGuest.extraCharges.reduce((sum, c) => sum + c.amount, 0)
    const subtotal = roomCharges + extrasTotal
    const discountAmount = Math.round(subtotal * (discount / 100))
    const taxable = subtotal - discountAmount
    const vat = Math.round(taxable * VAT_RATE)
    const total = taxable + vat
    return { roomCharges, extrasTotal, subtotal, discountAmount, vat, total }
  }, [selectedGuest, discount])

  function handleSelectGuest(guest) {
    setSelectedGuest(guest)
    setInspectedItems({})
    setDiscount(0)
  }

  function toggleInspectionItem(item) {
    setInspectedItems((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  function handleMarkAllInspected() {
    const all = {}
    INSPECTION_ITEMS.forEach((item) => (all[item] = true))
    setInspectedItems(all)
  }

  function handleCompleteCheckout() {
    // TODO: submit to backend (e.g. POST /api/checkouts/{guestId}/complete)
    setCompletedCheckout({ guest: selectedGuest, total: billing.total })
    setShowSuccessModal(true)
  }

  function handleDone() {
    setShowSuccessModal(false)
    setSelectedGuest(null)
    setInspectedItems({})
    setDiscount(0)
    setCompletedCheckout(null)
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Check Out"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Check Out
            </h1>
            <p className="text-sm text-slate-400 mt-1">Process guest departures</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6">
            {/* Left — Current In-House Guests */}
            <div className="bg-base-850 border border-base-border rounded-2xl p-5 h-fit">
              <h2 className="text-white font-serif font-bold text-lg mb-4">
                Current In-House Guests
              </h2>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guest or booking ID..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {filtered.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGuest(g)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedGuest?.id === g.id
                        ? 'bg-base-800 border-amber-400/50'
                        : 'bg-base-800/50 border-base-border hover:bg-base-800'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${g.avatarColor}`}
                    >
                      {g.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate">{g.guestName}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {g.id} · Room {g.room} ({g.roomType})
                      </p>
                      <p className="text-xs text-slate-500">Check-out: {g.checkOut}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${
                        g.paid
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {g.paid ? 'PAID' : 'UNPAID'}
                    </span>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-8">No guests found.</p>
                )}
              </div>
            </div>

            {/* Right */}
            {!selectedGuest ? (
              <div className="bg-base-850 border border-base-border rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-14 h-14 rounded-full bg-base-800 border border-base-border flex items-center justify-center mb-4">
                  <CheckOutIcon size={22} className="text-slate-500" />
                </div>
                <h3 className="text-white font-serif font-bold text-lg">
                  Select a guest to process check-out
                </h3>
                <p className="text-sm text-slate-500 mt-1">Billing summary will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Guest summary bar */}
                <div className="bg-base-850 border border-base-border rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${selectedGuest.avatarColor}`}
                    >
                      {selectedGuest.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{selectedGuest.guestName}</p>
                      <p className="text-sm text-slate-400 truncate">
                        Room {selectedGuest.room} · {selectedGuest.checkIn} → {selectedGuest.checkOut} (
                        {selectedGuest.nights} nights)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${
                      selectedGuest.paid
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {selectedGuest.paid ? 'PAID' : 'UNPAID'}
                  </span>
                </div>

                {/* Room Inspection */}
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-serif font-bold text-lg">Room Inspection</h2>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        allInspected
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-violet-500/15 text-violet-400'
                      }`}
                    >
                      {allInspected ? 'INSPECTED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {INSPECTION_ITEMS.map((item) => {
                      const checked = Boolean(inspectedItems[item])
                      return (
                        <button
                          key={item}
                          onClick={() => toggleInspectionItem(item)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                            checked
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                              : 'bg-base-800 border-base-border text-slate-300 hover:bg-base-700'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              checked ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          {item}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleMarkAllInspected}
                    className="flex items-center gap-1.5 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={15} />
                    Mark as Inspected
                  </button>
                </div>

                {/* Billing Summary */}
                <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                  <h2 className="text-white font-serif font-bold text-lg mb-4">Billing Summary</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">
                        Room Charges ({selectedGuest.nights} nights × {formatCurrency(selectedGuest.ratePerNight)})
                      </span>
                      <span className="text-slate-200">{formatCurrency(billing.roomCharges)}</span>
                    </div>

                    {selectedGuest.extraCharges.map((charge) => (
                      <div key={charge.label} className="flex items-center justify-between">
                        <span className="text-slate-400">{charge.label}</span>
                        <span className="text-slate-200">{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}

                    <div className="border-t border-base-border pt-3 flex items-center justify-between font-semibold">
                      <span className="text-white">Subtotal</span>
                      <span className="text-white">{formatCurrency(billing.subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Discount (%)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-16 bg-base-800 border border-base-border rounded-md px-2 py-1 text-right text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-rose-400 w-20 text-right">
                          -{formatCurrency(billing.discountAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">VAT (12%)</span>
                      <span className="text-slate-200">{formatCurrency(billing.vat)}</span>
                    </div>

                    <div className="bg-base-800 rounded-lg px-4 py-3.5 flex items-center justify-between mt-2">
                      <span className="text-white font-bold uppercase tracking-wide text-sm">
                        Total Due
                      </span>
                      <span className="text-amber-400 font-bold text-xl">
                        {formatCurrency(billing.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
                    <button className="flex items-center justify-center gap-1.5 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                      <Printer size={15} />
                      Preview Invoice
                    </button>
                    <button className="flex items-center justify-center gap-1.5 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                      <Mail size={15} />
                      Email Receipt
                    </button>
                    <button
                      onClick={handleCompleteCheckout}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <CheckOutIcon size={16} />
                      Complete Check-out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Success modal */}
      {showSuccessModal && completedCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-border">
              <h2 className="text-white font-serif font-bold text-lg">Check-out Complete</h2>
              <button onClick={handleDone} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 size={30} className="text-emerald-400" />
                </div>
              </div>
              <h3 className="text-white font-bold text-lg">Check-out Successful</h3>
              <p className="text-sm text-slate-400 mt-1">
                {completedCheckout.guest.guestName} has been checked out from Room{' '}
                {completedCheckout.guest.room}
              </p>

              <p className="text-amber-400 font-semibold mt-4">
                Total Charged: {formatCurrency(completedCheckout.total)}
              </p>

              <button
                onClick={handleDone}
                className="w-full bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold py-2.5 rounded-lg transition-colors mt-6"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
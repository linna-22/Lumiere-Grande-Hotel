import { useMemo, useState } from 'react'
import { Search, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { reservations } from './reservationsData'

const columns = [
  'ID',
  'Guest',
  'Room',
  'Check-in',
  'Check-out',
  'Nights',
  'Status',
  'Payment',
  'Source',
  'Amount',
]

const statusStyles = {
  'Checked-in': 'bg-sky-500/15 text-sky-400',
  Confirmed: 'bg-emerald-500/15 text-emerald-400',
  Pending: 'bg-violet-500/15 text-violet-400',
  Cancelled: 'bg-rose-500/15 text-rose-400',
  'Checked-out': 'bg-slate-500/15 text-slate-300',
}

const paymentStyles = {
  Paid: 'bg-emerald-500/15 text-emerald-400',
  Partial: 'bg-amber-500/15 text-amber-400',
  Unpaid: 'bg-rose-500/15 text-rose-400',
}

const tabToStatus = {
  All: null,
  Active: ['Confirmed', 'Checked-in', 'Pending'],
  'Checked In': ['Checked-in'],
  'Checked Out': ['Checked-out'],
  Cancelled: ['Cancelled'],
}

function formatAmount(n) {
  return `₱${n.toLocaleString('en-US')}`
}

export default function ReservationsTable({ activeTab = 'All' }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const statusFilter = tabToStatus[activeTab]
    return reservations.filter((r) => {
      const matchesTab = !statusFilter || statusFilter.includes(r.status)
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        r.guest.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [activeTab, query])

  return (
    <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
      {/* Search + count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>
        <span className="text-sm text-slate-500 shrink-0">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-y border-base-border text-slate-400">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left font-medium px-4 py-3 whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    <ChevronUp size={12} className="text-slate-600" />
                  </span>
                </th>
              ))}
              <th className="text-right font-medium px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
              >
                <td className="px-4 py-4 align-top">
                  <span className="text-amber-400 font-semibold whitespace-nowrap">{r.id}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center gap-2.5 min-w-[180px]">
                    <img
                      src={r.avatar}
                      alt={r.guest}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="leading-tight min-w-0">
                      <p className="text-white font-medium truncate">{r.guest}</p>
                      <p className="text-slate-500 text-xs truncate">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top whitespace-nowrap">
                  <p className="text-slate-200">{r.room}</p>
                  <p className="text-slate-500 text-xs">{r.roomType}</p>
                </td>
                <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                  {r.checkIn}
                </td>
                <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                  {r.checkOut}
                </td>
                <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                  {r.nights}n
                </td>
                <td className="px-4 py-4 align-top whitespace-nowrap">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyles[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 align-top whitespace-nowrap">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${paymentStyles[r.payment]}`}
                  >
                    {r.payment}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                  {r.source}
                </td>
                <td className="px-4 py-4 align-top text-amber-400 font-semibold whitespace-nowrap">
                  {formatAmount(r.amount)}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    <button className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                  No reservations match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

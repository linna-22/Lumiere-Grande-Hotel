import { Search, Pencil, Trash2, Loader2 } from 'lucide-react'

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

const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'G'

export default function ReservationsTable({
  rows = [],
  loading = false,
  error = '',
  search = '',
  onSearchChange,
  total = 0,
  onEdit,
  onCancel,
  cancellingId = null,
}) {
  return (
    <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
      {/* Search + count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by code, guest name, email..."
            className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>

        <span className="text-sm text-slate-500 shrink-0">
          {total} records
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

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
                  {col}
                </th>
              ))}

              <th className="text-center font-medium px-4 py-3 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody
            className={
              loading
                ? 'opacity-50 transition-opacity'
                : 'transition-opacity'
            }
          >
            {rows.map((r) => {
              const isCancelling = cancellingId === r.dbId

              return (
                <tr
                  key={r.dbId}
                  className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-4 align-top">
                    <span className="text-amber-400 font-semibold whitespace-nowrap">
                      {r.id}
                    </span>
                  </td>

                  {/* Guest */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      <div className="w-8 h-8 rounded-full bg-amber-400/15 text-amber-400 text-xs font-semibold flex items-center justify-center shrink-0">
                        {initials(r.guest)}
                      </div>

                      <div className="leading-tight min-w-0">
                        <p className="text-white font-medium truncate">
                          {r.guest}
                        </p>

                        <p className="text-slate-500 text-xs truncate">
                          {r.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Room */}
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <p className="text-slate-200">
                      {r.room}
                    </p>

                    <p className="text-slate-500 text-xs">
                      {r.roomType}
                    </p>
                  </td>

                  {/* Check-in */}
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {r.checkIn}
                  </td>

                  {/* Check-out */}
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {r.checkOut}
                  </td>

                  {/* Nights */}
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {r.nights}n
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        statusStyles[r.status] ??
                        'bg-slate-500/15 text-slate-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        paymentStyles[r.payment] ??
                        'bg-slate-500/15 text-slate-300'
                      }`}
                    >
                      {r.payment}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {r.source}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <p className="text-amber-400 font-semibold">
                      {money(r.amount)}
                    </p>

                    <p className="text-slate-500 text-xs">
                      Paid {money(r.paid)}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()

                          if (!r.dbId) {
                            console.error(
                              'Missing reservation database ID:',
                              r
                            )
                            return
                          }

                          onEdit?.(r)
                        }}
                        disabled={isCancelling}
                        className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>

                      {/* Cancel */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()

                          if (!r.dbId) {
                            console.error(
                              'Missing reservation database ID:',
                              r
                            )
                            return
                          }

                          onCancel?.(r)
                        }}
                        disabled={isCancelling}
                        className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isCancelling ? (
                          <Loader2
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={12} />
                        )}

                        {isCancelling
                          ? 'Cancelling...'
                          : 'Cancel'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Empty */}
            {!loading && rows.length === 0 && !error && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No reservations found.
                </td>
              </tr>
            )}

            {/* Loading */}
            {loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Loading reservations…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
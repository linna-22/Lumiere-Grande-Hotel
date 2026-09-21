import { formatMoney, STATUS_STYLES } from './invoiceUtils'

const COLUMNS = ['Invoice #', 'Guest', 'Room', 'Stay', 'Total', 'Status', 'Date']

function GuestAvatar({ guest }) {
  if (guest.avatar) {
    return (
      <img
        src={guest.avatar}
        alt={guest.name}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    )
  }

  return (
    <div className="w-9 h-9 rounded-full bg-base-700 border border-base-border flex items-center justify-center text-sm font-semibold text-amber-400 shrink-0">
      {guest.name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function InvoicesTable({
  invoices,
  loading,
  error,
  onPreview,
  onPrint,
  onView,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-base-800 text-slate-400">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} className="px-4 py-3.5 font-medium whitespace-nowrap">
                {col}
              </th>
            ))}
            <th className="px-4 py-3.5 font-medium text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-base-border">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-5">
                  <div className="h-4 rounded bg-base-800 animate-pulse" />
                </td>
              </tr>
            ))}

          {!loading && error && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-rose-400">
                {error}
              </td>
            </tr>
          )}

          {!loading && !error && invoices.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-slate-400">
                No invoices found.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-base-800/60 transition-colors">
                <td className="px-4 py-4 font-mono text-xs text-amber-400 whitespace-nowrap">
                  {inv.invoice_number}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <GuestAvatar guest={inv.guest} />
                    <div className="leading-tight min-w-0">
                      <p className="font-semibold text-white truncate">{inv.guest.name}</p>
                      <p className="text-xs text-slate-400 truncate">{inv.guest.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-slate-200 font-medium whitespace-nowrap">
                  {inv.room.label}
                </td>

                <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                  {inv.stay.formatted}
                </td>

                <td className="px-4 py-4 font-mono text-emerald-400 whitespace-nowrap">
                  {formatMoney(inv.total_amount)}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[inv.status] ?? 'bg-base-800 text-slate-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-200 whitespace-nowrap">{inv.date}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onPreview?.(inv)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => onPrint?.(inv)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => onView?.(inv)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-base-800 text-slate-300 hover:bg-base-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
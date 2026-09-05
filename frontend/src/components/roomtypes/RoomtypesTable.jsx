import { useMemo, useState } from 'react'
import { Search, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import Loading from '../common/Loading'

const columns = [
  'ID',
  'Name',
  'Description',
  'Capacity',
  'Base Price',
  'Max Occupancy',
  'Facilities',
  'Status',
]

const statusStyles = {
  active: 'bg-emerald-500/15 text-emerald-400',
  inactive: 'bg-rose-500/15 text-rose-400',
}

function formatAmount(n) {
  return `$${n.toLocaleString('en-US')}`
}

export default function RoomTypesTable({ roomTypes = [], loading, error, refetch, onEdit, onDelete }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return roomTypes
    return roomTypes.filter(
      (rt) =>
        rt.name.toLowerCase().includes(q) ||
        String(rt.id).toLowerCase().includes(q) ||
        rt.description.toLowerCase().includes(q)
    )
  }, [roomTypes, query])

  return (
    <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            disabled={loading}
            className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 disabled:opacity-50"
          />
        </div>
        <span className="text-sm text-slate-500 shrink-0">
          {loading ? 'Loading…' : `${filtered.length} records`}
        </span>
      </div>

      {error && (
        <div className="mx-4 mb-4 flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
          <span>Couldn't load room types: {error}</span>
          <button
            onClick={refetch}
            className="shrink-0 font-medium underline underline-offset-2 hover:text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && <Loading label="Loading room types…" />}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-y border-base-border text-slate-400">
                {columns.map((col) => (
                  <th key={col} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {col}
                      <ChevronUp size={12} className="text-slate-600" />
                    </span>
                  </th>
                ))}
                <th className="text-center font-medium px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rt) => (
                <tr
                  key={rt.id}
                  className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
                >
                  <td className="px-4 py-4 align-top">
                    <span className="text-amber-400 font-semibold whitespace-nowrap">{rt.id}</span>
                  </td>
                  <td className="px-4 py-4 align-top text-white font-medium whitespace-nowrap">
                    {rt.name}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-400 max-w-[260px]">
                    <p className="line-clamp-2">{rt.description}</p>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {rt.capacity} rooms
                  </td>
                  <td className="px-4 py-4 align-top text-amber-400 font-semibold whitespace-nowrap">
                    {formatAmount(rt.basePrice)}/night
                  </td>
                  <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                    {rt.maxOccupancy} guests
                  </td>
                  <td className="px-4 py-4 align-top max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {(rt.facilities ?? []).slice(0, 3).map((f) => (
                        <span
                          key={f.id ?? f.name}
                          className="text-[11px] text-slate-300 bg-base-800 border border-base-border px-2 py-0.5 rounded-md whitespace-nowrap"
                        >
                          {f.name}
                        </span>
                      ))}
                      {rt.facilities?.length > 3 && (
                        <span className="text-[11px] text-slate-500">
                          +{rt.facilities.length - 3} more
                        </span>
                      )}
                      {(!rt.facilities || rt.facilities.length === 0) && (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyles[rt.status] ?? 'bg-slate-500/15 text-slate-300'}`}
                    >
                      {rt.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button
                        onClick={() => onEdit?.(rt)}
                        className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete?.(rt)}
                        className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                      >
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
                    No room types match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
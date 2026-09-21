import { useMemo, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import {
  ACTION_STYLES,
  STATUS_LABELS,
  nextAction,
  statusBadgeStyles,
} from './Housekeepingutils'

const COLUMNS = [
  'Room',
  'Task',
  'Status',
  'Assigned To',
  'Created',
  'Completed',
]

export default function HousekeepingTable({
  tasks,
  busyId,
  onAdvance,
  onAssign,
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tasks

    return tasks.filter(
      (t) =>
        String(t.room).toLowerCase().includes(q) ||
        (t.task ?? '').toLowerCase().includes(q) ||
        (t.assignedTo ?? '').toLowerCase().includes(q)
    )
  }, [tasks, query])

  return (
    <div className="bg-base-850 border border-base-border rounded-xl mt-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search room, task or staff..."
            className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
        </div>

        <span className="text-sm text-slate-500 shrink-0">
          {filtered.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-y border-base-border text-slate-400">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-left font-medium px-4 py-3 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              <th className="text-right font-medium px-4 py-3 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => {
              const action = nextAction(t.status)
              const busy = busyId === t.id

              return (
                <tr
                  key={t.id}
                  className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
                >
                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <p className="text-white font-semibold">{t.room}</p>
                    {t.floor != null && (
                      <p className="text-xs text-slate-500">Floor {t.floor}</p>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <p className="text-slate-200 whitespace-nowrap">{t.task}</p>
                    {t.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 max-w-[220px] truncate">
                        {t.notes}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                        statusBadgeStyles[t.status] ?? 'bg-base-800 text-slate-300'
                      }`}
                    >
                      {STATUS_LABELS[t.status] ?? t.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    {t.assignedTo ? (
                      <span className="text-slate-300">{t.assignedTo}</span>
                    ) : (
                      <span className="text-slate-600 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top text-slate-400 whitespace-nowrap">
                    {t.createdAt ?? <span className="text-slate-600">—</span>}
                  </td>

                  <td className="px-4 py-4 align-top whitespace-nowrap">
                    {t.completedAt ? (
                      <span className="text-emerald-400">{t.completedAt}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      {action && (
                        <button
                          onClick={() => onAdvance(t)}
                          disabled={busy}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${ACTION_STYLES[action.key]}`}
                        >
                          {busy ? 'Updating…' : action.label}
                        </button>
                      )}

                      <button
                        onClick={() => onAssign(t)}
                        className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <UserPlus size={12} />
                        {t.assignedTo ? 'Reassign' : 'Assign'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {tasks.length === 0
                    ? 'No housekeeping tasks yet.'
                    : 'No tasks match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
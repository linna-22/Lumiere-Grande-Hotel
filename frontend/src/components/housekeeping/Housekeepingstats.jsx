import { useMemo } from 'react'
import { BOARD_COLUMNS, STATUS_LABELS } from './Housekeepingutils'

const VALUE_COLORS = {
  pending: 'text-amber-400',
  in_progress: 'text-sky-400',
  completed: 'text-emerald-400',
  inspected: 'text-white',
}

export default function HousekeepingStats({ tasks }) {
  const counts = useMemo(() => {
    const result = {}
    BOARD_COLUMNS.forEach((status) => {
      result[status] = tasks.filter((t) => t.status === status).length
    })
    return result
  }, [tasks])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
      {BOARD_COLUMNS.map((status) => (
        <div
          key={status}
          className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500"
        >
          <p className={`text-3xl font-bold font-serif ${VALUE_COLORS[status]}`}>
            {counts[status]}
          </p>
          <p className="text-sm text-slate-400 mt-1">{STATUS_LABELS[status]}</p>
        </div>
      ))}
    </div>
  )
}
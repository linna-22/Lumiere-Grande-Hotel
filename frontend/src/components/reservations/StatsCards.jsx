const config = [
  { key: 'total', label: 'Total', color: 'text-amber-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'text-emerald-400' },
  { key: 'checked_in', label: 'Checked In', color: 'text-sky-400' },
  { key: 'pending', label: 'Pending', color: 'text-violet-400' },
  { key: 'cancelled', label: 'Cancelled', color: 'text-rose-400' },
]

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
      {config.map(({ key, label, color }) => (
        <div
          key={key}
          className="bg-base-850 border border-base-border rounded-xl py-6 flex flex-col items-center justify-center text-center"
        >
          <p className={`text-3xl font-bold font-serif ${color}`}>
            {stats ? stats[key] ?? 0 : '—'}
          </p>
          <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
const stats = [
  { value: 8, label: 'Total', color: 'text-amber-400' },
  { value: 4, label: 'Confirmed', color: 'text-emerald-400' },
  { value: 1, label: 'Checked In', color: 'text-sky-400' },
  { value: 2, label: 'Pending', color: 'text-violet-400' },
  { value: 0, label: 'Cancelled', color: 'text-rose-400' },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
      {stats.map(({ value, label, color }) => (
        <div
          key={label}
          className="bg-base-850 border border-base-border rounded-xl py-6 flex flex-col items-center justify-center text-center"
        >
          <p className={`text-3xl font-bold font-serif ${color}`}>{value}</p>
          <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function StatsCards({ summary }) {
  const stats = [
    { value: summary?.total ?? 0, label: 'Total', color: 'text-amber-400' },
    { value: summary?.available ?? 0, label: 'Available', color: 'text-emerald-400' },
    { value: summary?.occupied ?? 0, label: 'Occupied', color: 'text-sky-400' },
    // { value: summary?.dirty ?? 0, label: 'Dirty', color: 'text-amber-400' },
    { value: summary?.cleaning ?? summary?.dirty ?? 0, label: 'Dirty', color: 'text-amber-400' },
    { value: summary?.maintenance ?? 0, label: 'Maintenance', color: 'text-rose-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
      {stats.map(({ value, label, color }) => (
        <div
          key={label}
          className="bg-base-700 border border-base-border rounded-2xl py-2 flex flex-col items-center justify-center text-center transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:border-slate-500 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
        >
          <p className={`text-2xl font-bold font-serif ${color}`}>{value}</p>
          <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
import { formatCompactMoney } from './invoiceUtils'

export default function InvoiceStatsCards({ summary }) {
  const stats = [
    { value: summary?.total ?? 0, label: 'Total Invoices', color: 'text-amber-400' },
    { value: formatCompactMoney(summary?.paid), label: 'Paid', color: 'text-emerald-400' },
    { value: formatCompactMoney(summary?.outstanding), label: 'Outstanding', color: 'text-rose-400' },
    { value: formatCompactMoney(summary?.this_month), label: 'This Month', color: 'text-sky-400' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
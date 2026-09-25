import { CalendarDays, Mail, UserRound, BriefcaseBusiness, BadgeDollarSign, CircleDot, X } from 'lucide-react'

export default function EmployeeDetailsModal({ employee, onClose }) {
  if (!employee) return null
  const name = `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim()
  const role = employee.user?.role
  const status = employee.status

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
          <div>
            <h2 className="text-white font-serif text-xl font-bold">Employee Details</h2>
            <p className="text-xs text-slate-500 mt-1">Employee profile information</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center text-lg font-bold">
              {name.split(' ').filter(Boolean).map(x => x[0]).join('').slice(0,2).toUpperCase() || 'E'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{name || 'Unnamed Employee'}</h3>
              <p className="text-xs text-slate-500 mt-1">Employee ID #{employee.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Item icon={BriefcaseBusiness} label="Position" value={employee.position} />
            <Item icon={BadgeDollarSign} label="Salary" value={employee.salary != null ? Number(employee.salary).toLocaleString() : null} />
            <Item icon={CalendarDays} label="Hire Date" value={employee.hire_date ? String(employee.hire_date).slice(0,10) : null} />
            <Item icon={CircleDot} label="Status" value={status} />
            <Item icon={Mail} label="Account Email" value={employee.user?.email} />
            <Item icon={UserRound} label="Account Role" value={role} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Item({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5"><Icon size={14} /><span>{label}</span></div>
      <p className="text-sm text-slate-200 capitalize">{value || '—'}</p>
    </div>
  )
}

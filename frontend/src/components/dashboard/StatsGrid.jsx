import {
  BedDouble,
  Building2,
  DoorOpen,
  Wrench,
  LogIn,
  LogOut,
  Clock,
  CalendarCheck,
} from 'lucide-react'

const stats = [
  {
    icon: BedDouble,
    iconBg: 'bg-amber-400/15 text-amber-400',
    value: '50',
    label: 'Total Rooms',
    sub: '',
    roomTypes: [
      { name: 'Single', count: 15 },
      { name: 'Double', count: 20 },
      { name: 'Suite', count: 10 },
      { name: 'Deluxe', count: 5 },
    ],
  },
  {
    icon: DoorOpen,
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    value: '24',
    label: 'Available Rooms',
    sub: 'Ready for check-in',
    badge: '',
    badgeUp: false,
  },
  {
    icon: Clock,
    iconBg: 'bg-blue-500/15 text-blue-400',
    value: '8',
    label: 'Pending Reservations',
    sub: 'Awaiting confirmation',
  },
  {
    icon: LogIn,
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-400',
    value: '12',
    label: "Today's Check-ins",
    sub: '5 done • 7 pending',
    badge: '+3',
    badgeUp: true,
  },
  {
    icon: LogOut,
    iconBg: 'bg-orange-500/15 text-orange-400',
    value: '9',
    label: "Today's Check-outs",
    sub: '3 done • 6 pending',
  },
]

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map(({ icon: Icon, iconBg, value, label, sub, badge, badgeUp, roomTypes }) => (
        <div
          key={label}
          className="bg-base-850 border border-base-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
              <Icon size={18} strokeWidth={2} />
            </div>
            {badge && (
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  badgeUp
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <div>
            <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
            <p className="text-sm text-slate-300 mt-1.5">{label}</p>
            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}

            {roomTypes && roomTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roomTypes.map((rt) => (
                  <span
                    key={rt.name}
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-base-700/60 text-slate-300 border border-base-border"
                  >
                    {rt.name} <span className="text-slate-400">· {rt.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
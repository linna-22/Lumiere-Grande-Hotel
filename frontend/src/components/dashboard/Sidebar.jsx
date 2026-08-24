import {
  LayoutGrid,
  CalendarDays,
  BedDouble,
  Users,
  ClipboardCheck,
  LogOut as CheckoutIcon,
  CreditCard,
  FileText,
  UserRound,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
  { label: 'Reservations', icon: CalendarDays },
  { label: 'Rooms', icon: BedDouble },
  // // { label: 'Guests', icon: Users },
  // { label: 'Check it', icon: ClipboardCheck },
  // { label: 'Checkout', icon: CheckoutIcon },
  // { label: 'Payment', icon: CreditCard },
  // { label: 'Invoice', icon: FileText },
  // { label: 'Employee', icon: UserRound },
  // { label: 'Setting', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile/tablet overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 lg:z-auto
          w-64 sm:w-60 shrink-0 flex flex-col bg-base-900 border-r border-base-border
          h-screen transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-base-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
              <BedDouble size={18} className="text-base-950" strokeWidth={2.5} />
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-white font-bold text-[15px] tracking-tight truncate">
                LUMIÈRE GRAND
              </p>
              <p className="text-amber-400 text-[11px] font-medium">Hotel Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 shrink-0"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-400/15 text-amber-400'
                  : 'text-slate-400 hover:bg-base-800 hover:text-slate-200'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </a>
          ))}
        </nav>

        {/* Logout pinned at bottom */}
        <div className="px-3 py-4 border-t border-base-border">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            <LogOut size={18} strokeWidth={2} />
            Logout
          </a>
        </div>
      </aside>
    </>
  )
}

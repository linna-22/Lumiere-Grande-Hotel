import { useState } from 'react'
import {
  LayoutGrid,
  CalendarDays,
  BedDouble,
  Users,
  LogIn,
  DoorOpen,
  Sparkles,
  CreditCard,
  FileText,
  ShoppingCart,
  UtensilsCrossed,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from 'lucide-react'

const navGroups = [
  {
    label: '',
    items: [
      { label: 'Dashboard', icon: LayoutGrid },
      { label: 'Reservations', icon: CalendarDays, badge: 8 },
      { label: 'Rooms', icon: BedDouble },
      // { label: 'Guests', icon: Users },
    ],
  },
  // {
  //   label: 'Operations',
  //   items: [
  //     { label: 'Check In', icon: LogIn, badge: 5 },
  //     { label: 'Check Out', icon: DoorOpen, badge: 3 },
  //     { label: 'Housekeeping', icon: Sparkles, badge: 7 },
  //     { label: 'Payments', icon: CreditCard },
  //     { label: 'Invoices', icon: FileText },
  //     { label: 'POS', icon: ShoppingCart },
  //   ],
  // },
  // {
  //   label: 'Amenities',
  //   items: [
  //     { label: 'Restaurant', icon: UtensilsCrossed },
  //   ],
  // },
]

export default function Sidebar({ open, onClose, active = 'Dashboard', onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)

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
          ${collapsed ? 'lg:w-20' : 'lg:w-64'} w-64 shrink-0 flex flex-col
          bg-base-900 border-r border-base-border h-screen
          transition-[transform,width] duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-base-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
              <BedDouble size={18} className="text-base-950" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="leading-tight min-w-0">
                <p className="text-white font-bold text-[15px] tracking-tight truncate">
                  Hotel Dasmariñas
                </p>
                <p className="text-amber-400 text-[11px] font-medium">Management System</p>
              </div>
            )}
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
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ label, icon: Icon, badge }) => {
                  const isActive = label === active
                  return (
                    <a
                      key={label}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        onClose?.()
                        onNavigate?.(label)
                      }}
                      title={collapsed ? label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-400 text-base-950'
                          : 'text-slate-400 hover:bg-base-800 hover:text-slate-200'
                      } ${collapsed ? 'justify-center' : 'justify-between'}`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon size={18} strokeWidth={2} className="shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </span>
                      {!collapsed && badge !== undefined && (
                        <span
                          className={`text-[11px] font-semibold px-1.5 min-w-[1.25rem] text-center py-0.5 rounded-full ${
                            isActive
                              ? 'bg-base-950/20 text-base-950'
                              : 'bg-base-800 text-slate-300'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings / Logout */}
        <div className="px-3 py-4 border-t border-base-border space-y-1">
          <a
            href="#"
            title={collapsed ? 'Settings' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-base-800 hover:text-slate-200 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Settings size={18} strokeWidth={2} className="shrink-0" />
            {!collapsed && 'Settings'}
          </a>
          <a
            href="#"
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-base-800 hover:text-slate-200 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} strokeWidth={2} className="shrink-0" />
            {!collapsed && 'Logout'}
          </a>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:flex absolute -right-3 bottom-6 w-6 h-6 rounded-full bg-base-800 border border-base-border items-center justify-center text-slate-400 hover:text-white hover:bg-base-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </aside>
    </>
  )
}

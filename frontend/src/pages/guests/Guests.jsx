import { useMemo, useState } from 'react'
import {
  Search,
  FileDown,
  FileSpreadsheet,
  Printer,
  Plus,
  ChevronUp,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

// Mock data — replace with a real fetch (e.g. GET /api/admin/guests)
const MOCK_GUESTS = [
  {
    id: 1,
    name: 'Santiago Reyes',
    email: 'santiago.reyes@email.com',
    phone: '+63 917 123 4567',
    nationality: 'Filipino',
    status: 'VIP',
    stays: 24,
    totalSpent: 480000,
    points: 4800,
    since: '2022-01-10',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 918 234 5678',
    nationality: 'Filipino',
    status: 'Active',
    stays: 8,
    totalSpent: 144000,
    points: 1440,
    since: '2023-03-05',
  },
  {
    id: 3,
    name: 'James Lim',
    email: 'james.lim@email.com',
    phone: '+63 919 345 6789',
    nationality: 'Filipino-Chinese',
    status: 'VIP',
    stays: 36,
    totalSpent: 720000,
    points: 7200,
    since: '2021-06-12',
  },
  {
    id: 4,
    name: 'Ana Villanueva',
    email: 'ana.v@email.com',
    phone: '+63 920 456 7890',
    nationality: 'Filipino',
    status: 'Active',
    stays: 3,
    totalSpent: 180000,
    points: 1800,
    since: '2024-01-20',
  },
  {
    id: 5,
    name: 'Carlos Mendoza',
    email: 'cmendoza@email.com',
    phone: '+63 921 567 8901',
    nationality: 'Filipino',
    status: 'Active',
    stays: 12,
    totalSpent: 240000,
    points: 2400,
    since: '2022-08-30',
  },
  {
    id: 6,
    name: 'Grace Tan',
    email: 'grace.tan@email.com',
    phone: '+63 922 678 9012',
    nationality: 'Filipino',
    status: 'VIP',
    stays: 18,
    totalSpent: 360000,
    points: 3600,
    since: '2022-04-15',
  },
]

const statusStyles = {
  VIP: 'bg-amber-500/15 text-amber-400',
  Active: 'bg-emerald-500/15 text-emerald-400',
  Blacklisted: 'bg-rose-500/15 text-rose-400',
}

function formatCurrency(n) {
  return `₱${n.toLocaleString('en-US')}`
}

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-rose-500/30 text-rose-300',
  'bg-sky-500/30 text-sky-300',
  'bg-amber-500/30 text-amber-300',
  'bg-violet-500/30 text-violet-300',
  'bg-emerald-500/30 text-emerald-300',
]

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

const columns = ['Guest', 'Phone', 'Nationality', 'Status', 'Stays', 'Total Spent', 'Points', 'Since']

export default function Guests({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guests] = useState(MOCK_GUESTS)
  const [query, setQuery] = useState('')

  const counts = useMemo(
    () => ({
      total: guests.length,
      vip: guests.filter((g) => g.status === 'VIP').length,
      active: guests.filter((g) => g.status === 'Active').length,
      blacklisted: guests.filter((g) => g.status === 'Blacklisted').length,
    }),
    [guests]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q)
    )
  }, [guests, query])

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Guests"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                Guest Management
              </h1>
              <p className="text-sm text-slate-400 mt-1">Manage all hotel guests</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <FileDown size={15} />
                Export PDF
              </button>
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <Printer size={15} />
                Print
              </button>
              <button className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors">
                <Plus size={16} strokeWidth={2.5} />
                Add Guest
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-amber-400">{counts.total}</p>
              <p className="text-sm text-slate-400 mt-1">Total Guests</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-amber-400">{counts.vip}</p>
              <p className="text-sm text-slate-400 mt-1">VIP</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-emerald-400">{counts.active}</p>
              <p className="text-sm text-slate-400 mt-1">Active</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-rose-400">{counts.blacklisted}</p>
              <p className="text-sm text-slate-400 mt-1">Blacklisted</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
              </div>
              <span className="text-sm text-slate-500 shrink-0">{filtered.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-y border-base-border text-slate-400">
                    {columns.map((col) => (
                      <th key={col} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {col}
                          <ChevronUp size={12} className="text-slate-600" />
                        </span>
                      </th>
                    ))}
                    <th className="text-right font-medium px-4 py-3 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
                    >
                      <td className="px-4 py-4 align-top whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(g.id)}`}
                          >
                            {initials(g.name)}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{g.name}</p>
                            <p className="text-xs text-slate-500">{g.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                        {g.phone}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                        {g.nationality}
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyles[g.status]}`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                        {g.stays}
                      </td>
                      <td className="px-4 py-4 align-top text-amber-400 font-semibold whitespace-nowrap">
                        {formatCurrency(g.totalSpent)}
                      </td>
                      <td className="px-4 py-4 align-top text-violet-400 font-semibold whitespace-nowrap">
                        {g.points.toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-400 whitespace-nowrap">
                        {g.since}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                            <Eye size={12} />
                            View
                          </button>
                          <button className="flex items-center gap-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        No guests match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
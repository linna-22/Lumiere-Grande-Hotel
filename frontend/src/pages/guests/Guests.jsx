import { useEffect, useMemo, useState, useCallback } from 'react'
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
  Loader2,
} from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { listGuests } from '../../api/admin'
import { ApiError } from '../../api/client'

function initials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
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

const columns = ['Guest', 'Phone', 'Nationality', 'Since']

// Maps a Laravel `Guests` record (with `user` relation loaded) to the shape the table needs
function mapGuest(g) {
  return {
    id: g.id,
    name: `${g.first_name ?? ''} ${g.last_name ?? ''}`.trim() || '—',
    email: g.user?.email ?? g.email ?? '—',
    phone: g.phone ?? '—',
    nationality: g.nationality ?? '—',
    since: g.created_at ? g.created_at.slice(0, 10) : '—',
  }
}

export default function Guests({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guests, setGuests] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })

  const fetchGuests = useCallback(async (search = '', page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const json = await listGuests({
        ...(search ? { search } : {}),
        page,
      })
      // Laravel's paginate() returns { data: [...], current_page, last_page, total, ... }
      setGuests((json.data ?? []).map(mapGuest))
      setPagination({
        current_page: json.current_page ?? 1,
        last_page: json.last_page ?? 1,
        total: json.total ?? (json.data?.length ?? 0),
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else {
        setError(err.message || 'Failed to load guests')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      fetchGuests(query, 1)
  }, 350)
    return () => clearTimeout(handle)
  }, [query, fetchGuests])

  const counts = useMemo(
    () => ({
      total: pagination.total,
    }),
    [pagination.total]
  )

  const handleExportExcel = () => {
    // Export is a GET route that streams a file download — apiFetch expects JSON,
    // so this opens the URL directly. Note: this bypasses the Bearer token, so
    // exportExcel's route will 401 unless it's also reachable via the Sanctum
    // cookie session (credentials: 'include' won't apply to window.open).
    const base = import.meta.env.VITE_API_URL || 'http://localhost:9000/api'
    window.open(`${base}/admin/guests/export/excel`, '_blank')
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Guests"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
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
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
              >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-sm">
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-bold font-serif text-amber-400">{counts.total}</p>
              <p className="text-sm text-slate-400 mt-1">Total Guests</p>
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
              <span className="text-sm text-slate-500 shrink-0">
                {loading ? 'Loading…' : `${pagination.total} records`}
              </span>
            </div>

            {error && (
              <div className="px-4 pb-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
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
                  {loading && guests.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                        Loading guests…
                      </td>
                    </tr>
                  )}

                  {!loading && guests.length === 0 && !error && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                        No guests match your search.
                      </td>
                    </tr>
                  )}

                  {guests.map((g) => (
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
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-base-border">
                <button
                  disabled={pagination.current_page <= 1}
                  onClick={() => fetchGuests(query, pagination.current_page - 1)}
                  className="px-3 py-1.5 text-sm rounded-md bg-base-800 border border-base-border text-slate-300 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-400">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => fetchGuests(query, pagination.current_page + 1)}
                  className="px-3 py-1.5 text-sm rounded-md bg-base-800 border border-base-border text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
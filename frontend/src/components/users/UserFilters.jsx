import { Search, X } from 'lucide-react'

export default function UserFilters({
  search,
  setSearch,
  role,
  setRole,
}) {
  const hasFilters = search || role

  const clearFilters = () => {
    setSearch('')
    setRole('')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-base-800 border border-base-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
        />
      </div>

      {/* Role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="lg:w-52 bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
        <option value="manager">Manager</option>
        <option value="cashier">Cashier</option>
        <option value="receptionist">Receptionist</option>
        <option value="customer">Customer</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-base-border bg-base-800 text-slate-400 hover:text-white hover:bg-base-700 text-sm transition-colors"
        >
          <X size={15} />
          Clear
        </button>
      )}
    </div>
  )
}
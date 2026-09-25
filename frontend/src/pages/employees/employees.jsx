import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  Loader2,
  UsersRound,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import Pagination from '../../components/common/Pagination'
import SuccessModal from '../../components/rooms/SuccessModal'
import EmployeeFormModal from '../../components/employees/EmployeeFormModal'
import EmployeeDeleteModal from '../../components/employees/EmployeeDeleteModal'
import EmployeeDetailsModal from '../../components/employees/EmployeeDetailsModal'

import {
  listEmployees,
  getEmployee,
  deleteEmployee,
} from '../../api/employees'

const columns = ['Employee', 'Position', 'Salary', 'Hire Date', 'Status']

function fullName(employee) {
  return `${employee.first_name ?? ''} ${employee.last_name ?? ''}`.trim() || '—'
}

function initials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-400/10 text-emerald-400'
  if (status === 'on_leave') return 'bg-amber-400/10 text-amber-400'
  return 'bg-slate-400/10 text-slate-400'
}

export default function Employees({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const [page, setPage] = useState(1)
  const [formEmployee, setFormEmployee] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewEmployee, setViewEmployee] = useState(null)
  const [loadingView, setLoadingView] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchEmployees = useCallback(async (search = query, selectedStatus = status, currentPage = page) => {
    setLoading(true)
    setError(null)

    try {
      const response = await listEmployees({
        search,
        status: selectedStatus,
        page: currentPage,
        per_page: 15,
      })

      // Controller returns: { status, data: Laravel paginator }
      const paginator = response?.data ?? {}
      setEmployees(paginator.data ?? [])
      setPagination({
        current_page: paginator.current_page ?? currentPage,
        last_page: paginator.last_page ?? 1,
        total: paginator.total ?? 0,
        per_page: paginator.per_page ?? 15,
      })
    } catch (err) {
      console.error('Failed to fetch employees:', err)
      setError(err.message || 'Failed to load employees')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [query, status, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(query, status, page)
    }, 350)

    return () => clearTimeout(timer)
  }, [query, status, page, fetchEmployees])

  useEffect(() => {
    setPage(1)
  }, [query, status])

  const counts = useMemo(() => ({
    total: pagination.total,
    active: employees.filter((employee) => employee.status === 'active').length,
  }), [pagination.total, employees])

  async function handleView(id) {
    setLoadingView(true)
    setError(null)

    try {
      const response = await getEmployee(id)
      setViewEmployee(response?.data ?? response)
    } catch (err) {
      setError(err.message || 'Failed to load employee')
    } finally {
      setLoadingView(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setDeleting(true)
    setError(null)

    try {
      await deleteEmployee(deleteTarget.id)
      setDeleteTarget(null)
      await fetchEmployees(query, status, page)
      setSuccessMessage('Employee deleted and linked user account deactivated successfully.')
      setShowSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to delete employee')
    } finally {
      setDeleting(false)
    }
  }

  function handleFormSuccess(type) {
    setSuccessMessage(
      type === 'update'
        ? 'Employee updated successfully.'
        : 'Employee added successfully.'
    )
    setShowSuccess(true)
    setPage(1)
    fetchEmployees(query, status, type === 'create' ? 1 : page)
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      {showForm && (
        <EmployeeFormModal
          employee={formEmployee}
          onClose={() => {
            if (!loading) {
              setShowForm(false)
              setFormEmployee(null)
            }
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deleteTarget && (
        <EmployeeDeleteModal
          employee={deleteTarget}
          loading={deleting}
          onClose={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {viewEmployee && (
        <EmployeeDetailsModal
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Employees"
        onNavigate={onNavigate}
      />

      <div className="flex-1 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <UsersRound size={22} className="text-amber-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                  Employee Management
                </h1>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Manage hotel employees and their system accounts
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormEmployee(null)
                setShowForm(true)
              }}
              className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={17} strokeWidth={2.5} />
              Add Employee
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-sm">
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-bold font-serif text-amber-400">{counts.total}</p>
              <p className="text-sm text-slate-400 mt-1">Total Employees</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-bold font-serif text-emerald-400">{counts.active}</p>
              <p className="text-sm text-slate-400 mt-1">Active on This Page</p>
            </div>
          </div>

          <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search employee's name..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="sm:w-44 bg-base-800 border border-base-border rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {/* <option value="on_leave">On Leave</option> */}
              </select>

              <span className="text-sm text-slate-500 sm:ml-auto">
                {loading ? 'Loading…' : `${pagination.total} records`}
              </span>
            </div>

            {error && (
              <div className="mx-4 mb-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-y border-base-border text-slate-400">
                    {columns.map((column) => (
                      <th key={column} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {column}
                          <ChevronUp size={12} className="text-slate-600" />
                        </span>
                      </th>
                    ))}
                    <th className="text-right font-medium px-4 py-3 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-base-border">
                  {loading && employees.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                        Loading employees…
                      </td>
                    </tr>
                  )}

                  {!loading && employees.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                        No employees found.
                      </td>
                    </tr>
                  )}

                  {employees.map((employee) => {
                    const name = fullName(employee)

                    return (
                      <tr key={employee.id} className="hover:bg-base-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold">{initials(name)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{name}</p>
                              <p className="text-xs text-slate-500">
                                {employee.user?.email || 'No account'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-300">{employee.position || '—'}</td>

                        <td className="px-4 py-4 text-slate-300">
                          {employee.salary != null ? Number(employee.salary).toLocaleString() : '—'}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {employee.hire_date ? String(employee.hire_date).slice(0, 10) : '—'}
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusClass(employee.status)}`}>
                            {String(employee.status || 'unknown').replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleView(employee.id)}
                              disabled={loadingView}
                              title="View"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-base-800"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormEmployee(employee)
                                setShowForm(true)
                              }}
                              title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-base-800"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(employee)}
                              title="Delete"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-base-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
      
          {!loading && employees.length > 0 && (
            <Pagination
              currentPage={pagination.current_page}
              meta={pagination}
              onPageChange={setPage}
              itemLabel="employees"
            />
          )}
    </div>
  )
}

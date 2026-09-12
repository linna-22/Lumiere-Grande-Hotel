import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Users as UsersIcon,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

import UserTable from '../../components/users/UserTable'
import UserFilters from '../../components/users/UserFilters'
import UserDeleteModal from '../../components/users/UserDeleteModal'
import Pagination from '../../components/common/Pagination'
import SuccessModal from '../../components/rooms/SuccessModal'

import {
  listUsers,
  deleteUser,
} from '../../api/admin'

export default function Users({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Success
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Frontend pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Number of users displayed per page
  const perPage = 5

  // ============================================================
  // Fetch Users
  // ============================================================

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const json = await listUsers()

      setUsers(json.data ?? [])
    } catch (err) {
      console.error('Failed to fetch users:', err)

      setError(
        err.message || 'Failed to load users'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ============================================================
  // Frontend Search + Role Filter
  // ============================================================

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue)

      const matchesRole =
        !role || user.role === role

      return matchesSearch && matchesRole
    })
  }, [users, search, role])

  // ============================================================
  // Reset pagination when search/filter changes
  // ============================================================

  useEffect(() => {
    setCurrentPage(1)
  }, [search, role])

  // ============================================================
  // Frontend Pagination
  // ============================================================

  const totalItems = filteredUsers.length

  const lastPage = Math.max(
    1,
    Math.ceil(totalItems / perPage)
  )

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (currentPage - 1) * perPage

    const endIndex =
      startIndex + perPage

    return filteredUsers.slice(
      startIndex,
      endIndex
    )
  }, [filteredUsers, currentPage])

  // Laravel-style meta object for reusable Pagination
  const meta = useMemo(
    () => ({
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total: totalItems,
    }),
    [currentPage, lastPage, totalItems]
  )

  // Keep current page valid
  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage)
    }
  }, [currentPage, lastPage])

  // ============================================================
  // Delete User
  // ============================================================

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    setError(null)

    try {
      await deleteUser(deleteTarget.id)

      // Close delete modal
      setDeleteTarget(null)

      // Refresh users
      await fetchUsers()

      // Show success modal
      setSuccessMessage(
        'User account has been deleted successfully.'
      )

      setShowSuccess(true)

    } catch (err) {
      console.error(
        'Failed to delete user:',
        err
      )

      setError(
        err.message || 'Failed to delete user'
      )

      setDeleteTarget(null)

    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex bg-base-850 min-h-screen">

      {/* ======================================================
          Delete Confirmation Modal
      ======================================================= */}

      {deleteTarget && (
        <UserDeleteModal
          user={deleteTarget}
          loading={deleting}
          onClose={() => {
            if (!deleting) {
              setDeleteTarget(null)
            }
          }}
          onConfirm={handleDelete}
        />
      )}

      {/* ======================================================
          Success Modal
      ======================================================= */}

      {showSuccess && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccess(false)
          }}
        />
      )}

      {/* ======================================================
          Sidebar
      ======================================================= */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Users"
        onNavigate={onNavigate}
      />

      {/* ======================================================
          Main
      ======================================================= */}

      <div className="flex-1 min-w-0">

        {/* Top Bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">

          {/* ==================================================
              Page Header
          =================================================== */}

          <div className="
            flex flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-6
          ">

            <div>

              <div className="flex items-center gap-2">

                <UsersIcon
                  size={22}
                  className="text-amber-400"
                />

                <h1 className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  text-white
                  font-serif
                ">
                  Users
                </h1>

              </div>

              <p className="
                text-sm
                text-slate-400
                mt-1
              ">
                Manage hotel staff and user accounts
              </p>

            </div>

            {/* Add User */}
            <button
              type="button"
              onClick={() =>
                onNavigate?.('Users Add')
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-amber-400
                hover:bg-amber-500
                text-base-950
                font-semibold
                text-sm
                px-4
                py-2.5
                rounded-lg
                transition-colors
              "
            >
              <Plus
                size={17}
                strokeWidth={2.5}
              />

              Add User
            </button>

          </div>

          {/* ==================================================
              Main Card
          =================================================== */}

          <div className="
            bg-base-850
            border
            border-base-border
            rounded-xl
            overflow-hidden
          ">

            {/* Filters */}
            <div className="
              px-6
              py-5
              border-b
              border-base-border
            ">

              <UserFilters
                search={search}
                setSearch={setSearch}
                role={role}
                setRole={setRole}
              />

            </div>

            {/* Error */}
            {error && (
              <div className="
                mx-6
                mt-5
                rounded-lg
                border
                border-rose-500/20
                bg-rose-500/10
                px-4
                py-3
                text-sm
                text-rose-400
              ">
                {error}
              </div>
            )}

            {/* User Table */}
            <UserTable
              users={paginatedUsers}
              loading={loading}

              onView={(id) =>
                onNavigate?.('Users View', {
                  userId: id,
                })
              }

              onEdit={(id) =>
                onNavigate?.('Users Edit', {
                  userId: id,
                })
              }

              onDelete={(user) => {
                setDeleteTarget(user)
              }}
            />

          </div>

          {/* ==================================================
              Pagination
          =================================================== */}

          {!loading &&
            filteredUsers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                meta={meta}
                onPageChange={setCurrentPage}
                itemLabel="users"
              />
            )}

        </main>

      </div>

    </div>
  )
}
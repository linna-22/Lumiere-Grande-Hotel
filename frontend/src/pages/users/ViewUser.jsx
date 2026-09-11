import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Loader2,
  Pencil,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

import { getUser } from '../../api/admin'

export default function ViewUser({ onNavigate, userId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('User ID is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await getUser(userId)

        setUser(response.data ?? response)
      } catch (err) {
        console.error('Failed to fetch user:', err)

        setError(
          err.message || 'Failed to load user information.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const roleLabels = {
    admin: 'Admin',
    super_admin: 'Super Admin',
    manager: 'Manager',
    cashier: 'Cashier',
    receptionist: 'Receptionist',
    customer: 'Customer',
  }

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex bg-base-850 min-h-screen">

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Users"
        onNavigate={onNavigate}
      />

      {/* Main */}
      <div className="flex-1 min-w-0">

        {/* Top Bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1100px] mx-auto">

          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">

            <button
              type="button"
              onClick={() => onNavigate?.('Users')}
              className="
                w-9 h-9
                flex items-center justify-center
                rounded-lg
                bg-base-800
                border border-base-border
                text-slate-300
                hover:bg-base-700
                transition-colors
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                View User
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                View user account information
              </p>
            </div>

          </div>

          {/* Loading */}
          {loading && (
            <div className="
              bg-base-850
              border border-base-border
              rounded-xl
              p-12
              flex items-center justify-center
            ">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Loading user...
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="
              bg-base-850
              border border-base-border
              rounded-xl
              p-6
            ">
              <div className="
                rounded-lg
                border border-rose-500/20
                bg-rose-500/10
                px-4 py-3
                text-sm text-rose-400
              ">
                {error}
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.('Users')}
                className="
                  mt-4
                  px-4 py-2.5
                  rounded-lg
                  bg-base-800
                  border border-base-border
                  text-slate-300
                  text-sm font-medium
                  hover:bg-base-700
                  transition-colors
                "
              >
                Back to Users
              </button>
            </div>
          )}

          {/* User Details */}
          {!loading && !error && user && (
            <div className="
              bg-base-850
              border border-base-border
              rounded-xl
              overflow-hidden
            ">

              {/* Profile Header */}
              <div className="
                px-6 py-6
                border-b border-base-border
                flex flex-col sm:flex-row
                sm:items-center
                gap-4
              ">

                {/* Avatar */}
                <div className="
                  w-16 h-16
                  rounded-full
                  bg-amber-400/15
                  flex items-center justify-center
                  shrink-0
                ">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="
                        w-16 h-16
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <span className="
                      text-2xl
                      font-semibold
                      text-amber-400
                    ">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">

                  <h2 className="text-xl font-semibold text-white">
                    {user.name || '—'}
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    User ID #{user.id}
                  </p>

                </div>

                {/* Role */}
                <span className="
                  inline-flex
                  items-center
                  px-3 py-1.5
                  rounded-full
                  bg-base-800
                  border border-base-border
                  text-sm text-slate-300
                ">
                  {roleLabels[user.role] || user.role || '—'}
                </span>

              </div>

              {/* Account Information */}
              <div className="p-6">

                <h3 className="
                  text-sm
                  font-semibold
                  text-white
                  mb-5
                ">
                  Account Information
                </h3>

                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                ">

                  <InfoItem
                    icon={UserRound}
                    label="Name"
                    value={user.name}
                  />

                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={user.email}
                  />

                  <InfoItem
                    icon={ShieldCheck}
                    label="Role"
                    value={
                      roleLabels[user.role] ||
                      user.role
                    }
                  />

                  <InfoItem
                    icon={CalendarDays}
                    label="Created-at"
                    value={formatDate(user.created_at)}
                  />

                </div>

              </div>

              {/* Footer */}
              <div className="
                px-6 py-4
                border-t border-base-border
                flex items-center
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={() => onNavigate?.('Users')}
                  className="
                    px-4 py-2.5
                    rounded-lg
                    bg-base-800
                    border border-base-border
                    text-slate-300
                    text-sm font-medium
                    hover:bg-base-700
                    transition-colors
                  "
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate?.('Users Edit', {
                      userId: user.id,
                    })
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4 py-2.5
                    rounded-lg
                    bg-amber-400
                    hover:bg-amber-500
                    text-base-950
                    text-sm font-semibold
                    transition-colors
                  "
                >
                  <Pencil size={16} />
                  Edit User
                </button>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="
      rounded-lg
      bg-base-800
      border border-base-border
      p-4
    ">

      <div className="flex items-center gap-2 mb-2">

        <Icon
          size={16}
          className="text-amber-400"
        />

        <span className="text-xs text-slate-500">
          {label}
        </span>

      </div>

      <p className="text-sm text-white break-words">
        {value || '—'}
      </p>

    </div>
  )
}
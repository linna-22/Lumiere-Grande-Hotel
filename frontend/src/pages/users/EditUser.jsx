import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  UserRound,
  Save,
  Loader2,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import SuccessModal from '../../components/rooms/SuccessModal'

import {
  getUser,
  updateUser,
} from '../../api/admin'

export default function EditUser({ onNavigate, userId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState(null)

  const [showSuccess, setShowSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  })

  // Load user
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
        const user = response.data ?? response

        setForm({
          name: user.name ?? '',
          email: user.email ?? '',
          password: '',
          role: user.role ?? '',
        })
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

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError(null)

    try {
      const data = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      }

      // Only send password when user entered one
      if (form.password.trim()) {
        data.password = form.password
      }

      await updateUser(userId, data)

      setShowSuccess(true)
    } catch (err) {
      console.error('Failed to update user:', err)

      setError(
        err.message || 'Failed to update user.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex bg-base-850 min-h-screen">

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          message="User account has been updated successfully."
          onClose={() => {
            setShowSuccess(false)
            onNavigate?.('Users')
          }}
        />
      )}

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

        <main className="p-4 sm:p-6 max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">

            <button
              type="button"
              onClick={() => onNavigate?.('Users')}
              disabled={saving}
              className="
                w-9 h-9
                flex items-center justify-center
                rounded-lg
                bg-base-800
                border border-base-border
                text-slate-300
                hover:bg-base-700
                transition-colors
                disabled:opacity-50
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Edit User
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Update user account information
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

          {/* Error / Form */}
          {!loading && (
            <form onSubmit={handleSubmit}>

              <div className="
                bg-base-850
                border border-base-border
                rounded-xl
                overflow-hidden
              ">

                {/* Card Header */}
                <div className="
                  px-6 py-5
                  border-b border-base-border
                  flex items-center gap-3
                ">

                  <div className="
                    w-10 h-10
                    rounded-lg
                    bg-amber-400/15
                    flex items-center justify-center
                  ">
                    <UserRound
                      size={20}
                      className="text-amber-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      User Information
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Update the user's account details
                    </p>
                  </div>

                </div>

                {/* Form Body */}
                <div className="p-6">

                  {/* Error */}
                  {error && (
                    <div className="
                      mb-5
                      rounded-lg
                      border border-rose-500/20
                      bg-rose-500/10
                      px-4 py-3
                      text-sm text-rose-400
                    ">
                      {error}
                    </div>
                  )}

                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  ">

                    {/* Name */}
                    <div>
                      <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-300
                        mb-2
                      ">
                        Name
                        <span className="text-rose-400"> *</span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="Enter full name"
                        className="
                          w-full
                          bg-base-800
                          border border-base-border
                          rounded-lg
                          px-3.5 py-2.5
                          text-sm text-white
                          placeholder:text-slate-500
                          focus:outline-none
                          focus:ring-1
                          focus:ring-amber-400/50
                          disabled:opacity-50
                        "
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-300
                        mb-2
                      ">
                        Email
                        <span className="text-rose-400"> *</span>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="user@example.com"
                        className="
                          w-full
                          bg-base-800
                          border border-base-border
                          rounded-lg
                          px-3.5 py-2.5
                          text-sm text-white
                          placeholder:text-slate-500
                          focus:outline-none
                          focus:ring-1
                          focus:ring-amber-400/50
                          disabled:opacity-50
                        "
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-300
                        mb-2
                      ">
                        New Password
                      </label>

                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        minLength={8}
                        disabled={saving}
                        placeholder="Leave blank to keep current password"
                        className="
                          w-full
                          bg-base-800
                          border border-base-border
                          rounded-lg
                          px-3.5 py-2.5
                          text-sm text-white
                          placeholder:text-slate-500
                          focus:outline-none
                          focus:ring-1
                          focus:ring-amber-400/50
                          disabled:opacity-50
                        "
                      />

                      <p className="text-xs text-slate-500 mt-1.5">
                        Leave blank to keep the current password.
                      </p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="
                        block
                        text-sm
                        font-medium
                        text-slate-300
                        mb-2
                      ">
                        Role
                        <span className="text-rose-400"> *</span>
                      </label>

                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        className="
                          w-full
                          bg-base-800
                          border border-base-border
                          rounded-lg
                          px-3.5 py-2.5
                          text-sm text-white
                          focus:outline-none
                          focus:ring-1
                          focus:ring-amber-400/50
                          disabled:opacity-50
                        "
                      >
                        <option value="">
                          Select role
                        </option>

                        <option value="admin">
                          Admin
                        </option>

                        <option value="super_admin">
                          Super Admin
                        </option>

                        <option value="manager">
                          Manager
                        </option>

                        <option value="cashier">
                          Cashier
                        </option>

                        <option value="receptionist">
                          Receptionist
                        </option>

                        <option value="customer">
                          Customer
                        </option>
                      </select>
                    </div>

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
                    disabled={saving}
                    className="
                      px-4 py-2.5
                      rounded-lg
                      bg-base-800
                      border border-base-border
                      text-slate-300
                      text-sm font-medium
                      hover:bg-base-700
                      transition-colors
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
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
                      disabled:opacity-50
                    "
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>

                </div>

              </div>

            </form>
          )}

        </main>
      </div>
    </div>
  )
}
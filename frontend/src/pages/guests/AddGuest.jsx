import { useState } from 'react'
import {
  ArrowLeft,
  UserRound,
  Save,
  Loader2,
} from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { createWalkInGuest } from '../../api/admin'
import SuccessModal from '../../components/rooms/SuccessModal'

export default function AddGuest({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    identification_type: '',
    identification_number: '',
    nationality: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  setLoading(true)
  setError(null)

  try {
    await createWalkInGuest(form)

    // Show success modal
    setShowSuccess(true)
  } catch (err) {
    setError(err.message || 'Failed to create guest')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="flex bg-base-850 min-h-screen">
         {showSuccess && (
      <SuccessModal
        message="Guest has been added successfully."
        onClose={() => {
          setShowSuccess(false)
          onNavigate?.('Guests')
        }}
      />
    )}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Guests"
        onNavigate={onNavigate}
      />

      <div className="flex-1 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1200px] mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => onNavigate?.('guests')}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                         bg-base-800 border border-base-border
                         text-slate-300 hover:bg-base-700
                         transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Add Guest
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                Create a walk-in guest profile
              </p>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit}>

            <div className="bg-base-850 border border-base-border rounded-xl overflow-hidden">

              {/* Card Header */}
              <div className="px-6 py-5 border-b border-base-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/15 flex items-center justify-center">
                  <UserRound
                    size={20}
                    className="text-amber-400"
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Guest Information
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the information provided by the guest
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">

                {error && (
                  <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name <span className="text-rose-400">*</span>
                    </label>

                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter first name"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name <span className="text-rose-400">*</span>
                    </label>

                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter last name"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="guest@example.com"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* Identification Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Identification Type
                    </label>

                    <select
                      name="identification_type"
                      value={form.identification_type}
                      onChange={handleChange}
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    >
                      <option value="">Select identification type</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="driving_license">Driving License</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Identification Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Identification Number
                    </label>

                    <input
                      type="text"
                      name="identification_number"
                      value={form.identification_number}
                      onChange={handleChange}
                      placeholder="Enter identification number"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nationality
                    </label>

                    <input
                      type="text"
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      placeholder="e.g. Cambodian"
                      className="w-full bg-base-800 border border-base-border
                                 rounded-lg px-3.5 py-2.5
                                 text-sm text-white
                                 placeholder:text-slate-500
                                 focus:outline-none focus:ring-1
                                 focus:ring-amber-400/50"
                    />
                  </div>

                </div>

                {/* Address */}
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter guest address"
                    className="w-full bg-base-800 border border-base-border
                               rounded-lg px-3.5 py-2.5
                               text-sm text-white
                               placeholder:text-slate-500
                               resize-none
                               focus:outline-none focus:ring-1
                               focus:ring-amber-400/50"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-base-border
                              flex items-center justify-end gap-3">

                <button
                  type="button"
                  onClick={() => onNavigate?.('guests')}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg
                             bg-base-800 border border-base-border
                             text-slate-300 text-sm font-medium
                             hover:bg-base-700 transition-colors
                             disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2
                             px-4 py-2.5 rounded-lg
                             bg-amber-400 hover:bg-amber-500
                             text-base-950 text-sm font-semibold
                             transition-colors
                             disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Guest
                    </>
                  )}
                </button>

              </div>

            </div>

          </form>
        </main>
      </div>
    </div>
  )
}
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  UserRound,
  Loader2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  CalendarDays,
} from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { getGuest } from '../../api/admin'

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
        <Icon size={14} />
        <span>{label}</span>
      </div>

      <p className="text-sm text-slate-200">
        {value || '—'}
      </p>
    </div>
  )
}

export default function ViewGuest({ guestId, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadGuest() {
      if (!guestId) {
        setError('Guest ID is missing.')
        setLoading(false)
        return
      }

      try {
        const response = await getGuest(guestId)

        // Support common Laravel response shapes
        const data = response.data ?? response

        setGuest(data)
      } catch (err) {
        setError(err.message || 'Failed to load guest')
      } finally {
        setLoading(false)
      }
    }

    loadGuest()
  }, [guestId])

  const fullName = guest
    ? `${guest.first_name ?? ''} ${guest.last_name ?? ''}`.trim()
    : ''

  const initials = (fullName || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex bg-base-850 min-h-screen">
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
              className="w-9 h-9 flex items-center justify-center
                         rounded-lg bg-base-800
                         border border-base-border
                         text-slate-300 hover:bg-base-700
                         transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Guest Details
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                View guest information
              </p>
            </div>

          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-base-850 border border-base-border rounded-xl p-12 text-center">
              <Loader2
                size={28}
                className="animate-spin inline-block text-amber-400 mb-3"
              />

              <p className="text-sm text-slate-400">
                Loading guest...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-base-850 border border-rose-500/20 rounded-xl p-8">
              <p className="text-sm text-rose-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => onNavigate?.('guests')}
                className="mt-4 px-4 py-2 rounded-lg
                           bg-base-800 border border-base-border
                           text-slate-300 text-sm
                           hover:bg-base-700"
              >
                Back to Guests
              </button>
            </div>
          )}

          {/* Guest */}
          {!loading && !error && guest && (
            <div className="space-y-5">

              {/* Profile Header */}
              <div className="bg-base-850 border border-base-border rounded-xl p-6">

                <div className="flex items-center gap-4">

                  <div
                    className="w-16 h-16 rounded-full
                               bg-amber-400/15 text-amber-400
                               flex items-center justify-center
                               text-lg font-bold"
                  >
                    {initials}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {fullName || 'Unnamed Guest'}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Guest ID #{guest.id}
                    </p>
                  </div>

                </div>

              </div>

              {/* Information */}
              <div className="bg-base-850 border border-base-border rounded-xl overflow-hidden">

                <div className="px-6 py-5 border-b border-base-border flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-amber-400/15 flex items-center justify-center">
                    <UserRound
                      size={20}
                      className="text-amber-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Personal Information
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Guest profile details
                    </p>
                  </div>

                </div>

                <div className="p-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    <DetailItem
                      icon={Mail}
                      label="Email"
                      value={guest.email || guest.user?.email}
                    />

                    <DetailItem
                      icon={Phone}
                      label="Phone"
                      value={guest.phone}
                    />

                    <DetailItem
                      icon={Globe}
                      label="Nationality"
                      value={guest.nationality}
                    />

                    <DetailItem
                      icon={CreditCard}
                      label="Identification Type"
                      value={guest.identification_type}
                    />

                    <DetailItem
                      icon={CreditCard}
                      label="Identification Number"
                      value={guest.identification_number}
                    />

                    <DetailItem
                      icon={CalendarDays}
                      label="Created"
                      value={
                        guest.created_at
                          ? guest.created_at.slice(0, 10)
                          : null
                      }
                    />

                  </div>

                  <div className="mt-6 pt-6 border-t border-base-border">

                    <DetailItem
                      icon={MapPin}
                      label="Address"
                      value={guest.address}
                    />

                  </div>

                </div>

              </div>

              {/* Back */}
              <div className="flex justify-end">

                <button
                  type="button"
                  onClick={() => onNavigate?.('guests')}
                  className="inline-flex items-center gap-2
                             px-4 py-2.5 rounded-lg
                             bg-base-800 border border-base-border
                             text-slate-300 text-sm font-medium
                             hover:bg-base-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Guests
                </button>

              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
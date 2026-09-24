import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { updateReservation } from '../../api/reservationsAdmin'

const toInputDate = (value) => String(value ?? '').slice(0, 10)

export default function EditReservationModal({ reservation, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    children: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const guest = reservation?.raw?.guest ?? {}

    setForm({
      first_name: guest.first_name ?? '',
      last_name: guest.last_name ?? '',
      email: guest.email ?? '',
      phone: guest.phone ?? '',
      check_in_date: toInputDate(reservation?.raw?.check_in_date),
      check_out_date: toInputDate(reservation?.raw?.check_out_date),
      adults: reservation?.raw?.adults ?? 1,
      children: reservation?.raw?.children ?? 0,
    })
    setError('')
  }, [reservation])

  if (!reservation) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Please enter the guest first and last name.')
      return
    }

    if (!form.check_in_date || !form.check_out_date) {
      setError('Please select both check-in and check-out dates.')
      return
    }

    if (form.check_out_date <= form.check_in_date) {
      setError('Check-out date must be after check-in date.')
      return
    }

    try {
      setSaving(true)

      const response = await updateReservation(reservation.dbId, {
        guest: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        },
        check_in_date: form.check_in_date,
        check_out_date: form.check_out_date,
        adults: Number(form.adults || 1),
        children: Number(form.children || 0),
      })

      onSaved?.(response)
    } catch (err) {
      setError(err?.message || 'Failed to update reservation.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-base-border bg-base-850 shadow-2xl">
        <div className="flex items-center justify-between border-b border-base-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Reservation</h2>
            <p className="mt-1 text-xs text-slate-500">{reservation.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 hover:bg-base-800 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Guest Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" />
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Stay Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-400">
                Check-in
                <input name="check_in_date" type="date" value={form.check_in_date} onChange={handleChange} className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 mt-1" />
              </label>
              <label className="text-xs text-slate-400">
                Check-out
                <input name="check_out_date" type="date" value={form.check_out_date} onChange={handleChange} className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 mt-1" />
              </label>
              <label className="text-xs text-slate-400">
                Adults
                <input name="adults" type="number" min="1" value={form.adults} onChange={handleChange} className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 mt-1" />
              </label>
              <label className="text-xs text-slate-400">
                Children
                <input name="children" type="number" min="0" value={form.children} onChange={handleChange} className="w-full rounded-lg border border-base-border bg-base-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400 mt-1" />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-base-border pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-base-border px-4 py-2 text-sm text-slate-300 hover:bg-base-800 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-base-950 hover:bg-amber-500 disabled:opacity-50">
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

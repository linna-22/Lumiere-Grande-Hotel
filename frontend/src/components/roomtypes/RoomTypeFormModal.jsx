import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiFetch } from '../../api/client'
import { useFacilities } from '../../hooks/useFacilities'

const STATUS_OPTIONS = ['active', 'inactive']

const emptyForm = {
  name: '',
  description: '',
  capacity: '',
  base_price: '',
  max_occupancy: '',
  status: 'active',
  facility_ids: [],
}

export default function RoomTypeFormModal({ roomType, onClose, onSuccess }) {
  const isEditMode = Boolean(roomType)
  const { facilities, loading: loadingFacilities } = useFacilities()

  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (roomType) {
      setForm({
        name: roomType.name ?? '',
        description: roomType.description ?? '',
        capacity: roomType.capacity ?? '',
        base_price: roomType.basePrice ?? '',
        max_occupancy: roomType.maxOccupancy ?? '',
        status: roomType.status ?? 'Active',
        // facility objects on the normalized room type carry their real id —
        // use those ids to pre-check the matching boxes below
        facility_ids: (roomType.facilities ?? [])
          .map((f) => f.id)
          .filter((id) => id !== null && id !== undefined),
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [roomType])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleFacility(facilityId) {
    setForm((prev) => {
      const isSelected = prev.facility_ids.includes(facilityId)
      return {
        ...prev,
        facility_ids: isSelected
          ? prev.facility_ids.filter((id) => id !== facilityId)
          : [...prev.facility_ids, facilityId],
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = {
      name: form.name,
      description: form.description,
      capacity: form.capacity ? Number(form.capacity) : null,
      base_price: form.base_price ? Number(form.base_price) : 0,
      max_occupancy: form.max_occupancy ? Number(form.max_occupancy) : null,
      status: form.status,
      facility_ids: form.facility_ids,
    }

    try {
      if (isEditMode) {
        await apiFetch(`/room-types/${roomType.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await apiFetch('/room-types', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      onSuccess?.(isEditMode ? 'update' : 'create')
      onClose()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setErrors({ general: [err.message] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
          <h2 className="text-white font-serif text-xl font-bold">
            {isEditMode ? 'Edit Room Type' : 'Add New Room Type'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {errors.general && <p className="text-rose-400 text-sm">{errors.general[0]}</p>}

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Deluxe Suite"
              required
              className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="2"
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              {errors.capacity && (
                <p className="text-rose-400 text-xs mt-1">{errors.capacity[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Base Price ($) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="base_price"
                value={form.base_price}
                onChange={handleChange}
                placeholder="0"
                required
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              {errors.base_price && (
                <p className="text-rose-400 text-xs mt-1">{errors.base_price[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Max Occupancy</label>
              <input
                type="number"
                name="max_occupancy"
                value={form.max_occupancy}
                onChange={handleChange}
                placeholder="4"
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Facilities</label>
            {loadingFacilities ? (
              <p className="text-sm text-slate-500">Loading facilities...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {facilities.map((f) => {
                  const checked = form.facility_ids.includes(f.id)
                  return (
                    <label
                      key={f.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'bg-amber-400/10 border-amber-400/50 text-amber-400'
                          : 'bg-base-850 border-base-border text-slate-300 hover:bg-base-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFacility(f.id)}
                        className="accent-amber-400"
                      />
                      {f.name}
                    </label>
                  )
                })}

                {facilities.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-full">No facilities available.</p>
                )}
              </div>
            )}
            {errors.facility_ids && (
              <p className="text-rose-400 text-xs mt-1">{errors.facility_ids[0]}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Room type description..."
              rows={3}
              className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Room Type' : 'Add Room Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
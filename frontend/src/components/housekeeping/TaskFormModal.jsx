import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import useLookups from './Uselookups'
import { getErrorMessage } from './Housekeepingutils'

const TASK_TYPES = [
  'Daily Cleaning',
  'Checkout Clean',
  'Deep Clean',
  'Turn Down',
  'Inspection',
]

const fieldClass =
  'w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400'

/**
 * Creates a new housekeeping task.
 * Backend fields: room_id (required), task_type (required),
 * assigned_to (optional), notes (optional).
 */
export default function TaskFormModal({ onClose, onSubmit }) {
  const { rooms, staff, loading, error: lookupError } = useLookups()

  const [form, setForm] = useState({
    room_id: '',
    task_type: '',
    assigned_to: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function update(key) {
    return (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await onSubmit({
        room_id: Number(form.room_id),
        task_type: form.task_type.trim(),
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        notes: form.notes.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-base-850 border border-base-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
          <h3 className="text-lg font-semibold text-white font-serif">
            New Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {(error || lookupError) && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
              {error || lookupError}
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Room</label>
            <select
              value={form.room_id}
              onChange={update('room_id')}
              required
              disabled={loading}
              className={fieldClass}
            >
              <option value="">
                {loading ? 'Loading rooms…' : 'Select a room'}
              </option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number}
                  {r.floor != null ? ` · Floor ${r.floor}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Task type
            </label>
            <input
              type="text"
              list="housekeeping-task-types"
              value={form.task_type}
              onChange={update('task_type')}
              placeholder="e.g. Daily Cleaning"
              required
              className={fieldClass}
            />
            <datalist id="housekeeping-task-types">
              {TASK_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Assign to <span className="text-slate-600">(optional)</span>
            </label>
            <select
              value={form.assigned_to}
              onChange={update('assigned_to')}
              disabled={loading}
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={update('notes')}
              className={fieldClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-base-800 border border-base-border text-slate-200 hover:bg-base-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 transition-colors"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
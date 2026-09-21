import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import useLookups from './Uselookups'
import { getErrorMessage } from './Housekeepingutils'

/**
 * Assigns (or reassigns) a task to a staff member.
 * Backend: PATCH api/housekeeping/tasks/{id}/assign  { assigned_to }
 */
export default function AssignStaffModal({ task, onClose, onSubmit }) {
  const { staff, loading, error: lookupError } = useLookups()

  const [userId, setUserId] = useState(
    task.assignedToId ? String(task.assignedToId) : ''
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await onSubmit(task.id, Number(userId))
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-base-850 border border-base-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
          <h3 className="text-lg font-semibold text-white font-serif">
            Assign staff · Room {task.room}
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
            <label className="text-sm text-slate-400 mb-1.5 block">
              {task.task}
            </label>
            <select
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value)
                setError('')
              }}
              required
              disabled={loading}
              className="w-full bg-base-800 border border-base-border rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="">
                {loading ? 'Loading staff…' : 'Select staff member'}
              </option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-base-800 border border-base-border text-slate-200 hover:bg-base-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading || !userId}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 transition-colors"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
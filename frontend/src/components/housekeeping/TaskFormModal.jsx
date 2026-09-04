import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential Suite']
const TASK_TYPES = ['Daily Cleaning', 'Checkout Clean', 'Turn Down', 'Deep Clean', 'Inspection']
const PRIORITIES = ['Normal', 'High', 'Urgent']
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Inspected']

const emptyForm = {
  room: '',
  floor: '',
  roomType: 'Standard',
  taskType: 'Daily Cleaning',
  assignedTo: '',
  priority: 'Normal',
  status: 'Pending',
  notes: '',
}

export default function TaskFormModal({ task, onClose, onSubmit }) {
  const isEditMode = Boolean(task)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (task) {
      setForm({
        room: task.room ?? '',
        floor: task.floor ?? '',
        roomType: task.roomType ?? 'Standard',
        taskType: task.task ?? 'Daily Cleaning',
        assignedTo: task.assignedTo ?? '',
        priority: task.priority ?? 'Normal',
        status: task.status ?? 'Pending',
        notes: task.notes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [task])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: POST /api/housekeeping-tasks or PUT /api/housekeeping-tasks/{id}
    onSubmit?.(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
          <h2 className="text-white font-serif text-xl font-bold">
            {isEditMode ? 'Edit Task' : 'New Housekeeping Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Room Number <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="room"
                value={form.room}
                onChange={handleChange}
                placeholder="e.g. 201"
                required
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Floor</label>
              <input
                type="number"
                name="floor"
                value={form.floor}
                onChange={handleChange}
                placeholder="1"
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Room Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Task Type</label>
              <select
                name="taskType"
                value={form.taskType}
                onChange={handleChange}
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Assigned To <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                placeholder="Staff member name"
                required
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {isEditMode && (
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes..."
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
              className="bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
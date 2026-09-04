import { AlertTriangle, X } from 'lucide-react'

export default function DeleteTaskModal({ room, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-border">
          <h2 className="text-white font-serif font-bold text-lg">Delete Task</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex items-center gap-3">
          <AlertTriangle size={20} className="text-rose-400 shrink-0" />
          <p className="text-slate-300 text-sm">
            Delete housekeeping task for Room {room}?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
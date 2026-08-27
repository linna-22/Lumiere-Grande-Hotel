import { AlertTriangle } from 'lucide-react'

export default function ConfirmDeleteModal({ room, onCancel, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle size={48} className="text-rose-400" />
        </div>
        <h2 className="text-white font-serif text-lg font-bold mb-1">Delete Room</h2>
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to delete Room {room?.number}? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
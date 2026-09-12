import {
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react'

export default function UserDeleteModal({
  user,
  loading,
  onClose,
  onConfirm,
}) {
  if (!user) return null

  return (
    <div className="
      fixed inset-0
      z-[60]
      bg-black/60
      flex items-center justify-center
      p-4
    ">

      <div className="
        bg-base-900
        border border-base-border
        rounded-2xl
        w-full max-w-sm
        p-6
        shadow-2xl
      ">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="
            w-14 h-14
            rounded-full
            bg-rose-500/10
            flex items-center justify-center
          ">
            <AlertTriangle
              size={28}
              className="text-rose-400"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="
          text-white
          font-serif
          text-lg
          font-bold
          text-center
        ">
          Delete User?
        </h2>

        {/* Message */}
        <p className="
          text-sm
          text-slate-400
          text-center
          mt-2
        ">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">
            {user.name}
          </span>
          ? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex-1
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
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              inline-flex
              items-center
              justify-center
              gap-2
              px-4 py-2.5
              rounded-lg
              bg-rose-500
              hover:bg-rose-600
              text-white
              text-sm font-semibold
              transition-colors
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  )
}
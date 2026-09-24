import { AlertTriangle, X, Loader2 } from "lucide-react";

export default function CancelReservationModal({
  reservation,
  loading = false,
  onClose,
  onConfirm,
}) {
  if (!reservation) return null;

  const guestName =
    reservation?.guest?.name ??
    `${reservation?.guest?.first_name ?? ""} ${
      reservation?.guest?.last_name ?? ""
    }`.trim() ??
    "Guest";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Cancel Reservation
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to cancel this reservation?
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Reservation
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {reservation?.id ?? "-"}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4">
              <span className="text-sm text-slate-500">
                Guest
              </span>

              <span className="text-right text-sm font-semibold text-slate-900">
                {guestName || "Guest"}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-rose-600">
            This reservation will be marked as cancelled.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Keep Reservation
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}

            {loading ? "Cancelling..." : "Cancel Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}
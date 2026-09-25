import { AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";

export default function CancelReservationModal({
  reservation,
  loading = false,
  success = false,
  onClose,
  onConfirm,
}) {
  if (!reservation) return null;

  const guestName =
    typeof reservation?.guest === "string"
      ? reservation.guest
      : [reservation?.guest?.first_name, reservation?.guest?.last_name]
          .filter(Boolean)
          .join(" ") ||
        reservation?.guest?.name ||
        "Guest";

  // ==========================================
  // SUCCESS MODAL
  // ==========================================
  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-end px-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Content */}
          <div className="px-6 pb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Reservation Cancelled
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              The reservation has been cancelled successfully.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500">Reservation</span>

                <span className="text-sm font-semibold text-slate-900">
                  {reservation?.id ?? "-"}
                </span>
              </div>

              <div className="mt-2 flex justify-between gap-4">
                <span className="text-sm text-slate-500">Guest</span>

                <span className="text-right text-sm font-semibold text-slate-900">
                  {guestName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CONFIRMATION MODAL
  // ==========================================
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
              <span className="text-sm text-slate-500">Reservation</span>

              <span className="text-sm font-semibold text-slate-900">
                {reservation?.id ?? "-"}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4">
              <span className="text-sm text-slate-500">Guest</span>

              <span className="text-right text-sm font-semibold text-slate-900">
                {guestName}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-rose-600">
            Once this reservation is cancelled, the payment cannot be refunded.
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

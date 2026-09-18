import { CheckCircle2, Receipt, CalendarCheck, ArrowRight } from 'lucide-react'

export default function BookingSuccess({
  onNavigate,
  reservationId,
  amount,
  payment,
}) {
  const displayAmount =
    typeof amount === 'number' ? amount.toFixed(2) : amount

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-base-900 border border-base-border shadow-2xl overflow-hidden">

        {/* Success icon */}
        <div className="flex flex-col items-center pt-10 pb-6 px-6">

          <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center">
            <CheckCircle2
              size={36}
              className="text-emerald-400"
            />
          </div>

          <h1 className="text-xl font-semibold text-white mt-5">
            Payment Successful
          </h1>

          <p className="text-sm text-slate-400 text-center mt-2">
            Your reservation has been confirmed. A receipt
            has been generated for this booking.
          </p>

        </div>

        {/* Details */}
        <div className="mx-6 mb-6 rounded-xl bg-base-800 border border-base-border p-5 space-y-4">

          {reservationId && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <CalendarCheck size={16} />
                <span>Reservation ID</span>
              </div>

              <span className="text-sm font-medium text-white">
                #{reservationId}
              </span>
            </div>
          )}

          {displayAmount !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Receipt size={16} />
                <span>Amount Paid</span>
              </div>

              <span className="text-sm font-semibold text-amber-400">
                ${displayAmount}
              </span>
            </div>
          )}

          {payment?.status && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Status
              </span>

              <span className="text-xs font-medium uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400">
                {payment.status}
              </span>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="px-6 pb-8 space-y-3">

          <button
            type="button"
            onClick={() =>
              onNavigate?.('Reservations', { reservationId })
            }
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-base-950 transition-colors"
          >
            View Reservation
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('Dashboard')}
            className="w-full rounded-lg border border-base-border bg-base-800 hover:bg-base-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    </div>
  )
}

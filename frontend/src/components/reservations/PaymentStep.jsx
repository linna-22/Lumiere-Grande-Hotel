import { useState } from 'react'
import {
  CreditCard,
  WalletCards,
  Banknote,
  AlertCircle,
} from 'lucide-react'

export default function PaymentStep({
  form,
  onChange,
  onBack,
  onContinue,
}) {
  const [error, setError] = useState('')

  const nights = (() => {
    if (!form.check_in_date || !form.check_out_date) {
      return 0
    }

    const checkIn = new Date(
      `${form.check_in_date}T00:00:00`
    )

    const checkOut = new Date(
      `${form.check_out_date}T00:00:00`
    )

    const difference = checkOut - checkIn

    const calculatedNights = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    )

    return calculatedNights > 0
      ? calculatedNights
      : 0
  })()

  const rooms = form.rooms || []

  const subtotal = rooms.reduce((total, room) => {
    return (
      total +
      Number(room.nightly_rate || 0) * nights
    )
  }, 0)

  const tax = Number(form.tax || 0)
  const discount = Number(form.discount || 0)

  const totalAmount = Math.max(
    0,
    subtotal + tax - discount
  )

  const paymentOption =
    form.payment_option || 'full'

  const depositAmount =
    totalAmount * 0.5

  const amountToPay =
    paymentOption === 'deposit'
      ? depositAmount
      : totalAmount

  const handlePaymentOptionChange = (option) => {
    onChange({
      payment_option: option,
    })

    setError('')
  }

  const handlePaymentMethodChange = (method) => {
    onChange({
      payment_method: method,
    })

    setError('')
  }

  const handleContinue = () => {
    if (!form.payment_option) {
      setError('Please select a payment option.')
      return
    }

    if (!form.payment_method) {
      setError('Please select a payment method.')
      return
    }

    setError('')
    onContinue?.()
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Payment
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Select the payment option and payment method
          for this reservation.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">

          <AlertCircle
            size={18}
            className="text-rose-400 mt-0.5 shrink-0"
          />

          <p className="text-sm text-rose-300">
            {error}
          </p>

        </div>
      )}

      {/* Reservation Amount */}
      <div className="bg-base-800 border border-base-border rounded-xl p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Reservation Total
            </p>

            <p className="text-2xl font-bold text-amber-400 mt-1">
              ${totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              {rooms.length} room
              {rooms.length !== 1 ? 's' : ''}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {nights} night
              {nights !== 1 ? 's' : ''}
            </p>
          </div>

        </div>

        <div className="mt-4 pt-4 border-t border-base-border space-y-2">

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Room subtotal
            </span>

            <span className="text-slate-200">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Tax
            </span>

            <span className="text-slate-200">
              ${tax.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Discount
            </span>

            <span className="text-slate-200">
              -${discount.toFixed(2)}
            </span>
          </div>

        </div>

      </div>

      {/* Payment Option */}
      <div>

        <h3 className="text-sm font-semibold text-white mb-3">
          Payment Option
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Full Payment */}
          <button
            type="button"
            onClick={() =>
              handlePaymentOptionChange('full')
            }
            className={`text-left rounded-xl border p-5 transition-all ${
              paymentOption === 'full'
                ? 'border-amber-400/70 bg-amber-400/5 ring-1 ring-amber-400/20'
                : 'border-base-border bg-base-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentOption === 'full'
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'bg-base-900 text-slate-500'
                  }`}
                >
                  <Banknote size={20} />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Full Payment
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Pay the complete amount
                  </p>
                </div>

              </div>

              {paymentOption === 'full' && (
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-base-950" />
                </div>
              )}

            </div>

            <p className="text-lg font-bold text-amber-400 mt-4">
              ${totalAmount.toFixed(2)}
            </p>
          </button>

          {/* Deposit */}
          <button
            type="button"
            onClick={() =>
              handlePaymentOptionChange('deposit')
            }
            className={`text-left rounded-xl border p-5 transition-all ${
              paymentOption === 'deposit'
                ? 'border-amber-400/70 bg-amber-400/5 ring-1 ring-amber-400/20'
                : 'border-base-border bg-base-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentOption === 'deposit'
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'bg-base-900 text-slate-500'
                  }`}
                >
                  <WalletCards size={20} />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    50% Deposit
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Pay half of the reservation
                  </p>
                </div>

              </div>

              {paymentOption === 'deposit' && (
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-base-950" />
                </div>
              )}

            </div>

            <p className="text-lg font-bold text-amber-400 mt-4">
              ${depositAmount.toFixed(2)}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Remaining: $
              {(totalAmount - depositAmount).toFixed(2)}
            </p>

          </button>

        </div>

      </div>

      {/* Payment Method */}
      <div>

        <h3 className="text-sm font-semibold text-white mb-3">
          Payment Method
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Bakong */}
          <button
            type="button"
            onClick={() =>
              handlePaymentMethodChange('bakong_khqr')
            }
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
              form.payment_method === 'bakong_khqr'
                ? 'border-amber-400/70 bg-amber-400/5'
                : 'border-base-border bg-base-800 hover:border-slate-600'
            }`}
          >
            <WalletCards
              size={20}
              className={
                form.payment_method === 'bakong_khqr'
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }
            />

            <span className="text-sm font-medium text-white">
              Bakong KHQR
            </span>
          </button>

          {/* Credit Card */}
          <button
            type="button"
            onClick={() =>
              handlePaymentMethodChange('credit_card')
            }
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
              form.payment_method === 'credit_card'
                ? 'border-amber-400/70 bg-amber-400/5'
                : 'border-base-border bg-base-800 hover:border-slate-600'
            }`}
          >
            <CreditCard
              size={20}
              className={
                form.payment_method === 'credit_card'
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }
            />

            <span className="text-sm font-medium text-white">
              Credit Card
            </span>
          </button>

          {/* Stripe */}
          <button
            type="button"
            onClick={() =>
              handlePaymentMethodChange('stripe')
            }
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
              form.payment_method === 'stripe'
                ? 'border-amber-400/70 bg-amber-400/5'
                : 'border-base-border bg-base-800 hover:border-slate-600'
            }`}
          >
            <CreditCard
              size={20}
              className={
                form.payment_method === 'stripe'
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }
            />

            <span className="text-sm font-medium text-white">
              Stripe
            </span>
          </button>

        </div>

      </div>

      {/* Payment Summary */}
      <div className="bg-base-800 border border-amber-400/30 rounded-xl p-5">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Amount to Pay
            </p>

            <p className="text-2xl font-bold text-amber-400 mt-1">
              ${amountToPay.toFixed(2)}
            </p>
          </div>

          <div className="text-right">

            <p className="text-xs text-slate-500">
              {paymentOption === 'deposit'
                ? '50% deposit'
                : 'Full payment'}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {form.payment_method === 'bakong_khqr'
                ? 'Bakong KHQR'
                : form.payment_method === 'credit_card'
                  ? 'Credit Card'
                  : 'Stripe'}
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-base-border">

        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-lg border border-base-border bg-base-800 hover:bg-base-700 text-slate-200 text-sm font-medium transition-colors"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm transition-colors"
        >
          Add Reservation
        </button>

      </div>

    </div>
  )
}
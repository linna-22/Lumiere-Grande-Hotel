import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
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
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)

  //Payment step
  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || '/api'
  ).replace(/\/$/, '')

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

  /**
   * Generate KHQR after the reservation and invoice have
   * already been created by the parent booking flow.
   */
  const generateKhqrPayment = async () => {
    if (!form.reservation_id) {
      setError('Reservation ID is missing. Please create the reservation first.')
      return
    }

    if (!form.invoice_id) {
      setError('Invoice ID is missing. Please create the invoice first.')
      return
    }

    if (amountToPay <= 0) {
      setError('The payment amount must be greater than zero.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/khqr/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            reservation_id: form.reservation_id,
            invoice_id: form.invoice_id,
            amount: Number(amountToPay.toFixed(2)),
            currency: form.currency || 'USD',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : data.message

        throw new Error(
          validationMessage || 'Failed to generate KHQR payment.'
        )
      }

      if (!data.payment_id || !data.qr_code) {
        throw new Error('Invalid KHQR response from the server.')
      }

      setPayment(data)
      setShowQrModal(true)
    } catch (err) {
      setError(err.message || 'Failed to generate KHQR payment.')
    } finally {
      setLoading(false)
    }
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

    if (form.payment_method === 'bakong_khqr') {
      generateKhqrPayment()
      return
    }

    // Credit Card / Stripe are not handled by the KHQR API yet.
    onContinue?.()
  }

  /**
   * Poll Bakong verification every 3 seconds.
   * Stop when paid, when the modal closes, or after 5 minutes.
   */
  useEffect(() => {
    if (!showQrModal || !payment?.payment_id) {
      return undefined
    }

    let stopped = false

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/payments/khqr/verify/${payment.payment_id}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to verify payment.'
          )
        }

        if (data.paid === true) {
          stopped = true

          onContinue?.({
            ...payment,
            status: 'completed',
            paid: true,
          })

          window.location.href = '/booking/success'
        }
      } catch (err) {
        if (!stopped) {
          setError(err.message || 'Unable to verify payment.')
        }
      }
    }

    // Verify immediately, then every 3 seconds.
    verifyPayment()

    const intervalId = setInterval(
      verifyPayment,
      3000
    )

    // Safety rule: stop polling after 5 minutes.
    const timeoutId = setTimeout(() => {
      stopped = true
      clearInterval(intervalId)
      setShowQrModal(false)
      setPayment(null)
      setError(
        'Payment window expired. Please generate a new KHQR code.'
      )
    }, 5 * 60 * 1000)

    return () => {
      stopped = true
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [
    showQrModal,
    payment?.payment_id,
    API_BASE_URL,
    onContinue,
  ])

  const closeQrModal = () => {
    setShowQrModal(false)
    setPayment(null)
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
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-base-950 font-semibold text-sm transition-colors"
        >
          {loading
            ? 'Generating KHQR...'
            : form.payment_method === 'bakong_khqr'
              ? 'Generate KHQR'
              : 'Add Reservation'}
        </button>

      </div>

      {/* KHQR Payment Modal */}
      {showQrModal && payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-base-900 border border-base-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Scan to Pay
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Scan this KHQR with your Bakong app
                </p>
              </div>

              <button
                type="button"
                onClick={closeQrModal}
                className="text-slate-400 hover:text-white text-xl leading-none"
                aria-label="Close payment modal"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-center rounded-xl bg-white p-5">
                <QRCodeSVG
                  value={payment.qr_code}
                  size={260}
                  level="M"
                  includeMargin
                />
              </div>

              <div className="text-center mt-5">
                <p className="text-xs text-slate-500">
                  Amount to pay
                </p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  ${amountToPay.toFixed(2)}
                </p>
              </div>

              {payment.deeplink && (
                <a
                  href={payment.deeplink}
                  className="mt-5 flex items-center justify-center w-full rounded-lg bg-amber-400 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-base-950 transition-colors"
                >
                  Pay with Bakong App
                </a>
              )}

              <div className="mt-5 rounded-lg bg-base-800 border border-base-border p-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-xs text-slate-400">
                    Waiting for payment...
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-1">
                  Payment status is checked every 3 seconds.
                </p>
              </div>

              <button
                type="button"
                onClick={closeQrModal}
                className="mt-3 w-full rounded-lg border border-base-border bg-base-800 hover:bg-base-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
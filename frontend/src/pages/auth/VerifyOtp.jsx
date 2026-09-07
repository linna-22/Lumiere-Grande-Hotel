import { useEffect, useRef, useState } from 'react'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const OTP_LENGTH = 6
const RESEND_SECONDS = 60

export default function VerifyOtp({ email = '', userId, onNavigate }) {
  const { verifyOtp } = useAuth()
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  function handleChange(index, value) {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    setError('')

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((char, i) => (next[i] = char))
    setDigits(next)
    const lastFilled = Math.min(pasted.length, OTP_LENGTH) - 1
    inputRefs.current[lastFilled]?.focus()
  }

   async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await verifyOtp({ user_id: userId, otp_code: code })
      onNavigate?.('Dashboard')
    } catch (err) {
      if (err.status === 422) {
        setError(err.data?.message || 'Invalid code. Please try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleResend() {
    if (secondsLeft > 0) return
    // NOTE: no /api/resend-otp route exists in your route list yet — see note below.
    console.log('Resending OTP to', email)
    setSecondsLeft(RESEND_SECONDS)
    setDigits(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate?.('Login')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </button>

        <div className="bg-base-850 border border-base-border rounded-2xl p-8">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-amber-400/15 flex items-center justify-center">
              <Mail size={26} className="text-amber-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white font-serif tracking-tight text-center">
            Verify your email
          </h2>
          <p className="text-sm text-slate-400 text-center mt-2">
            We sent a 6-digit code to
            <br />
            <span className="text-slate-200 font-medium">{email || 'your email address'}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={submitting}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-white bg-base-800 border border-base-border rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-colors disabled:opacity-60"
                />
              ))}
            </div>

            {error && <p className="text-rose-400 text-sm text-center mt-4">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold py-2.5 rounded-lg transition-colors mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Didn't receive the code?
            {' '}
            {secondsLeft > 0 ? (
              <span className="text-slate-500">Resend in {secondsLeft}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
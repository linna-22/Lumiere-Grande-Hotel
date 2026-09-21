import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

const API = `${import.meta.env.VITE_SANCTUM_URL}/api`;
const OTP_LENGTH = 6;
const OTP_SECONDS = 180; // backend keeps the OTP for 3 minutes

// These endpoints are public, so a plain fetch is enough.
// "Accept: application/json" makes Laravel return JSON errors (422/429).
async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong. Please try again.");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Prefer the first Laravel validation message, fall back to the general message
function getErrorMessage(err) {
  const fieldErrors = err.data?.errors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors)[0];
    if (first?.[0]) return first[0];
  }
  return err.message;
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState("email"); // email | otp | password | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inputRefs = useRef([]);
  const otpValue = otp.join("");

  // Countdown while on the OTP step
  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [step, secondsLeft]);

  function goToLogin() {
    onNavigate?.("Login");
  }

  function resetOtpInputs() {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }

  // ---- Step 1: request OTP -------------------------------------------------
  async function sendOtp(e) {
    e?.preventDefault();
    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      await post("/forgot-password", { email: email.trim() });
      setSecondsLeft(OTP_SECONDS);
      resetOtpInputs();
      setStep("otp");
      setInfo(`We sent a 6-digit code to ${email.trim().toLowerCase()}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Step 2: verify OTP --------------------------------------------------
  async function verifyOtp(e) {
    e?.preventDefault();

    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");

    try {
      await post("/verify-reset-otp", {
        email: email.trim(),
        otp: otpValue,
      });
      setStep("password");
    } catch (err) {
      setError(getErrorMessage(err));

      if (err.status === 429) {
        // Too many attempts: backend deleted the OTP, user must request a new one
        setSecondsLeft(0);
      }
      resetOtpInputs();
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Step 3: set new password -------------------------------------------
  async function resetPassword(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await post("/reset-password", {
        email: email.trim(),
        otp: otpValue,
        password,
        password_confirmation: passwordConfirmation,
      });
      setStep("done");
    } catch (err) {
      setError(getErrorMessage(err));

      // OTP session expired: go back and request a new code
      if (err.status === 422 && !err.data?.errors) {
        setStep("otp");
        setSecondsLeft(0);
        resetOtpInputs();
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ---- OTP box handlers ----------------------------------------------------
  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setError("");

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus();
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  const inputClass =
    "w-full bg-base-850 border border-base-border rounded-lg pl-10 pr-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400";

  const primaryBtn =
    "w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold py-2.5 rounded-lg transition-colors";

  const headings = {
    email: ["Forgot password?", "Enter your email and we'll send you a verification code."],
    otp: ["Check your email", "Enter the 6-digit code to continue."],
    password: ["Create new password", "Choose a strong password for your account."],
    done: ["Password updated", "You can now sign in with your new password."],
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 p-6 sm:p-10">
      <div className="w-full max-w-md">
        {step !== "done" && (
          <button
            type="button"
            onClick={goToLogin}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>
        )}

        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
            {headings[step][0]}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{headings[step][1]}</p>
        </div>

        {/* Messages */}
        {info && !error && step === "otp" && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-3">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* STEP 1 — email */}
        {step === "email" && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className={inputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send verification code"
              )}
            </button>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === "otp" && (
          <form onSubmit={verifyOtp} className="space-y-5">
            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-semibold bg-base-850 border border-base-border rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              ))}
            </div>

            <p className="text-sm text-slate-400 text-center">
              {secondsLeft > 0 ? (
                <>
                  Code expires in{" "}
                  <span className="text-amber-400 font-medium">
                    {formatTime(secondsLeft)}
                  </span>
                </>
              ) : (
                "Your code has expired or was invalidated."
              )}
            </p>

            <button
              type="submit"
              disabled={submitting || otpValue.length !== OTP_LENGTH}
              className={primaryBtn}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setInfo("");
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                Change email
              </button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={submitting || secondsLeft > 0}
                className="text-amber-400 hover:text-amber-300 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — new password */}
        {step === "password" && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                New password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  autoFocus
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Confirm new password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    setError("");
                  }}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center space-y-6">
            <CheckCircle2 size={56} className="mx-auto text-emerald-400" />
            <button type="button" onClick={goToLogin} className={primaryBtn}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
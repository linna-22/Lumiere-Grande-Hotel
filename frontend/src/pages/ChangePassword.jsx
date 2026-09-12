import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import SuccessModal from "../components/rooms/SuccessModal";
import { changePassword } from "../api/user";
import { ApiError } from "../api/client";

export default function ChangePassword({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await changePassword(form);
      setShowSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors);
      } else if (err instanceof ApiError && err.status === 422) {
        // backend returns a plain `message` (not `errors`) for the
        // "current password doesn't match" case
        setErrors({ current_password: [err.data?.message || "Incorrect current password."] });
      } else {
        setErrors({ general: [err.message || "Failed to change password."] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    onNavigate?.("Dashboard");
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="Profile" onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
        <main className="p-4 sm:p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
            Change Password
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Use at least 8 characters, including letters, numbers, and symbols
          </p>

          <form onSubmit={handleSubmit} className="bg-base-850 border border-base-border rounded-2xl mt-6 p-6 sm:p-8 space-y-5">
            {errors.general && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
                {errors.general[0]}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show.current ? "text" : "password"}
                  name="current_password"
                  value={form.current_password}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-rose-400 text-xs mt-1">{errors.current_password[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show.next ? "text" : "password"}
                  name="new_password"
                  value={form.new_password}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-rose-400 text-xs mt-1">{errors.new_password[0]}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Confirm New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show.confirm ? "text" : "password"}
                  name="new_password_confirmation"
                  value={form.new_password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-10 pr-10 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {submitting ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("Profile")}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>

      {showSuccess && (
        <SuccessModal
          message="Your password has been updated successfully."
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
}
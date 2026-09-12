import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import SuccessModal from "../components/rooms/SuccessModal";
import { useAuth } from "../hooks/useAuth";
import { updateOwnProfile } from "../api/user";
import { ApiError } from "../api/client";

export default function EditProfile({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, checkSession } = useAuth();
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", email: user.email ?? "" });
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      // Only name/email are sent — never role/status, to avoid any risk
      // of a self-service edit form touching privileged fields.
      await updateOwnProfile(user.id, { name: form.name, email: form.email });
      await checkSession(); // refresh user in context with fresh DB values
      setShowSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors({ general: [err.message || "Failed to update profile."] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    onNavigate?.("Dashboard");
  }

  if (!user) {
    return (
      <div className="flex bg-base-850 min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="Profile" onNavigate={onNavigate} />
        <div className="flex-1 min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
          <main className="p-6 flex items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mr-2" size={18} />
            Loading...
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="Profile" onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
        <main className="p-4 sm:p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
            Edit Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">Update your name and email</p>

          <form onSubmit={handleSubmit} className="bg-base-850 border border-base-border rounded-2xl mt-6 p-6 sm:p-8 space-y-5">
            {errors.general && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
                {errors.general[0]}
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {submitting ? "Saving..." : "Save Changes"}
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
          message="Your profile has been updated successfully."
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
}
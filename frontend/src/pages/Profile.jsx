import { useState } from "react";
import { User, Mail, Shield, Calendar, Lock, Loader2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { useAuth } from "../hooks/useAuth";

function initials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role) {
  if (!role) return "—";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Profile({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Profile"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />
        <main className="p-4 sm:p-6 max-w-3xl mx-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              View your account details
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mr-2" size={18} />
              Loading profile...
            </div>
          )}

          {!loading && user && (
            <div className="bg-base-850 border border-base-border rounded-2xl mt-6 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border border-base-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl font-bold border border-base-border">
                    {initials(user.name)}
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold text-white">{user.name}</p>
                  <span className="inline-block mt-1 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-400">
                    {formatRole(user.role)}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mt-8">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-200 mt-0.5">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Account Status</p>
                    <p className="text-sm text-slate-200 mt-0.5 capitalize">
                      {user.status ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Member Since</p>
                    <p className="text-sm text-slate-200 mt-0.5">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User size={16} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-200 mt-0.5">
                      {user.is_2fa_enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-base-border my-6" />
            </div>
          )}

          {!loading && !user && (
            <div className="text-center py-20 text-slate-500">
              Unable to load profile. Please try logging in again.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
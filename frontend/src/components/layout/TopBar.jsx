import { useEffect, useRef, useState } from "react";
import { Cloud, Search, Plus, ChevronDown, Menu, X, User, LogOut } from "lucide-react";

export default function TopBar({ onMenuClick, onNavigate }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleViewProfile() {
    setProfileMenuOpen(false);
    onNavigate?.("Profile");
  }

  function handleLogout() {
    setProfileMenuOpen(false);
    // TODO: call POST /api/logout once wired to real auth, then onNavigate?.('Login')
    console.log("Logout clicked");
  }

  return (
    <header className="border-b border-base-border bg-base-900 sticky top-0 z-20">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-300 hover:text-white shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:flex items-center gap-3 text-sm text-slate-300 shrink-0">
            <span className="font-medium whitespace-nowrap">
              Sat, August 22, 2026
            </span>
            <div className="flex items-center gap-1.5 bg-base-800 px-3 py-1.5 rounded-2xl whitespace-nowrap">
              <Cloud size={15} className="text-sky-400" />
              <span>28°C - Phnom Penh</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 sm:pl-2 rounded-lg hover:bg-base-800 transition-colors py-1 pr-2"
            >
              <img
                src="https://i.pinimg.com/1200x/36/9d/8c/369d8c1a01f21c357fd77dd6538eaea5.jpg"
                alt="Lina Oeu"
                className="w-9 h-9 rounded-full object-cover border border-base-border"
              />
              <div className="leading-tight hidden xl:block text-left">
                <p className="text-sm font-semibold text-white">Lina Oeu</p>
                <p className="text-[11px] text-amber-400">Developer</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 hidden xl:block transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-base-850 border border-base-border rounded-xl shadow-lg overflow-hidden py-1.5 z-30">
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-base-800 transition-colors"
                >
                  <User size={15} />
                  View Profile
                </button>
                <div className="h-px bg-base-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search drawer */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              autoFocus
              type="text"
              placeholder="Search guests, rooms, bookings..."
              className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-9 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Date/weather row for small screens where it's hidden up top */}
      <div className="md:hidden flex items-center gap-2 text-xs text-slate-400 px-4 pb-3">
        <span className="whitespace-nowrap">Sat, August 22, 2026</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Cloud size={12} className="text-sky-400" /> 28°C - Dasmariñas
        </span>
      </div>
    </header>
  );
}
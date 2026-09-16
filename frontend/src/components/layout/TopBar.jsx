import { useEffect, useRef, useState } from "react";
import {
  Cloud,
  Search,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  Pencil,
  Lock,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import UserAvatar from "../common/UserAvatar";

function formatRole(role) {
  if (!role) return "";

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export default function TopBar({ onMenuClick, onNavigate }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef(null);

  const { user, logout } = useAuth();

  // Automatically gets today's date
  const today = getToday();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleViewProfile() {
    setProfileMenuOpen(false);
    onNavigate?.("Profile");
  }

  function handleEditProfile() {
    setProfileMenuOpen(false);
    onNavigate?.("EditProfile");
  }

  function handleChangePassword() {
    setProfileMenuOpen(false);
    onNavigate?.("ChangePassword");
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setLoggingOut(false);
      onNavigate?.("Login");
    }
  }

  return (
    <header className="border-b border-base-border bg-[#091326] sticky top-0 z-20">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 gap-2">
        {/* ========================================
            LEFT SIDE
        ======================================== */}
        <div className="flex items-center gap-1 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-300 hover:text-white shrink-0"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Date + Weather */}
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-300 shrink-0">
            {/* Today's date */}
            <span className="font-medium whitespace-nowrap">
              {today}
            </span>

            {/* Weather */}
            <div className="flex items-center gap-1.5 bg-base-800 px-3 py-1.5 rounded-2xl whitespace-nowrap">
              <Cloud
                size={15}
                className="text-sky-400"
              />

              <span>
                28°C - Phnom Penh
              </span>
            </div>
          </div>
        </div>

        {/* ========================================
            RIGHT SIDE
        ======================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="relative"
            ref={profileRef}
          >
            {/* Profile button */}
            <button
              onClick={() =>
                setProfileMenuOpen((value) => !value)
              }
              className="
                flex
                items-center
                gap-2
                pl-1
                sm:pl-2
                rounded-lg
                hover:bg-base-800
                transition-colors
                py-1
                pr-2
              "
            >
              {/* User avatar */}
              <UserAvatar user={user} />

              {/* User information */}
              <div className="leading-tight hidden xl:block text-left">
                <p className="text-sm font-semibold text-white">
                  {user?.name ?? "..."}
                </p>

                <p className="text-[11px] text-amber-400">
                  {formatRole(user?.role)}
                </p>
              </div>

              {/* Dropdown arrow */}
              <ChevronDown
                size={14}
                className={`
                  text-slate-400
                  hidden
                  xl:block
                  transition-transform
                  ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* ========================================
                PROFILE DROPDOWN
            ======================================== */}
            {profileMenuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-2
                  w-48
                  bg-base-850
                  border
                  border-base-border
                  rounded-xl
                  shadow-lg
                  overflow-hidden
                  py-1.5
                  z-30
                "
              >
                {/* View Profile */}
                <button
                  onClick={handleViewProfile}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2.5
                    px-4
                    py-2.5
                    text-sm
                    text-slate-200
                    hover:bg-base-800
                    transition-colors
                  "
                >
                  <User size={15} />
                  View Profile
                </button>

                {/* Edit Profile */}
                <button
                  onClick={handleEditProfile}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2.5
                    px-4
                    py-2.5
                    text-sm
                    text-slate-200
                    hover:bg-base-800
                    transition-colors
                  "
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>

                {/* Change Password */}
                <button
                  onClick={handleChangePassword}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2.5
                    px-4
                    py-2.5
                    text-sm
                    text-slate-200
                    hover:bg-base-800
                    transition-colors
                  "
                >
                  <Lock size={15} />
                  Change Password
                </button>

                {/* Divider */}
                <div className="h-px bg-base-border my-1" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2.5
                    px-4
                    py-2.5
                    text-sm
                    text-rose-400
                    hover:bg-rose-500/10
                    transition-colors
                    disabled:opacity-60
                  "
                >
                  <LogOut size={15} />

                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          MOBILE SEARCH DRAWER
      ======================================== */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-500
              "
            />

            <input
              autoFocus
              type="text"
              placeholder="Search guests, rooms, bookings..."
              className="
                w-full
                bg-base-800
                border
                border-base-border
                rounded-lg
                pl-9
                pr-9
                py-2
                text-sm
                text-slate-200
                placeholder:text-slate-500
                focus:outline-none
                focus:ring-1
                focus:ring-amber-400/50
              "
            />

            <button
              onClick={() =>
                setMobileSearchOpen(false)
              }
              className="
                absolute
                right-2.5
                top-1/2
                -translate-y-1/2
                text-slate-500
                hover:text-slate-300
              "
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          MOBILE DATE + WEATHER
      ======================================== */}
      <div
        className="
          md:hidden
          flex
          items-center
          gap-2
          text-xs
          text-slate-400
          px-4
          pb-3
        "
      >
        {/* Today's date */}
        <span className="whitespace-nowrap">
          {today}
        </span>

        <span className="text-slate-600">
          •
        </span>

        {/* Weather */}
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Cloud
            size={12}
            className="text-sky-400"
          />

          28°C - Phnom Penh
        </span>
      </div>
    </header>
  );
}
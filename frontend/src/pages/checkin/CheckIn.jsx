import { useState } from "react";
import {
  Search,
  Camera,
  KeyRound,
  CheckCircle2,
  X,
  Printer,
  FileSignature,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const STEPS = [
  { key: "search", label: "Search Reservation", icon: Search },
  { key: "verify", label: "Verify Guest", icon: Camera },
  { key: "assign", label: "Assign Room", icon: KeyRound },
  { key: "complete", label: "Complete", icon: CheckCircle2 },
];

// Mock data — replace with a real fetch (e.g. GET /api/reservations?status=upcoming)
const MOCK_RESERVATIONS = [
  {
    id: "HD-2025",
    guestName: "Maria Santos",
    initials: "MS",
    avatarColor: "bg-rose-500/30 text-rose-300",
    email: "maria.santos@email.com",
    phone: "+63 918 234 5678",
    room: "201",
    roomType: "Deluxe",
    floor: 2,
    checkIn: "2024-07-31",
    checkOut: "2024-08-02",
    duration: "2 nights",
    guests: "2 adults, 1 children",
    source: "Booking.com",
    total: "₱13,000",
    specialRequests: "Hypoallergenic pillows required",
    status: "CONFIRMED",
    paid: true,
  },
  {
    id: "HD-2026",
    guestName: "James Lim",
    initials: "JL",
    avatarColor: "bg-amber-500/30 text-amber-300",
    email: "james.lim@email.com",
    phone: "+63 917 111 2222",
    room: "203",
    roomType: "Standard",
    floor: 2,
    checkIn: "2024-08-01",
    checkOut: "2024-08-03",
    duration: "2 nights",
    guests: "1 adult",
    source: "Walk-in",
    total: "₱7,000",
    specialRequests: "",
    status: "PENDING",
    paid: false,
  },
  {
    id: "HD-2027",
    guestName: "Ana Villanueva",
    initials: "AV",
    avatarColor: "bg-sky-500/30 text-sky-300",
    email: "ana.villanueva@email.com",
    phone: "+63 917 333 4444",
    room: "501",
    roomType: "Suite",
    floor: 5,
    checkIn: "2024-08-01",
    checkOut: "2024-08-04",
    duration: "3 nights",
    guests: "2 adults",
    source: "Direct",
    total: "₱21,000",
    specialRequests: "Early check-in requested",
    status: "CONFIRMED",
    paid: true,
  },
  {
    id: "HD-2029",
    guestName: "Grace Tan",
    initials: "GT",
    avatarColor: "bg-violet-500/30 text-violet-300",
    email: "grace.tan@email.com",
    phone: "+63 917 555 6666",
    room: "402",
    roomType: "Deluxe",
    floor: 4,
    checkIn: "2024-08-02",
    checkOut: "2024-08-05",
    duration: "3 nights",
    guests: "2 adults, 2 children",
    source: "Agoda",
    total: "₱18,000",
    specialRequests: "",
    status: "CONFIRMED",
    paid: true,
  },
];

const statusStyles = {
  CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  PENDING: "bg-violet-500/15 text-violet-400",
};

function generateKeyCard() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const rand2 = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KCARD-${rand}-${rand2}`;
}

export default function CheckIn({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [idType, setIdType] = useState("Passport");
  const [idNumber, setIdNumber] = useState("");
  const [keyCard, setKeyCard] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filtered = MOCK_RESERVATIONS.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.guestName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.room.includes(q)
    );
  });

  function handleSelectReservation(reservation) {
    setSelectedReservation(reservation);
    setIdNumber("");
    setStepIndex(1);
  }

  function handleVerifyAndContinue(e) {
    e.preventDefault();
    // TODO: submit verification to backend (e.g. POST /api/checkins/{reservationId}/verify)
    setKeyCard(generateKeyCard());
    setStepIndex(2);
  }

  function handleCompleteCheckIn() {
    // TODO: submit final check-in to backend (e.g. POST /api/checkins/{reservationId}/complete)
    setStepIndex(3);
    setShowSuccessModal(true);
  }

  function handleCancel() {
    setSelectedReservation(null);
    setIdNumber("");
    setKeyCard("");
    setStepIndex(0);
  }

  function handleDone() {
    setShowSuccessModal(false);
    handleCancel();
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Check In"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
              Check In
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Process guest arrivals
            </p>
          </div>

          {/* Step indicator */}
          <div className="bg-base-850 border border-base-border rounded-2xl mt-6 p-6 sm:p-8">
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === stepIndex;
                const isDone = i < stepIndex;
                const isLast = i === STEPS.length - 1;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center ${isLast ? "" : "flex-1"}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isActive
                              ? "bg-amber-400 text-base-950"
                              : "bg-base-800 border border-base-border text-slate-500"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          isActive
                            ? "text-amber-400"
                            : isDone
                              ? "text-emerald-400"
                              : "text-slate-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={`h-px flex-1 mx-3 mb-6 transition-colors ${
                          isDone ? "bg-emerald-500" : "bg-base-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6">
            {/* Left — Search Reservation (always visible) */}
            <div className="bg-base-850 border border-base-border rounded-2xl p-5 h-fit">
              <h2 className="text-white font-serif font-bold text-lg mb-4">
                Search Reservation
              </h2>
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Guest name, booking ID, room number..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReservation(r)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedReservation?.id === r.id
                        ? "bg-base-800 border-amber-400/50"
                        : "bg-base-800/50 border-base-border hover:bg-base-800"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.avatarColor}`}
                    >
                      {r.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {r.guestName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {r.id} · Room {r.room}
                      </p>
                      <p className="text-xs text-slate-500">
                        Check-in: {r.checkIn}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${statusStyles[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-8">
                    No reservations found.
                  </p>
                )}
              </div>
            </div>

            {/* Right — changes per step */}
            <div className="space-y-6">
              {stepIndex === 0 && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-14 h-14 rounded-full bg-base-800 border border-base-border flex items-center justify-center mb-4">
                    <ArrowRight size={22} className="text-slate-500" />
                  </div>
                  <h3 className="text-white font-serif font-bold text-lg">
                    Select a reservation to begin check-in
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Search by guest name, booking ID, or room number
                  </p>
                </div>
              )}

              {selectedReservation && stepIndex >= 1 && stepIndex <= 2 && (
                <>
                  <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                    <h2 className="text-white font-serif font-bold text-lg mb-4">
                      Guest &amp; Reservation Details
                    </h2>

                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${selectedReservation.avatarColor}`}
                      >
                        {selectedReservation.initials}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {selectedReservation.guestName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {selectedReservation.email} ·{" "}
                          {selectedReservation.phone}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusStyles[selectedReservation.status]}`}
                          >
                            {selectedReservation.status}
                          </span>
                          {selectedReservation.paid && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                              PAID
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Booking ID</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.id}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Room</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.room} (
                          {selectedReservation.roomType})
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Check-in</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.checkIn}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Check-out</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.checkOut}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.duration}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Guests</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.guests}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Source</p>
                        <p className="text-white font-semibold mt-0.5">
                          {selectedReservation.source}
                        </p>
                      </div>
                      <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-amber-400 font-semibold mt-0.5">
                          {selectedReservation.total}
                        </p>
                      </div>
                    </div>

                    {selectedReservation.specialRequests && (
                      <div className="bg-amber-400/5 border border-amber-400/30 rounded-lg px-4 py-3 mt-3">
                        <p className="text-xs text-amber-400 font-semibold">
                          Special Requests
                        </p>
                        <p className="text-sm text-slate-300 mt-0.5">
                          {selectedReservation.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  {stepIndex === 1 && (
                    <form
                      onSubmit={handleVerifyAndContinue}
                      className="bg-base-850 border border-base-border rounded-2xl p-6"
                    >
                      <h2 className="text-white font-serif font-bold text-lg mb-4">
                        Guest Verification
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-1.5 block">
                            ID Type
                          </label>
                          <select
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                          >
                            <option>Passport</option>
                            <option>Driver's License</option>
                            <option>National ID</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-1.5 block">
                            ID Number
                          </label>
                          <input
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="ID number"
                            required
                            className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 bg-base-800 hover:bg-base-700 border border-base-border rounded-xl py-5 text-slate-300 text-sm font-medium transition-colors"
                        >
                          <Camera size={20} />
                          Take Photo
                        </button>
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 bg-base-800 hover:bg-base-700 border border-base-border rounded-xl py-5 text-slate-300 text-sm font-medium transition-colors"
                        >
                          <FileSignature size={20} />
                          Digital Signature
                        </button>
                        <button
                          type="button"
                          className="flex flex-col items-center justify-center gap-2 bg-base-800 hover:bg-base-700 border border-base-border rounded-xl py-5 text-slate-300 text-sm font-medium transition-colors"
                        >
                          <Printer size={20} />
                          Print Form
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold py-3 rounded-lg transition-colors"
                      >
                        Verify &amp; Continue
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  )}

                  {stepIndex === 2 && (
                    <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                      <h2 className="text-white font-serif font-bold text-lg mb-4">
                        Room Assignment &amp; Key Card
                      </h2>

                      <div className="flex items-center justify-between bg-base-800 border border-base-border rounded-xl px-5 py-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center">
                            <KeyRound size={18} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              Room {selectedReservation.room}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedReservation.roomType} · Floor{" "}
                              {selectedReservation.floor}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Key Card</p>
                          <p className="text-amber-400 font-bold">{keyCard}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleCompleteCheckIn}
                        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold py-3 rounded-lg transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Complete Check-in
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleCancel}
                    className="w-full bg-base-850 hover:bg-base-800 border border-base-border text-slate-400 font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Success modal */}
      {showSuccessModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-border">
              <h2 className="text-white font-serif font-bold text-lg">
                Check-in Successful
              </h2>
              <button
                onClick={handleDone}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 size={30} className="text-emerald-400" />
                </div>
              </div>
              <h3 className="text-white font-bold text-lg">
                Welcome, {selectedReservation.guestName}!
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Successfully checked into Room {selectedReservation.room}
              </p>

              <div className="bg-base-800 border border-base-border rounded-lg px-4 py-3 mt-5">
                <p className="text-xs text-slate-500">Key Card Number</p>
                <p className="text-amber-400 font-bold text-lg mt-0.5">
                  {keyCard}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleDone}
                  className="flex-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <Printer size={16} />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

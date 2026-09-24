import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LogOut as CheckOutIcon,
  Search,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import {
  getCheckedInGuests,
  getBillingSummary,
  completeCheckOut,
} from "../../api/checkoutApi";

function listFromReservations(response) {
  const page = response?.data;
  const list = Array.isArray(page)
    ? page
    : Array.isArray(page?.data)
      ? page.data
      : [];
  return list.map((r) => {
    const guest = r.guest || {};
    const rooms = r.reservation_rooms || r.reservationRooms || [];
    const rr = rooms[0] || {};
    const room = rr.room || {};
    const roomType = rr.roomType || rr.room_type || {};
    const name =
      [guest.first_name, guest.last_name].filter(Boolean).join(" ") ||
      guest.name ||
      r.guest_name ||
      "Guest";
    return {
      raw: r,
      id: r.id,
      reservationCode: r.reservation_code,
      guestName: name,
      initials: name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      room: room.room_number || "N/A",
      roomId: room.id || rr.room_id,
      roomType: roomType.name || "Standard",
      checkIn: r.check_in_date || "",
      checkOut: r.check_out_date || "",
      paid: r.payment_status === "paid",
      totalAmount: Number(r.total_amount || 0),
      paidAmount: Number(r.paid_amount || 0),
      invoice: r.invoice || null,
    };
  });
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function CheckOut({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [billing, setBilling] = useState(null);
  const [query, setQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(null);

  async function loadGuests() {
    setLoading(true);
    setError("");
    try {
      const response = await getCheckedInGuests();
      setGuests(listFromReservations(response));
    } catch (err) {
      setError(err.message || "Unable to load checked-in guests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  async function selectGuest(guest) {
    setSelectedGuest(guest);
    setBillingLoading(true);
    setError("");
    try {
      try {
        const response = await getBillingSummary(guest.id);
        if (response?.data) {
          const b = response.data.billing;
          setBilling({
            roomCharge: Number(b.room_charge || 0),
            subtotal: Number(b.subtotal || 0),
            discountPercent: Number(b.discount_percent || 0),
            discountAmount: Number(b.discount_amount || 0),
            vat: Number(b.vat_amount || 0),
            total: Number(b.total_due || 0),
            paidAmount: Number(b.paid_amount || 0),
            balanceDue: Number(b.balance_due || 0),
          });
          setDiscount(Number(b.discount_percent || 0));
          return;
        }
      } catch (_) {
        // The current backend has a method-name mismatch on the dedicated
        // billing route. Fall back to the working reservations payload.
      }

      const subtotal = Number(
        guest.invoice?.total_amount ?? guest.totalAmount ?? 0,
      );
      const paidAmount = Number(
        guest.invoice?.paid_amount ?? guest.paidAmount ?? 0,
      );
      const discountAmount = subtotal * (Number(discount) / 100);
      const taxable = Math.max(0, subtotal - discountAmount);
      const vat = taxable * 0.12;
      const total = taxable + vat;
      setBilling({
        roomCharge: subtotal,
        subtotal,
        discountPercent: Number(discount),
        discountAmount,
        vat,
        total,
        paidAmount,
        balanceDue: Math.max(0, total - paidAmount),
      });
    } finally {
      setBillingLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) =>
      [g.guestName, g.room, g.reservationCode].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [guests, query]);

  const calculated = useMemo(() => {
    if (!billing) return null;
    const discountAmount = billing.subtotal * (Number(discount || 0) / 100);
    const taxable = Math.max(0, billing.subtotal - discountAmount);
    const vat = taxable * 0.12;
    const total = taxable + vat;
    return {
      ...billing,
      discountAmount,
      vat,
      total,
      balanceDue: Math.max(0, total - billing.paidAmount),
    };
  }, [billing, discount]);

  async function handleCompleteCheckout() {
    if (!selectedGuest || !calculated) return;
    setLoading(true);
    setError("");
    try {
      await completeCheckOut(selectedGuest.id, {
        payment_method: paymentMethod,
        discount_percent: Number(discount || 0),
        total_due: calculated.total,
      });
      setCompleted({
        guestName: selectedGuest.guestName,
        room: selectedGuest.room,
        total: calculated.total,
      });
      setSelectedGuest(null);
      setBilling(null);
      await loadGuests();
    } catch (err) {
      setError(err.message || "Check-out failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Check Out"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Check Out
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Process checked-in guests and release rooms to housekeeping.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6">
            <div className="bg-base-850 border border-base-border rounded-2xl p-5 h-fit">
              <h2 className="text-white font-serif font-bold text-lg mb-4">
                Checked-in Guests
              </h2>
              <div className="relative mb-4">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Guest, room, reservation..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-white"
                />
              </div>
              {loading && guests.length === 0 && (
                <Loader2 className="animate-spin text-amber-400 mx-auto my-8" />
              )}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => selectGuest(guest)}
                    className={`w-full text-left p-3 rounded-xl border ${selectedGuest?.id === guest.id ? "border-amber-400 bg-base-800" : "border-base-border bg-base-800/50 hover:bg-base-800"}`}
                  >
                    <p className="text-white font-semibold text-sm">
                      {guest.guestName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {guest.reservationCode} · Room {guest.room}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {guest.checkIn} → {guest.checkOut}
                    </p>
                  </button>
                ))}
                {!loading && filtered.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-8">
                    No checked-in guests found.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {!selectedGuest && (
                <div className="bg-base-850 border border-base-border rounded-2xl p-10 min-h-[400px] flex items-center justify-center text-slate-500">
                  Select a checked-in guest to continue.
                </div>
              )}
              {selectedGuest && (
                <>
                  <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                    <h2 className="text-white font-serif font-bold text-lg mb-4">
                      Guest
                    </h2>
                    <p className="text-white font-semibold">
                      {selectedGuest.guestName}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Room {selectedGuest.room} · {selectedGuest.roomType}
                    </p>
                  </div>
                  <div className="bg-base-850 border border-base-border rounded-2xl p-6">
                    <h2 className="text-white font-serif font-bold text-lg mb-4">
                      Billing Summary
                    </h2>
                    {billingLoading ? (
                      <Loader2 className="animate-spin text-amber-400" />
                    ) : (
                      calculated && (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="text-white">
                              {money(calculated.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Discount (%)</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={discount}
                              onChange={(e) =>
                                setDiscount(
                                  Math.min(
                                    100,
                                    Math.max(0, Number(e.target.value)),
                                  ),
                                )
                              }
                              className="w-20 bg-base-800 border border-base-border rounded px-2 py-1 text-right text-white"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              Discount amount
                            </span>
                            <span className="text-rose-400">
                              -{money(calculated.discountAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">VAT (12%)</span>
                            <span className="text-white">
                              {money(calculated.vat)}
                            </span>
                          </div>
                          <div className="border-t border-base-border pt-3 flex justify-between font-bold">
                            <span className="text-white">Total Due</span>
                            <span className="text-amber-400 text-xl">
                              {money(calculated.total)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Current paid</span>
                            <span className="text-emerald-400">
                              {money(calculated.paidAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Balance</span>
                            <span className="text-white">
                              {money(calculated.balanceDue)}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-3">
                            {["cash", "bakong_khqr"].map((method) => (
                              <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`px-3 py-2 rounded-lg border text-xs ${
                                  paymentMethod === method
                                    ? "border-amber-400 text-amber-400"
                                    : "border-base-border text-slate-300"
                                }`}
                              >
                                {method === "bakong_khqr"
                                  ? "Bakong KHQR"
                                  : "Cash"}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={handleCompleteCheckout}
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-base-950 font-semibold py-3 rounded-lg"
                          >
                            <CheckOutIcon size={16} />
                            {loading ? "Completing..." : "Complete Check-out"}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {completed && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-base-900 border border-base-border rounded-2xl p-7 text-center max-w-sm w-full">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
            <h2 className="text-white font-bold text-xl mt-4">
              Check-out Complete
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {completed.guestName} checked out from Room {completed.room}.
            </p>
            <p className="text-amber-400 font-semibold mt-4">
              Total: {money(completed.total)}
            </p>
            <button
              onClick={() => setCompleted(null)}
              className="w-full mt-6 bg-amber-400 text-base-950 font-semibold py-2.5 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

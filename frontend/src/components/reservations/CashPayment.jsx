import { useMemo, useState } from "react";
import { apiFetch } from "../../api/client";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const ceilTo = (n, step) => Math.ceil(n / step) * step;

const fmtUsd = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtKhr = (n) => `${Math.round(Number(n || 0)).toLocaleString("en-US")} ៛`;

export default function CashPayment({
  apiBaseUrl, // pass API_BASE_URL from PaymentStep
  amountToPay, // number, in USD
  reservationId,
  invoiceId,
  exchangeRate = 4000, // keep in sync with config('app.khr_exchange_rate')
  isFullPayment = true,
  onBack,
  onSuccess, // (apiResponse) => void
}) {
  const [currency, setCurrency] = useState("USD");
  const [received, setReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const receivedNum = Number(received) || 0;

  // Same maths as the backend (processCashPayment)
  const receivedInUsd =
    currency === "KHR" ? receivedNum / exchangeRate : receivedNum;

  const isEnough =
    receivedNum > 0 && round2(receivedInUsd) >= round2(amountToPay);

  const changeUsd = isEnough ? receivedInUsd - amountToPay : 0;
  const changeKhr = Math.round((changeUsd * exchangeRate) / 100) * 100;

  const dueInKhr = Math.ceil((amountToPay * exchangeRate) / 100) * 100;

  const exactValue = currency === "USD" ? round2(amountToPay) : dueInKhr;
  const fmt = currency === "USD" ? fmtUsd : fmtKhr;

  const quickAmounts = useMemo(() => {
    const steps =
      currency === "USD" ? [1, 5, 10, 50] : [1000, 5000, 10000, 50000];
    const base = currency === "USD" ? round2(amountToPay) : dueInKhr;

    const list = [];
    steps.forEach((step) => {
      let value = ceilTo(base, step);
      if (value <= base) value += step;
      if (!list.includes(value)) list.push(value);
    });

    return list.sort((a, b) => a - b).slice(0, 4);
  }, [currency, amountToPay, dueInKhr]);

  const switchCurrency = (next) => {
    setCurrency(next);
    setReceived("");
    setError("");
  };

  const handleSubmit = async () => {
    console.log("cash submit", {
      reservationId,
      invoiceId,
      amountToPay,
      receivedNum,
      apiBaseUrl,
    });
    if (!reservationId) {
      setError(
        "Reservation ID is missing. Please create the reservation first.",
      );
      return;
    }

    if (!invoiceId) {
      setError("Invoice ID is missing. Please create the invoice first.");
      return;
    }

    if (amountToPay <= 0) {
      setError("The payment amount must be greater than zero.");
      return;
    }

    if (!isEnough) {
      setError(`Amount received must be at least ${fmtUsd(amountToPay)}.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/paymentCash", {
        method: "POST",
        body: JSON.stringify({
          reservation_id: reservationId,
          invoice_id: invoiceId,
          amount_due: round2(amountToPay),
          cash_received: receivedNum,
          currency,
          exchange: exchangeRate,
        }),
      });

      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "Cash payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-base-border bg-base-800 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Cash payment</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Enter the amount the customer hands over.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency switch (backend accepts USD | KHR) */}
          <div className="flex rounded-full border border-base-border p-0.5 text-[11px] font-medium">
            {["USD", "KHR"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => switchCurrency(c)}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  currency === c
                    ? "bg-amber-400 text-base-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <span className="rounded-full border border-base-border px-3 py-1 text-[11px] font-medium text-slate-300">
            {isFullPayment ? "Full payment" : "Partial payment"}
          </span>
        </div>
      </div>

      {/* Three cards */}
      <div className="grid grid-cols-1 gap-3 px-5 md:grid-cols-3">
        {/* Amount due */}
        <div className="rounded-xl border border-base-border bg-base-900/60 p-4">
          <p className="text-xs text-slate-400">Amount due</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">
            {fmtUsd(amountToPay)}
          </p>
          {currency === "KHR" && (
            <p className="mt-2 text-xs text-slate-500">
              ≈ {fmtKhr(dueInKhr)} (1 USD = {exchangeRate.toLocaleString()} ៛)
            </p>
          )}
        </div>

        {/* Amount received */}
        <div
          className={`rounded-xl border bg-base-900/60 p-4 transition-colors ${
            error ? "border-rose-500/60" : "border-amber-400/70"
          }`}
        >
          <p className="text-xs text-slate-400">Amount received</p>

          <div className="mt-2 flex items-center gap-1 text-3xl font-bold">
            <span className="text-slate-500">
              {currency === "USD" ? "$" : "៛"}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step={currency === "USD" ? "0.01" : "100"}
              value={received}
              onChange={(e) => {
                setReceived(e.target.value);
                setError("");
              }}
              placeholder={currency === "USD" ? "0.00" : "0"}
              className="w-full bg-transparent text-white placeholder-slate-600 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Type it in or tap a quick amount.
          </p>
        </div>

        {/* Change */}
        <div className="rounded-xl border border-base-border bg-base-900/60 p-4">
          <p className="text-xs text-slate-400">Change</p>

          {isEnough ? (
            <>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {fmtUsd(changeUsd)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                ≈ {fmtKhr(changeKhr)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-slate-500">—</p>
              <p className="mt-2 text-xs text-slate-500">
                Needs at least {fmtUsd(amountToPay)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick amounts */}
      <div className="px-5 pb-5 pt-4">
        <p className="mb-2 text-xs text-slate-400">Quick amounts</p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReceived(String(exactValue))}
            className="rounded-lg border border-dashed border-base-border px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-amber-400"
          >
            Exact {fmt(exactValue)}
          </button>

          {quickAmounts.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setReceived(String(value))}
              className={`rounded-lg border px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:border-amber-400 ${
                receivedNum === value
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-base-border bg-base-900/60"
              }`}
            >
              {fmt(value)}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-base-border px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-lg border border-base-border px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isEnough || loading}
          className="rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-base-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-amber-400/40 disabled:text-base-950/60"
        >
          {loading ? "Processing…" : "Add reservation"}
        </button>
      </div>
    </div>
  );
}

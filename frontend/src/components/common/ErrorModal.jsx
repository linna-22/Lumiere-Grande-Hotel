import { AlertCircle, X } from "lucide-react";

export default function ErrorModal({
  title = "Something went wrong",
  message,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div
        className="relative w-full max-w-md rounded-2xl border border-base-border bg-base-900 p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-base-800 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
          <AlertCircle className="h-6 w-6 text-rose-400" />
        </div>

        <h2
          id="error-modal-title"
          className="mt-4 font-serif text-xl font-bold text-white"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          OK
        </button>
      </div>
    </div>
  );
}

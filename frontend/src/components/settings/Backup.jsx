import { useState } from "react";

import {
  DatabaseBackup,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
} from "lucide-react";

import { apiFetch } from "../../api/client";

// ============================================================
// BACKUP
// ============================================================

export default function Backup() {
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: null,
    title: "",
    message: "",
  });

  // ==========================================================
  // CREATE BACKUP
  // ==========================================================

  const handleBackup = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch(
        "/admin/backup-now",
        {
          method: "POST",
        }
      );

      if (data.status !== "success") {
        throw new Error(
          data.message ||
            "Backup process failed."
        );
      }

      setModal({
        open: true,
        type: "success",
        title: "Backup Completed",
        message:
          data.message ||
          "Database backup successfully created and uploaded to Telegram.",
      });
    } catch (err) {
      console.error(
        "Backup error:",
        err
      );

      setModal({
        open: true,
        type: "error",
        title: "Backup Failed",
        message:
          err.message ||
          "Unable to create database backup.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      title: "",
      message: "",
    });
  };

  return (
    <>
      <div className="space-y-6">

        {/* =====================================================
            BACKUP CARD
        ====================================================== */}

        <div className="bg-base-850 border border-base-border rounded-xl overflow-hidden">

          {/* Header */}

          <div className="p-5 sm:p-6 border-b border-base-border">
            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
                <DatabaseBackup
                  size={22}
                  className="text-amber-400"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Database Backup
                </h2>

                <p className="text-sm text-slate-400 mt-1 leading-6">
                  Create and upload a full backup
                  of the hotel database to the
                  configured Telegram destination.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">

            {/* =================================================
                INFORMATION CARDS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <InfoCard
                icon={DatabaseBackup}
                label="Backup Type"
                value="Full Database Backup"
              />

              <InfoCard
                icon={Send}
                label="Destination"
                value="Telegram"
              />

              <InfoCard
                icon={ShieldCheck}
                label="Backup Status"
                value="Ready"
                valueClass="text-emerald-400"
              />

              <InfoCard
                icon={DatabaseBackup}
                label="Last Backup"
                value="Not available"
              />
            </div>

            {/* =================================================
                BACKUP BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handleBackup}
              disabled={loading}
              className="
                w-full
                mt-6
                flex items-center justify-center gap-2
                px-5 py-3.5
                rounded-lg
                bg-amber-400
                hover:bg-amber-500
                text-base-950
                text-sm
                font-semibold
                transition-colors
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating Backup...
                </>
              ) : (
                <>
                  <DatabaseBackup size={18} />
                  Create Backup Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            HOW BACKUP WORKS
        ====================================================== */}

        <div className="bg-base-850 border border-base-border rounded-xl p-5">
          <div className="flex items-start gap-3">

            <ShieldCheck
              size={19}
              className="text-slate-400 shrink-0 mt-0.5"
            />

            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                How backup works
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-6">
                When you create a backup, the system
                generates a full database backup and
                uploads it to the configured Telegram
                destination. Larger databases may take
                a few moments to complete.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          BACKUP RESULT MODAL
      ======================================================= */}

      <BackupResultModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </>
  );
}

// ============================================================
// BACKUP RESULT MODAL
// ============================================================

function BackupResultModal({
  open,
  type,
  title,
  message,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        p-4
      "
    >
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="
          absolute inset-0
          bg-black/70
          backdrop-blur-sm
          cursor-default
        "
      />

      {/* =====================================================
          MODAL
      ====================================================== */}

      <div
        className="
          relative
          w-full
          max-w-md
          bg-base-850
          border border-base-border
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-result-title"
      >
        {/* Top Accent */}

        <div
          className={`h-1 ${
            isSuccess
              ? "bg-emerald-400"
              : "bg-rose-400"
          }`}
        />

        <div className="p-6 sm:p-7">

          {/* Icon */}

          <div className="flex justify-center">
            <div
              className={`
                w-16 h-16
                rounded-full
                flex items-center justify-center
                ${
                  isSuccess
                    ? "bg-emerald-400/10"
                    : "bg-rose-400/10"
                }
              `}
            >
              {isSuccess ? (
                <CheckCircle2
                  size={34}
                  className="text-emerald-400"
                />
              ) : (
                <AlertCircle
                  size={34}
                  className="text-rose-400"
                />
              )}
            </div>
          </div>

          {/* Title */}

          <div className="text-center mt-5">
            <h2
              id="backup-result-title"
              className="text-xl font-semibold text-white"
            >
              {title}
            </h2>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              {message}
            </p>
          </div>

          {/* Success Details */}

          {isSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <Send
                    size={17}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Telegram
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Backup uploaded successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}

          <button
            type="button"
            onClick={onClose}
            className={`
              w-full
              mt-6
              px-4 py-2.5
              rounded-lg
              text-sm
              font-semibold
              transition-colors
              ${
                isSuccess
                  ? `
                    bg-emerald-400
                    hover:bg-emerald-500
                    text-base-950
                  `
                  : `
                    bg-rose-400
                    hover:bg-rose-500
                    text-base-950
                  `
              }
            `}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon: Icon,
  label,
  value,
  valueClass = "text-white",
}) {
  return (
    <div className="bg-base-800/60 border border-base-border rounded-xl p-4">
      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-lg bg-base-800 flex items-center justify-center shrink-0">
          <Icon
            size={18}
            className="text-slate-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p
            className={`text-sm font-medium mt-1 truncate ${valueClass}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
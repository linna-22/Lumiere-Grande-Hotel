import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  DatabaseBackup,
  Save,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Percent,
  Image as ImageIcon,
  ShieldCheck,
  Send,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { apiFetch } from "../api/client";

// ============================================================
// TABS
// ============================================================

const tabs = [
  {
    id: "hotel-info",
    label: "Hotel Info",
    icon: Building2,
  },
  {
    id: "backup",
    label: "Backup",
    icon: DatabaseBackup,
  },
];

// ============================================================
// MAIN SETTINGS PAGE
// ============================================================

export default function Settings({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hotel-info");

  return (
    <div className="flex bg-base-850 min-h-screen">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Settings"
        onNavigate={onNavigate}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">
        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
                <SettingsIcon
                  size={21}
                  className="text-amber-400"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                  Settings
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  Configure your hotel system preferences
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              TABS
          ================================================== */}

          <div className="bg-base-850 border border-base-border rounded-xl p-1.5 mb-6">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2
                      px-5 py-2.5
                      rounded-lg
                      text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-amber-400 text-base-950"
                          : "text-slate-400 hover:bg-base-800 hover:text-slate-200"
                      }
                    `}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              TAB CONTENT
          ================================================== */}

          {activeTab === "hotel-info" && <HotelInfoTab />}

          {activeTab === "backup" && <BackupTab />}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// HOTEL INFO TAB
// ============================================================

function HotelInfoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [logoPreview, setLogoPreview] = useState("");

  const [form, setForm] = useState({
    hotel_name: "",
    address: "",
    phone: "",
    email: "",
    tax_rate: "",
  });

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/admin/settings");

      const settings = data.settings || data.data || data;

      setForm({
        hotel_name:
          settings.hotel_name ||
          settings.name ||
          "",

        address:
          settings.address ||
          "",

        phone:
          settings.phone ||
          settings.contact_phone ||
          "",

        email:
          settings.email ||
          settings.contact_email ||
          "",

        tax_rate:
          settings.tax_rate ??
          settings.tax ??
          "",
      });

      setLogoPreview(
        settings.logo_url ||
        settings.logo ||
        ""
      );
    } catch (err) {
      console.error(
        "Load settings error:",
        err
      );

      setError(
        err.message ||
          "Unable to load hotel settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const data = await apiFetch(
        "/admin/settings",
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );

      setSuccess(
        data.message ||
          "Hotel information updated successfully."
      );
    } catch (err) {
      console.error(
        "Save settings error:",
        err
      );

      setError(
        err.message ||
          "Unable to save hotel settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOGO UPLOAD
  // ==========================================================

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // --------------------------------------------------------
    // Show preview immediately
    // --------------------------------------------------------

    const preview = URL.createObjectURL(file);

    setLogoPreview(preview);

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("logo", file);

      const data = await apiFetch(
        "/admin/settings/logo",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadedLogo =
        data.logo_url ||
        data.logo ||
        data.data?.logo_url ||
        data.data?.logo;

      if (uploadedLogo) {
        setLogoPreview(uploadedLogo);
      }

      setSuccess(
        data.message ||
          "Hotel logo uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Logo upload error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload hotel logo."
      );
    } finally {
      setUploading(false);

      // Reset file input
      event.target.value = "";
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="bg-base-850 border border-base-border rounded-xl min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2
            size={22}
            className="animate-spin text-amber-400"
          />

          <p className="text-sm">
            Loading hotel settings...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // HOTEL INFO CONTENT
  // ==========================================================

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6"
    >
      {/* =====================================================
          HOTEL INFORMATION CARD
      ====================================================== */}

      <div className="bg-base-850 border border-base-border rounded-xl overflow-hidden">
        {/* Header */}

        <div className="p-5 sm:p-6 border-b border-base-border">
          <h2 className="text-lg font-semibold text-white">
            Hotel Information
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Manage your hotel's basic information
            and branding.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {/* =================================================
              LOGO
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 mb-6 border-b border-base-border">
            {/* Logo Preview */}

            <div className="w-24 h-24 rounded-xl bg-base-800 border border-base-border overflow-hidden flex items-center justify-center shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Hotel logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  size={30}
                  className="text-slate-600"
                />
              )}
            </div>

            {/* Logo Details */}

            <div>
              <h3 className="text-sm font-semibold text-white">
                Hotel Logo
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Upload your hotel logo for use
                throughout the system.
              </p>

              <label
                className="
                  inline-flex items-center gap-2
                  mt-3
                  px-3.5 py-2
                  rounded-lg
                  bg-base-800
                  border border-base-border
                  hover:bg-base-700
                  text-slate-200
                  text-sm font-medium
                  cursor-pointer
                  transition-colors
                "
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={15} />

                    Upload Logo
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>

              <p className="text-xs text-slate-600 mt-2">
                PNG, JPG or WEBP
              </p>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hotel Name */}

            <FormField
              label="Hotel Name"
              icon={Building2}
              required
            >
              <input
                type="text"
                name="hotel_name"
                value={form.hotel_name}
                onChange={handleChange}
                placeholder="Lumiere Grand Hotel"
                className={inputClass}
                required
              />
            </FormField>

            {/* Phone */}

            <FormField
              label="Phone Number"
              icon={Phone}
            >
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+855 12 345 678"
                className={inputClass}
              />
            </FormField>

            {/* Email */}

            <FormField
              label="Email Address"
              icon={Mail}
            >
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contact@hotel.com"
                className={inputClass}
              />
            </FormField>

            {/* Tax */}

            <FormField
              label="Tax Rate"
              icon={Percent}
            >
              <div className="relative">
                <input
                  type="number"
                  name="tax_rate"
                  value={form.tax_rate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="10"
                  className={`${inputClass} pr-10`}
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  %
                </span>
              </div>
            </FormField>

            {/* Address */}

            <div className="md:col-span-2">
              <FormField
                label="Hotel Address"
                icon={MapPin}
              >
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter hotel address"
                  className={`${inputClass} resize-none`}
                />
              </FormField>
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================== */}

          <StatusMessage
            success={success}
            error={error}
          />

          {/* =================================================
              SAVE BUTTON
          ================================================== */}

          <div className="flex justify-end mt-6 pt-5 border-t border-base-border">
            <button
              type="submit"
              disabled={saving || uploading}
              className="
                flex items-center justify-center gap-2
                min-w-[145px]
                px-4 py-2.5
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
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          GLOBAL SETTINGS INFORMATION
      ====================================================== */}

      <div className="bg-base-850 border border-base-border rounded-xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={19}
            className="text-amber-400 shrink-0 mt-0.5"
          />

          <div>
            <h3 className="text-sm font-semibold text-white">
              Global Hotel Information
            </h3>

            <p className="text-sm text-slate-500 mt-1 leading-6">
              This information can be used across
              the public booking site, navigation,
              guest receipts, invoices and other
              hotel-facing pages.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// BACKUP TAB
// ============================================================

function BackupTab() {
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
      const data = await apiFetch("/admin/backup-now", {
        method: "POST",
      });

      if (data.status !== "success") {
        throw new Error(
          data.message || "Backup process failed."
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
      console.error("Backup error:", err);

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
                  Create and upload a full backup of
                  the hotel database to the configured
                  Telegram destination.
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
        onClose={() =>
          setModal({
            open: false,
            type: null,
            title: "",
            message: "",
          })
        }
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
        {/* =================================================
            TOP ACCENT
        ================================================== */}

        <div
          className={`h-1 ${
            isSuccess
              ? "bg-emerald-400"
              : "bg-rose-400"
          }`}
        />

        <div className="p-6 sm:p-7">
          {/* =================================================
              ICON
          ================================================== */}

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

          {/* =================================================
              TITLE
          ================================================== */}

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

          {/* =================================================
              SUCCESS DETAILS
          ================================================== */}

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

          {/* =================================================
              CLOSE BUTTON
          ================================================== */}

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
// FORM FIELD
// ============================================================

function FormField({
  label,
  icon: Icon,
  children,
  required = false,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
        {Icon && (
          <Icon
            size={15}
            className="text-slate-500"
          />
        )}

        <span>{label}</span>

        {required && (
          <span className="text-rose-400">
            *
          </span>
        )}
      </label>

      {children}
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

// ============================================================
// STATUS MESSAGE
// ============================================================

function StatusMessage({
  success,
  error,
}) {
  if (success) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <CheckCircle2
          size={18}
          className="text-emerald-400 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-400">
            Success
          </p>

          <p className="text-sm text-emerald-300/80 mt-1">
            {success}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
        <AlertCircle
          size={18}
          className="text-rose-400 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-sm font-semibold text-rose-400">
            Something went wrong
          </p>

          <p className="text-sm text-rose-300/80 mt-1">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// INPUT STYLE
// ============================================================

const inputClass = `
  w-full
  bg-base-800
  border border-base-border
  rounded-lg
  px-3.5 py-2.5
  text-sm
  text-slate-200
  placeholder:text-slate-600
  focus:outline-none
  focus:ring-1
  focus:ring-amber-400/50
  focus:border-amber-400/50
  transition-colors
`;
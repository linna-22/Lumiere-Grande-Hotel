import { useEffect, useState } from "react";
import {
  Building2,
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
} from "lucide-react";

import { apiFetch } from "../../api/client";
import { useHotelSettings } from "../../context/HotelSettingsContext";

// ============================================================
// HOTEL INFO
// ============================================================

export default function HotelInfo() {
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
  // GLOBAL HOTEL SETTINGS
  // ==========================================================

  const { updateHotelSettings } = useHotelSettings();

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
      const response = await apiFetch("/admin/settings");

      const settings = response.data || {};

      const general = settings.general || {};
      const branding = settings.branding || {};

      setForm({
        hotel_name: general.hotel_name || "",
        address: general.hotel_address || "",
        phone: general.hotel_phone || "",
        email: general.hotel_email || "",
        tax_rate: general.tax_rate ?? "",
      });

      setLogoPreview(branding.hotel_logo_url || "");
    } catch (err) {
      console.error("Load settings error:", err);

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
      const response = await apiFetch(
        "/admin/settings",
        {
          method: "POST",

          body: JSON.stringify({
            settings: [
              {
                key: "hotel_name",
                value: form.hotel_name,
                group: "general",
              },
              {
                key: "hotel_address",
                value: form.address,
                group: "general",
              },
              {
                key: "hotel_phone",
                value: form.phone,
                group: "general",
              },
              {
                key: "hotel_email",
                value: form.email,
                group: "general",
              },
              {
                key: "tax_rate",
                value: form.tax_rate,
                group: "general",
              },
            ],
          }),
        }
      );

      // ======================================================
      // UPDATE GLOBAL HOTEL SETTINGS
      // ======================================================
      // This makes Dashboard / Sidebar / TopBar / other
      // components update immediately without refreshing.

      updateHotelSettings({
        hotel_name: form.hotel_name,
        hotel_address: form.address,
        hotel_phone: form.phone,
        hotel_email: form.email,
        tax_rate: form.tax_rate,
      });

      setSuccess(
        response.message ||
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

    // Local preview while uploading
    const preview = URL.createObjectURL(file);

    setLogoPreview(preview);

    setUploading(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("logo", file);

      const response = await apiFetch(
        "/admin/settings/logo",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadedLogo =
        response.logo_url ||
        response.logo ||
        response.data?.logo_url ||
        response.data?.logo;

      if (uploadedLogo) {
        // Update preview with the real Cloudinary URL
        setLogoPreview(uploadedLogo);

        // ====================================================
        // UPDATE GLOBAL HOTEL LOGO
        // ====================================================

        updateHotelSettings({
          hotel_logo_url: uploadedLogo,
        });
      }

      setSuccess(
        response.message ||
          "Hotel logo uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Logo upload error:",
        err
      );

      // If upload failed, reload the original logo
      await fetchSettings();

      setError(
        err.message ||
          "Unable to upload hotel logo."
      );
    } finally {
      setUploading(false);

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
  // CONTENT
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
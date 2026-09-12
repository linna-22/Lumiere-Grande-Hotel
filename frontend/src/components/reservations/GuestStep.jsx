import { useEffect, useState } from "react";
import { UserRound, UserPlus, Search, Check, Loader2 } from "lucide-react";

import { listGuests } from "../../api/admin";

export default function GuestStep({ guestData, onChange, onNext }) {
  const [guestType, setGuestType] = useState(
    guestData.guest_id ? "existing" : "new",
  );

  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (guestType !== "existing") return;

    let cancelled = false;

    const loadGuests = async () => {
      setLoadingGuests(true);

      try {
        const response = await listGuests({
          search: search.trim(),
          page: 1,
        });

        if (!cancelled) {
          setGuests(response.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load guests:", error);

        if (!cancelled) {
          setGuests([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingGuests(false);
        }
      }
    };

    const timer = setTimeout(loadGuests, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [guestType, search]);

  const selectGuest = (guest) => {
    onChange({
      guest_id: guest.id,
      guest_details: null,
      selectedGuest: guest,
    });
  };

  const updateGuestDetails = (field, value) => {
    onChange({
      guest_id: null,
      selectedGuest: null,
      guest_details: {
        ...(guestData.guest_details ?? {}),
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (guestType === "existing") {
      if (!guestData.guest_id) return;
    } else {
      const details = guestData.guest_details ?? {};

      if (
        !details.first_name?.trim() ||
        !details.last_name?.trim() ||
        !details.phone?.trim()
      ) {
        return;
      }
    }

    onNext();
  };

  const inputClass = `
    w-full
    bg-base-800
    border border-base-border
    rounded-lg
    px-3.5 py-2.5
    text-sm text-white
    placeholder:text-slate-600
    focus:outline-none
    focus:border-amber-400
    transition-colors
  `;

  const details = guestData.guest_details ?? {};

  return (
    <div className="space-y-6">
      {/* Guest Type */}
      <div>
        <h2 className="text-lg font-semibold text-white">Guest Information</h2>

        <p className="text-sm text-slate-400 mt-1">
          Select an existing guest or create a new guest for this reservation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Existing */}
        <button
          type="button"
          onClick={() => {
            setGuestType("existing");

            onChange({
              guest_id: null,
              selectedGuest: null,
              guest_details: null,
            });
          }}
          className={`text-left rounded-xl border p-5 transition-colors ${
            guestType === "existing"
              ? "border-amber-400 bg-amber-400/10"
              : "border-base-border bg-base-800 hover:border-slate-600"
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                guestType === "existing"
                  ? "bg-amber-400 text-base-950"
                  : "bg-base-700 text-slate-400"
              }`}
            >
              <UserRound size={19} />
            </div>

            {guestType === "existing" && (
              <Check size={19} className="text-amber-400" />
            )}
          </div>

          <h3 className="text-white font-semibold mt-4">Existing Guest</h3>

          <p className="text-xs text-slate-400 mt-1">
            Select a guest already registered in the hotel system.
          </p>
        </button>

        {/* New */}
        <button
          type="button"
          onClick={() => {
            setGuestType("new");

            onChange({
              guest_id: null,
              selectedGuest: null,
              guest_details: details,
            });
          }}
          className={`text-left rounded-xl border p-5 transition-colors ${
            guestType === "new"
              ? "border-amber-400 bg-amber-400/10"
              : "border-base-border bg-base-800 hover:border-slate-600"
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                guestType === "new"
                  ? "bg-amber-400 text-base-950"
                  : "bg-base-700 text-slate-400"
              }`}
            >
              <UserPlus size={19} />
            </div>

            {guestType === "new" && (
              <Check size={19} className="text-amber-400" />
            )}
          </div>

          <h3 className="text-white font-semibold mt-4">New / Walk-in Guest</h3>

          <p className="text-xs text-slate-400 mt-1">
            Enter guest information manually.
          </p>
        </button>
      </div>

      {/* Existing Guest */}
      {guestType === "existing" && (
        <div className="bg-base-800/60 border border-base-border rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Search Guest
          </label>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {loadingGuests ? (
              <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading guests...
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                No guests found.
              </div>
            ) : (
              guests.map((guest) => {
                const selected = guestData.guest_id === guest.id;

                return (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => selectGuest(guest)}
                    className={`w-full flex items-center justify-between gap-4 p-4 rounded-lg border text-left transition-colors ${
                      selected
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-base-border bg-base-900 hover:border-slate-600"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {`${guest.first_name ?? ""} ${guest.last_name ?? ""}`.trim() ||
                          "Unnamed Guest"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {guest.email ?? guest.phone ?? "No contact information"}
                      </p>
                    </div>

                    {selected && (
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-base-950 flex items-center justify-center shrink-0">
                        <Check size={15} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* New Guest */}
      {guestType === "new" && (
        <div className="bg-base-800/60 border border-base-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name <span className="text-rose-400">*</span>
              </label>

              <input
                value={details.first_name ?? ""}
                onChange={(e) =>
                  updateGuestDetails("first_name", e.target.value)
                }
                placeholder="First name"
                className={inputClass}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name <span className="text-rose-400">*</span>
              </label>

              <input
                value={details.last_name ?? ""}
                onChange={(e) =>
                  updateGuestDetails("last_name", e.target.value)
                }
                placeholder="Last name"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={details.email ?? ""}
                onChange={(e) => updateGuestDetails("email", e.target.value)}
                placeholder="guest@example.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone <span className="text-rose-400">*</span>
              </label>

              <input
                value={details.phone ?? ""}
                onChange={(e) => updateGuestDetails("phone", e.target.value)}
                placeholder="+855 ..."
                className={inputClass}
              />
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID Type
              </label>

              <select
                value={details.id_type ?? ""}
                onChange={(e) => updateGuestDetails("id_type", e.target.value)}
                className={inputClass}
              >
                <option value="">Select ID type</option>
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID Number
              </label>

              <input
                value={details.id_number ?? ""}
                onChange={(e) =>
                  updateGuestDetails("id_number", e.target.value)
                }
                placeholder="Identification number"
                className={inputClass}
              />
            </div>

            {/* Nationality */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nationality
              </label>

              <input
                value={details.nationality ?? ""}
                onChange={(e) =>
                  updateGuestDetails("nationality", e.target.value)
                }
                placeholder="Nationality"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

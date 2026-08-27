import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../api/client";
import { useRoomTypes } from "../../hooks/useRoomTypes";

const STATUS_OPTIONS = [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "maintenance",
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const emptyForm = {
  room_number: "",
  floor: "",
  room_type_id: "",
  status: "available",
  description: "",
  image_url: "",
};

export default function RoomFormModal({ room, onClose, onSuccess }) {
  const { roomTypes, loading: loadingTypes } = useRoomTypes();
  const isEditMode = Boolean(room);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setForm({
        room_number: room.number ?? room.room_number ?? "",
        floor: room.floor ?? "",
        room_type_id: room.room_type_id ?? room.roomType?.id ?? "",
        status: (room.status || "available").toLowerCase(),
        description: room.description ?? "",
        image_url: room.image_url ?? room.image ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [room]);

  const selectedType = roomTypes.find(
    (t) => String(t.id) === String(form.room_type_id),
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      room_number: form.room_number,
      floor: form.floor ? Number(form.floor) : null,
      room_type_id: form.room_type_id,
      status: form.status,
      description: form.description,
      image_url: form.image_url,
    };

    try {
      if (isEditMode) {
        await apiFetch(`/rooms/${room.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/rooms", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSuccess?.(isEditMode ? "update" : "create");
      onClose();
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors({ general: [err.message] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-base-900 border border-base-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
          <h2 className="text-white font-serif text-xl font-bold">
            {isEditMode ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {errors.general && (
            <p className="text-rose-400 text-sm">{errors.general[0]}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Room Number <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                placeholder="e.g. 101"
                required
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              {errors.room_number && (
                <p className="text-rose-400 text-xs mt-1">
                  {errors.room_number[0]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Floor
              </label>
              <input
                type="number"
                name="floor"
                value={form.floor}
                onChange={handleChange}
                placeholder="1"
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Room Type
              </label>
              <select
                name="room_type_id"
                value={form.room_type_id}
                onChange={handleChange}
                required
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="" disabled>
                  {loadingTypes ? "Loading..." : "Select a room type"}
                </option>
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.room_type_id && (
                <p className="text-rose-400 text-xs mt-1">
                  {errors.room_type_id[0]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {capitalize(s)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Capacity (guests)
              </label>
              <input
                type="text"
                readOnly
                value={selectedType?.capacity ?? "-"}
                className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Set on the Room Type, not editable here.
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">
                Price per Night ($)
              </label>
              <input
                type="text"
                readOnly
                value={selectedType?.base_price ?? "-"}
                className="w-full bg-base-800 border border-base-border rounded-lg px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Set on the Room Type, not editable here.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Room description..."
              rows={3}
              className="w-full bg-base-850 border border-base-border rounded-lg px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-base-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                  ? "Update Room"
                  : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

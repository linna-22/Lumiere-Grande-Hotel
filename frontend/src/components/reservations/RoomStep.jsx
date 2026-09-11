import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  Loader2,
  AlertCircle,
  Users,
  Layers3,
} from "lucide-react";
import { listRooms } from "../../api/admin";
import Pagination from "../rooms/Pagination";

export default function RoomStep({
  form,
  onChange,
  onBack,
  onContinue,
  submitting = false,
}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const perPage = 8;

  useEffect(() => {
    loadRooms(currentPage);
  }, [currentPage]);

  const loadRooms = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await listRooms({
        status: "available",
        per_page: perPage,
        page,
      });

      const data = Array.isArray(response) ? response : response?.data || [];

      setRooms(data);

      setMeta(response?.meta || null);
    } catch (err) {
      console.error("Failed to load rooms:", err);

      setError(
        err?.message || "Failed to load available rooms. Please try again.",
      );

      setRooms([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const nights = useMemo(() => {
    if (!form.check_in_date || !form.check_out_date) {
      return 0;
    }

    const checkIn = new Date(`${form.check_in_date}T00:00:00`);
    const checkOut = new Date(`${form.check_out_date}T00:00:00`);

    const difference = checkOut - checkIn;

    const calculatedNights = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return calculatedNights > 0 ? calculatedNights : 0;
  }, [form.check_in_date, form.check_out_date]);

  const selectedRooms = form.rooms || [];

  const isRoomSelected = (roomId) => {
    return selectedRooms.some(
      (room) => Number(room.room_id) === Number(roomId),
    );
  };

  const getRoomTypeName = (room) => {
    return room.room_type?.name || "Room";
  };

  const getRoomPrice = (room) => {
    return Number(room.room_type?.base_price || 0);
  };

  const toggleRoom = (room) => {
    const roomId = room.id;
    const roomTypeId = room.room_type_id;
    const nightlyRate = getRoomPrice(room);

    const alreadySelected = isRoomSelected(roomId);

    if (alreadySelected) {
      const updatedRooms = selectedRooms.filter(
        (selectedRoom) => Number(selectedRoom.room_id) !== Number(roomId),
      );

      onChange({
        rooms: updatedRooms,
      });

      return;
    }

    const roomData = {
      room_type_id: roomTypeId,
      room_id: roomId,
      nightly_rate: nightlyRate,
    };

    onChange({
      rooms: [...selectedRooms, roomData],
    });

    setError("");
  };

  const handlePageChange = (page) => {
    if (page < 1) return;

    if (meta?.last_page && page > meta.last_page) {
      return;
    }

    setCurrentPage(page);

    /*
     * Scroll back toward the room list
     * when changing pages.
     */
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleContinue = () => {
    if (selectedRooms.length === 0) {
      setError("Please select at least one available room.");
      return;
    }

    if (nights <= 0) {
      setError("Please check your stay dates before continuing.");
      return;
    }

    setError("");
    onContinue?.();
  };

  const subtotal = selectedRooms.reduce((total, room) => {
    const nightlyRate = Number(room.nightly_rate || 0);

    return total + nightlyRate * nights;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Select Room</h2>

        <p className="text-sm text-slate-400 mt-1">
          Choose the available room or rooms for this reservation.
        </p>
      </div>

      {/* Stay Summary */}
      <div className="bg-base-800 border border-base-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Stay
            </p>

            <p className="text-sm text-white mt-1">
              {form.check_in_date || "—"}

              <span className="text-slate-500 mx-2">→</span>

              {form.check_out_date || "—"}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Length
            </p>

            <p className="text-sm font-semibold text-amber-400 mt-1">
              {nights > 0 ? `${nights} night${nights !== 1 ? "s" : ""}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <AlertCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />

          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />

            <span className="text-sm">Loading available rooms...</span>
          </div>
        </div>
      )}

      {/* Available Rooms */}
      {!loading && rooms.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const selected = isRoomSelected(room.id);

              const price = getRoomPrice(room);

              const roomTypeName = getRoomTypeName(room);

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  className={`text-left bg-base-800 border rounded-xl p-5 transition-all ${
                    selected
                      ? "border-amber-400/70 ring-1 ring-amber-400/20"
                      : "border-base-border hover:border-slate-600"
                  }`}
                >
                  {/* Room Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          selected
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-base-900 text-slate-500"
                        }`}
                      >
                        {selected ? (
                          <Check size={20} />
                        ) : (
                          <BedDouble size={20} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-white">
                            Room {room.room_number}
                          </h3>

                          {selected && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-400 mt-1">
                          {roomTypeName}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-amber-400">
                        ${price.toFixed(2)}
                      </p>

                      <p className="text-xs text-slate-500">per night</p>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-base-border">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Layers3 size={14} />

                      <span>Floor {room.floor ?? "—"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users size={14} />

                      <span>{room.capacity || "—"}</span>
                    </div>

                    <span className="text-xs text-emerald-400 font-medium">
                      Available
                    </span>
                  </div>

                  {/* Room Total */}
                  {selected && (
                    <div className="mt-4 bg-base-900 rounded-lg px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {nights} night
                        {nights !== 1 ? "s" : ""}
                      </span>

                      <span className="text-sm font-semibold text-white">
                        ${(price * nights).toFixed(2)}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && (
            <Pagination
              currentPage={currentPage}
              meta={meta}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* No Available Rooms */}
      {!loading && rooms.length === 0 && !error && (
        <div className="text-center py-16 bg-base-800 border border-base-border rounded-xl">
          <BedDouble size={40} className="mx-auto text-slate-600 mb-3" />

          <h3 className="text-white font-semibold">No available rooms</h3>

          <p className="text-sm text-slate-500 mt-1">
            There are currently no available rooms for reservation.
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {!loading && selectedRooms.length > 0 && (
        <div className="bg-base-800 border border-amber-400/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Reservation Summary
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {selectedRooms.length} room
                {selectedRooms.length !== 1 ? "s" : ""} selected
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">Room subtotal</p>

              <p className="text-xl font-bold text-amber-400 mt-1">
                ${subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {selectedRooms.map((room) => {
              const roomData = rooms.find(
                (item) => Number(item.id) === Number(room.room_id),
              );

              return (
                <div
                  key={room.room_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-400">
                    Room {roomData?.room_number || room.room_id}
                    <span className="text-slate-600 mx-1">•</span>
                    {roomData ? getRoomTypeName(roomData) : "Room"}
                  </span>

                  <span className="text-slate-200">
                    ${(Number(room.nightly_rate || 0) * nights).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-base-border">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg border border-base-border bg-base-800 hover:bg-base-700 text-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Reservation
        </button>
      </div>
    </div>
  );
}

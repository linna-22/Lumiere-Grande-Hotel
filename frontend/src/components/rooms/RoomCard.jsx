import { Pencil, Trash2 } from "lucide-react";

const statusStyles = {
  Available: "bg-emerald-500/90 text-white",
  Occupied: "bg-sky-500/90 text-white",
  Dirty: "bg-amber-500/90 text-base-950",
  Maintenance: "bg-rose-500/90 text-white",
};

function formatPrice(n) {
  return `$${n.toLocaleString("en-US")}`;
}

export default function RoomCard({ room, onEdit, onDelete }) {
  return (
    <div className="bg-base-850 border border-base-border rounded-xl overflow-hidden flex flex-col group transition-colors duration-200 hover:border-white/45">
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={room.image}
          alt={`Room ${room.number}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <span
          className={`absolute top-3 left-3 text-[11px] font-semibold lowercase px-2.5 py-1 rounded-md ${statusStyles[room.status]}`}
        >
          {room.status.toLowerCase()}
        </span>

        <span className="absolute bottom-3 right-3 text-amber-400 font-bold text-lg [text-shadow:_0_1px_4px_rgb(0_0_0_/_60%)]">
          {formatPrice(room.price)}/night
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg">Room {room.number}</h3>
        <p className="text-slate-400 text-sm mt-0.5">
          {room.type} · Floor {room.floor} · {room.guests} guests
        </p>
        <p className="text-slate-400 text-sm mt-2">
          {(room.description || "").length > 30
            ? `${room.description.slice(0, 30)}...`
            : room.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {(room.facilities ?? []).map((f) => (
            <span
              key={f.id ?? f.name}
              className="text-xs text-slate-300 bg-base-800 border border-base-border px-2 py-1 rounded-md"
            >
              {f.name}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-border">
          <button
            onClick={() => onEdit?.(room)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(room)}
            className="flex items-center justify-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Del
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

const statusStyles = {
  Available: 'bg-emerald-500/15 text-emerald-400',
  Occupied: 'bg-sky-500/15 text-sky-400',
  Reserved: 'bg-violet-500/15 text-violet-400',
  Cleaning: 'bg-amber-500/15 text-amber-400',
  Maintenance: 'bg-rose-500/15 text-rose-400',
}

function formatPrice(n) {
  return `$${n.toLocaleString('en-US')}`
}

export default function RoomsList({ rooms = [], activeTab = 'All' }) {
  const filtered = useMemo(() => {
    if (activeTab === 'All') return rooms
    return rooms.filter((r) => r.status === activeTab)
  }, [rooms, activeTab])

  return (
    <div className="bg-base-850 border border-base-border rounded-xl mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-base-border text-slate-400">
              <th className="text-left font-medium px-4 py-3">Room</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-left font-medium px-4 py-3">Floor</th>
              <th className="text-left font-medium px-4 py-3">Guests</th>
              <th className="text-left font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((room) => (
              <tr
                key={room.id}
                className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
              >
                <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                  Room {room.number}
                </td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{room.type}</td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{room.floor}</td>
                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{room.guests}</td>
                <td className="px-4 py-3 text-amber-400 font-semibold whitespace-nowrap">
                  {formatPrice(room.price)}/night
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusStyles[room.status]}`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    <button className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors">
                      <Trash2 size={12} />
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No rooms match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
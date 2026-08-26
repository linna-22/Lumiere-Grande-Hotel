import { useMemo } from 'react'
import RoomCard from './RoomCard'

export default function RoomsGrid({ rooms = [], activeTab = 'All' }) {
  const filtered = useMemo(() => {
    if (activeTab === 'All') return rooms
    return rooms.filter((r) => r.status === activeTab)
  }, [rooms, activeTab])

  if (filtered.length === 0) {
    return (
      <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-slate-500">
        No rooms match this filter.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {filtered.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
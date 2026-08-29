import RoomCard from "./RoomCard";

export default function RoomsGrid({ rooms = [], onEdit, onDelete }) {
  if (rooms.length === 0) {
    return (
      <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-slate-500">
        No rooms match this filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

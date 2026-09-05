import { featuredRooms } from './roomsData'

export default function RoomsSection() {
  return (
    <section className="bg-[#faf6f0] py-16 sm:py-20 px-6 sm:px-10">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900">Our Rooms & Suites</h2>
        <p className="text-stone-500 text-sm mt-3 max-w-lg mx-auto">
          Experience unparalleled comfort in our meticulously designed spaces, where heritage
          meets modern luxury.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {featuredRooms.map((room) => (
          <div key={room.name} className="bg-white rounded-md overflow-hidden shadow-sm">
            <div className="relative h-40">
              <img
                src={room.image}
                alt={room.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-sm">
                {room.badge}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-stone-900">{room.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{room.specs}</p>
              <p className="text-sm text-amber-700 font-semibold mt-2">{room.price}</p>
              <button className="w-full mt-4 border border-stone-300 text-stone-800 text-xs font-semibold tracking-widest py-2.5 rounded-sm hover:bg-stone-50 transition-colors">
                VIEW DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
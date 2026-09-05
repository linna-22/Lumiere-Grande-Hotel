import { Calendar, Users, Search } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[440px] sm:h-[560px]">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop"
          alt="Lumière Grand poolside at dusk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

        <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 max-w-2xl">
          <h1 className="text-white font-serif text-4xl sm:text-5xl leading-tight">
            Experience Luxury.
            <br />
            Stay Extraordinary.
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold tracking-widest px-6 py-3.5 rounded-sm transition-colors">
              BOOK YOUR STAY
            </button>
            <button className="border border-white/70 text-white text-xs font-semibold tracking-widest px-6 py-3.5 rounded-sm hover:bg-white/10 transition-colors">
              EXPLORE ROOMS
            </button>
          </div>
        </div>
      </div>

      {/* Floating booking bar */}
      <div className="relative z-10 max-w-5xl mx-auto -mt-8 sm:-mt-10 px-4">
        <div className="bg-white rounded-md shadow-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
              Check-in
            </label>
            <div className="flex items-center gap-2 mt-1.5 border border-stone-200 rounded px-3 py-2.5">
              <Calendar size={15} className="text-stone-400 shrink-0" />
              <span className="text-sm text-stone-400">Select Date</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
              Check-out
            </label>
            <div className="flex items-center gap-2 mt-1.5 border border-stone-200 rounded px-3 py-2.5">
              <Calendar size={15} className="text-stone-400 shrink-0" />
              <span className="text-sm text-stone-400">Select Date</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
              Guests & Rooms
            </label>
            <div className="flex items-center gap-2 mt-1.5 border border-stone-200 rounded px-3 py-2.5">
              <Users size={15} className="text-stone-400 shrink-0" />
              <span className="text-sm text-stone-700">2 Adults, 1 Room</span>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 bg-[#12100e] hover:bg-black text-white text-xs font-semibold tracking-widest py-3 rounded transition-colors">
            <Search size={14} />
            CHECK AVAILABILITY
          </button>
        </div>
      </div>
    </section>
  )
}
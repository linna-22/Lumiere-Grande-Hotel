import { Star, MapPin, BedDouble, Home, Plus } from 'lucide-react'

const actions = [
  { label: 'New Reservation', primary: true },
  { label: 'Walk-in Guest' },
  { label: 'Generate Invoice' },
  { label: 'Housekeeping' },
  { label: 'Check In' },
  { label: 'Check Out' },
]

export default function Hero() {
  return (
    <section className="relative rounded-2xl overflow-hidden min-h-[12rem] sm:h-50 flex flex-col justify-end">
      <img
        src="https://images.unsplash.com/photo-1677129667171-92abd8740fa3?w=1600&h=320&fit=crop&auto=format"
        alt="Hotel Dasmariñas"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-base-950/95 via-base-950/70 to-base-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-base-950/90 via-transparent to-transparent" />

      <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 px-5 sm:px-8 pb-6 pt-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
           LUMIÈRE GRAND
          </h1>
          <p className="text-amber-400 text-xs sm:text-sm font-medium mt-1">
            Hotel Management System - Saturday, August 22, 2026
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <Star size={14} className="text-amber-400" /> 5-Star Luxury Property
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <MapPin size={14} className="text-amber-400" /> Phnom Penh, Cambodia
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <BedDouble size={14} className="text-amber-400" /> 50 Rooms
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions.map(({ label, primary }) => (
            <button
              key={label}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-2 rounded-2xl whitespace-nowrap transition-colors ${
                primary
                  ? 'bg-amber-400 hover:bg-amber-500 text-base-950'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
              }`}
            >
              {primary && <Plus size={12} strokeWidth={2.5} />}
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

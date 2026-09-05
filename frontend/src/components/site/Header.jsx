import { Diamond } from 'lucide-react'

const navLinks = [
  { label: 'The Estate', active: true },
  { label: 'Suites' },
  { label: 'Dining' },
  { label: 'Contact' },
]

export default function Header() {
  return (
    <header className="bg-[#12100e] px-6 sm:px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Diamond size={18} className="text-amber-500" strokeWidth={1.5} />
        <span className="text-white font-serif text-lg tracking-[0.15em]">LUMIÈRE GRAND</span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map(({ label, active }) => (
          
            key={label}
            href="#"
            className={`text-sm tracking-wide transition-colors ${
              active
                ? 'text-amber-500 border-b border-amber-500 pb-0.5'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      <button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold tracking-widest px-5 py-2.5 rounded-sm transition-colors">
        BOOK NOW
      </button>
    </header>
  )
}
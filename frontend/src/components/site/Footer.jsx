import { Diamond, MapPin, Compass, ArrowRight } from 'lucide-react'

const columns = [
  {
    title: 'Navigation',
    links: ['The Estate', 'Suites', 'Dining', 'Experiences'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Press Room', 'Careers', 'Sustainability'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#efe9e1] pt-14 pb-6 px-6 sm:px-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <Diamond size={16} className="text-amber-700" strokeWidth={1.5} />
            <span className="font-serif text-base tracking-wide text-stone-900">
              LUMIÈRE GRAND
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-3 leading-relaxed">
            Redefining the art of hospitality through timeless design and impeccable service.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-stone-600 hover:text-stone-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            Connect
          </p>
          <p className="text-sm text-stone-600 mt-3">
            Subscribe to receive exclusive offers and updates.
          </p>
          <div className="flex items-center mt-3 border border-stone-300 rounded-sm overflow-hidden bg-white">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 text-sm px-3 py-2.5 outline-none placeholder:text-stone-400"
            />
            <button
              aria-label="Subscribe"
              className="flex items-center justify-center w-10 h-full bg-stone-900 hover:bg-black text-white shrink-0"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 mt-12 pt-5 border-t border-stone-300">
        <p className="text-xs text-stone-500">
          © 2026 Lumière Grand Hotel & Residences. All rights reserved.
        </p>
        <div className="flex items-center gap-3 text-stone-400">
          <MapPin size={14} />
          <Compass size={14} />
        </div>
      </div>
    </footer>
  )
}
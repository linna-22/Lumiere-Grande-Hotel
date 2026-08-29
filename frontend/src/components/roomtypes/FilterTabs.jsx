import { useState } from 'react'

const tabs = ['All', 'Active', 'Checked In', 'Checked Out', 'Cancelled']

export default function FilterTabs({ onChange }) {
  const [active, setActive] = useState('All')

  const handleClick = (tab) => {
    setActive(tab)
    onChange?.(tab)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleClick(tab)}
          className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            active === tab
              ? 'bg-amber-400 text-base-950 font-semibold'
              : 'text-slate-400 hover:bg-base-800 hover:text-slate-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

import { FILTER_TABS } from './Housekeepingutils'

export default function HousekeepingTabs({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-6">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === tab.value
              ? 'bg-amber-400 text-base-950 font-semibold'
              : 'text-slate-400 hover:bg-base-800 hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
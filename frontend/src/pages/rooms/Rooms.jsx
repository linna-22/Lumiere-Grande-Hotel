import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import PageHeader from '../../components/rooms/PageHeader'
import StatsCards from '../../components/rooms/StatsCards'
import FilterTabs from '../../components/rooms/FilterTabs'
import RoomsGrid from '../../components/rooms/RoomsGrid'
import RoomsList from '../../components/rooms/RoomsList'

export default function Rooms({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [view, setView] = useState('grid')

  return (
    <div className="flex bg-base-950 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Rooms"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <PageHeader view={view} onViewChange={setView} />
          <StatsCards />
          <FilterTabs onChange={setActiveTab} />
          {view === 'grid' ? (
            <RoomsGrid activeTab={activeTab} />
          ) : (
            <RoomsList activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  )
}

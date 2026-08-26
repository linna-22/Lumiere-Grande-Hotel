import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import PageHeader from '../../components/rooms/PageHeader'
import StatsCards from '../../components/rooms/StatsCards'
import FilterTabs from '../../components/rooms/FilterTabs'
import RoomsGrid from '../../components/rooms/RoomsGrid'
import RoomsList from '../../components/rooms/RoomsList'
import { useRooms } from '../../hooks/useRooms'

export default function Rooms({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [view, setView] = useState('grid')
  const { rooms, loading, error, refetch } = useRooms()

  return (
    <div className="flex bg-base-850 min-h-screen">
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
          <StatsCards rooms={rooms} />
          <FilterTabs onChange={setActiveTab} />

          {loading && (
            <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-slate-500">
              Loading rooms...
            </div>
          )}

          {error && !loading && (
            <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-rose-400">
              Failed to load rooms: {error}{' '}
              <button onClick={refetch} className="underline">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            view === 'grid' ? (
              <RoomsGrid rooms={rooms} activeTab={activeTab} />
            ) : (
              <RoomsList rooms={rooms} activeTab={activeTab} />
            )
          )}
        </main>
      </div>
    </div>
  )
}
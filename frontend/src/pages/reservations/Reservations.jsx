import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import PageHeader from '../../components/reservations/PageHeader'
import StatsCards from '../../components/reservations/StatsCards'
import FilterTabs from '../../components/reservations/FilterTabs'
import ReservationsTable from '../../components/reservations/ReservationsTable'

export default function Reservations({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Reservations"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <PageHeader />
          <StatsCards />
          <FilterTabs onChange={setActiveTab} />
          <ReservationsTable activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}

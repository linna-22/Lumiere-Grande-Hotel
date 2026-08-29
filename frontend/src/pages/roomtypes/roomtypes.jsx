import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import RoomtypeTable from '../../components/roomtypes/RoomtypesTable'
import PageHeader from '../../components/roomtypes/PageHeader'
import Pagination from '../../components/common/Pagination'

export default function RoomTypes({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="RoomTypes"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <PageHeader />
          <RoomtypeTable activeTab={activeTab} />
          {/* <Pagination currentPage={page} meta={meta} onPageChange={setPage} itemLabel="room types" /> */}
        </main>
      </div>
    </div>
  )
}

import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import RoomtypeTable from "../../components/roomtypes/RoomtypesTable";
import PageHeader from "../../components/roomtypes/PageHeader";
import Pagination from "../../components/common/Pagination";
import RoomTypeFormModal from "../../components/roomtypes/RoomTypeFormModal";
import SuccessModal from "../../components/rooms/SuccessModal";
import { useRoomTypes } from "../../hooks/useRoomTypes";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";

export default function RoomTypes({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState(null)

  const handleAddClick = () => {
    setEditingRoomType(null)
    setModalOpen(true)
  }

  const handleEditClick = (roomType) => {
    setEditingRoomType(roomType)
    setModalOpen(true)
  }

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active="RoomTypes" onNavigate={onNavigate} />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <PageHeader onAddRoomType={handleAddClick} />
          <RoomtypeTable activeTab={activeTab} onEdit={handleEditClick} />
        </main>
      </div>

      {modalOpen && (
        <RoomTypeFormModal
          roomType={editingRoomType}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            // table refetches itself via its own useRoomTypes() hook —
            // trigger a page refresh of that data by forcing a remount,
            // or better: lift useRoomTypes() up if you want tighter control
          }}
        />
      )}
    </div>
  )
}

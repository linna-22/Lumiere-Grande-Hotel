import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import RoomtypeTable from "../../components/roomtypes/RoomtypesTable";
import PageHeader from "../../components/roomtypes/PageHeader";
import Pagination from "../../components/common/Pagination";
import RoomTypeFormModal from "../../components/roomtypes/RoomTypeFormModal";
import SuccessModal from "../../components/rooms/SuccessModal";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { useRoomTypes } from "../../hooks/useRoomTypes";

export default function RoomTypes({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [deletingRoomType, setDeletingRoomType] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const { roomTypes, meta, loading, error, refetch, deleteRoomType } = useRoomTypes({
    activeTab,
    page,
    perPage: 8,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleAddClick = () => {
    setEditingRoomType(null);
    setModalOpen(true);
  };

  const handleEditClick = (roomType) => {
    setEditingRoomType(roomType);
    setModalOpen(true);
  };

  const handleModalSuccess = (action) => {
    refetch();
    setSuccessMessage(
      action === "update" ? "Room type updated successfully." : "Room type added successfully."
    );
  };

  const handleDeleteClick = (roomType) => {
    setDeletingRoomType(roomType);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoomType) return;
    setDeleteInProgress(true);
    try {
      await deleteRoomType(deletingRoomType.id);
      setDeletingRoomType(null);
      setSuccessMessage("Room type deleted successfully.");
    } catch (err) {
      alert(`Failed to delete room type: ${err.message}`);
    } finally {
      setDeleteInProgress(false);
    }
  };

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
          <PageHeader onAddRoomType={handleAddClick} />

          {!loading && !error && (
            <>
              <RoomtypeTable
                roomTypes={roomTypes}
                loading={loading}
                error={error}
                refetch={refetch}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
              <Pagination
                currentPage={page}
                meta={meta}
                onPageChange={setPage}
                itemLabel="room types"
              />
            </>
          )}

          {loading && (
            <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-slate-500">
              Loading room types...
            </div>
          )}

          {error && !loading && (
            <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-rose-400">
              Failed to load room types: {error}{" "}
              <button onClick={refetch} className="underline">
                Retry
              </button>
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <RoomTypeFormModal
          roomType={editingRoomType}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {deletingRoomType && (
        <ConfirmDeleteModal
          itemLabel="Room Type"
          itemName={deletingRoomType.name}
          deleting={deleteInProgress}
          onCancel={() => setDeletingRoomType(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {successMessage && (
        <SuccessModal message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
    </div>
  );
}
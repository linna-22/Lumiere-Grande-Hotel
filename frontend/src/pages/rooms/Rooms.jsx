import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import PageHeader from "../../components/rooms/PageHeader";
import StatsCards from "../../components/rooms/StatsCards";
import FilterTabs from "../../components/rooms/FilterTabs";
import RoomsGrid from "../../components/rooms/RoomsGrid";
import RoomsList from "../../components/rooms/RoomsList";
// import Pagination from "../../components/rooms/Pagination";
import Pagination from "../../components/common/Pagination";
import { useRooms } from "../../hooks/useRooms";
import RoomFormModal from "../../components/rooms/RoomFormModal";
import SuccessModal from "../../components/rooms/SuccessModal";
import { apiFetch } from "../../api/client";
import Loading from "../../components/common/Loading";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";

export default function Rooms({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const { rooms, summary, meta, loading, error, refetch } = useRooms({
    activeTab,
    page,
    perPage: 8,
  });
  const handleDeleteClick = (room) => {
    setDeletingRoom(room);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;
    setDeleteInProgress(true);
    try {
      const result = await apiFetch(`/rooms/${deletingRoom.id}`, {
        method: "DELETE",
      });
      setDeletingRoom(null);
      refetch();
      setSuccessMessage("Room deleted successfully.");
    } catch (err) {
      alert(`Failed to delete room: ${err.message}`);
    } finally {
      setDeleteInProgress(false);
    }
  };
  const handleModalSuccess = (action) => {
    refetch();
    setSuccessMessage(
      action === "update"
        ? "Room updated successfully."
        : "Room added successfully.",
    );
  };

  const handleAddClick = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // reset to page 1 whenever the filter changes
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex bg-[#081325] min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Rooms"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <PageHeader
            view={view}
            onViewChange={setView}
            onAddRoom={handleAddClick}
          />
          <StatsCards summary={summary} />
          <FilterTabs onChange={handleTabChange} />

          {loading && !error && <Loading label="Loading Rooms…" />}

          {error && !loading && (
            <div className="bg-base-850 border border-base-border rounded-xl mt-6 p-10 text-center text-rose-400">
              Failed to load rooms: {error}{" "}
              <button onClick={refetch} className="underline">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {view === "grid" ? (
                <RoomsGrid
                  rooms={rooms}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ) : (
                <RoomsList
                  rooms={rooms}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              )}
              <Pagination
                currentPage={page}
                meta={meta}
                onPageChange={setPage}
                itemLabel="rooms"
              />
            </>
          )}
        </main>
      </div>
      {modalOpen && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modalOpen && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
      {deletingRoom && (
        <ConfirmDeleteModal
          itemLabel="Room"
          itemName={deletingRoom.number}
          deleting={deleteInProgress}
          onCancel={() => setDeletingRoom(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

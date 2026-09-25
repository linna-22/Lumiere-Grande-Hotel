import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";

import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import PageHeader from "../../components/reservations/PageHeader";
import StatsCards from "../../components/reservations/StatsCards";
import FilterTabs from "../../components/reservations/FilterTabs";
import ReservationsTable from "../../components/reservations/ReservationsTable";
import { normalizeReservation } from "../../components/reservations/reservationMapper";
import Pagination from "../../components/common/Pagination";

import EditReservationModal from "../../components/reservations/EditReservationModal";
import CancelReservationModal from "../../components/reservations/CancelReservationModal";

import { deleteReservation } from "../../api/reservationsAdmin";
import ErrorModal from "../../components/common/ErrorModal";

const PAGE_SIZE = 10;
const FETCH_SIZE = 100;

const tabToStatuses = {
  All: null,
  Active: ["pending", "confirmed", "checked_in"],
  "Checked In": ["checked_in"],
  "Checked Out": ["checked_out"],
  Cancelled: ["cancelled"],
};

// ==========================================================
// Fetch all reservations
// ==========================================================

async function fetchAllReservations() {
  const first = await apiFetch(`/reservations?per_page=${FETCH_SIZE}&page=1`);

  let items = first.data?.data ?? [];
  const apiLastPage = first.data?.last_page ?? 1;

  for (let p = 2; p <= apiLastPage; p += 1) {
    const res = await apiFetch(
      `/reservations?per_page=${FETCH_SIZE}&page=${p}`,
    );

    items = items.concat(res.data?.data ?? []);
  }

  return items;
}

// ==========================================================
// Reservations Page
// ==========================================================

export default function Reservations({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "Something went wrong",
    message: "",
  });

  // ========================================================
  // Edit modal
  // ========================================================

  const [editingReservation, setEditingReservation] = useState(null);

  // ========================================================
  // Cancel modal
  // ========================================================

  const [reservationToCancel, setReservationToCancel] = useState(null);

  // Loading state for cancellation
  const [cancellingId, setCancellingId] = useState(null);

  // Success state for cancellation
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // ========================================================
  // Load reservations
  // ========================================================

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const items = await fetchAllReservations();

      setAllRows(items.map(normalizeReservation));
    } catch (err) {
      console.error("Failed to load reservations:", err);

      setError(err?.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  // ========================================================
  // Statistics
  // ========================================================

  const stats = useMemo(() => {
    const count = (key) => allRows.filter((r) => r.statusKey === key).length;

    return {
      total: allRows.length,
      confirmed: count("confirmed"),
      checked_in: count("checked_in"),
      pending: count("pending"),
      cancelled: count("cancelled"),
    };
  }, [allRows]);

  // ========================================================
  // Filter + Search
  // ========================================================

  const filtered = useMemo(() => {
    const statuses = tabToStatuses[activeTab];
    const q = search.trim().toLowerCase();

    return allRows.filter((r) => {
      const matchesTab = !statuses || statuses.includes(r.statusKey);

      const matchesQuery =
        !q ||
        r.guest.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [allRows, activeTab, search]);

  // ========================================================
  // Pagination
  // ========================================================

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, lastPage);

  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const paginationMeta = {
    current_page: currentPage,
    last_page: lastPage,
    per_page: PAGE_SIZE,
    total: filtered.length,
  };

  // ========================================================
  // Reload
  // ========================================================

  const reloadReservations = async () => {
    try {
      const items = await fetchAllReservations();

      setAllRows(items.map(normalizeReservation));
    } catch (err) {
      console.error("Failed to reload reservations:", err);

      setError(err?.message || "Failed to reload reservations.");
    }
  };

  // ========================================================
  // EDIT
  // ========================================================

  const handleEditReservation = (reservation) => {
    if (!reservation?.dbId) {
      setError("This reservation does not have a valid database ID.");
      return;
    }

    setError("");
    setEditingReservation(reservation);
  };

  const handleReservationSaved = async () => {
    setEditingReservation(null);

    await reloadReservations();
  };

  // ========================================================
  // OPEN CANCEL MODAL
  // ========================================================

  const handleCancelReservation = (reservation) => {
    if (!reservation?.dbId) {
      setError("This reservation does not have a valid database ID.");
      return;
    }

    setError("");

    // Reset success state when opening a new cancellation
    setCancelSuccess(false);

    // Open confirmation modal
    setReservationToCancel(reservation);
  };

  // ========================================================
  // CONFIRM CANCEL
  // ========================================================

  const confirmCancelReservation = async () => {
    if (!reservationToCancel?.dbId) return;

    try {
      setCancellingId(reservationToCancel.dbId);
      setError("");

      await deleteReservation(reservationToCancel.dbId);
      await reloadReservations();

      setCancelSuccess(true);
    } catch (err) {
      console.error("Failed to cancel reservation:", err);

      // Close the cancel modal first
      setReservationToCancel(null);
      setCancelSuccess(false);
      setCancellingId(null);

      // Then show the error modal
      setErrorModal({
        open: true,
        title: "Cancellation Failed",
        message:
          err?.message || "Failed to cancel the reservation. Please try again.",
      });

      return;
    } finally {
      setCancellingId(null);
    }
  };
  const closeErrorModal = () => {
    setErrorModal({
      open: false,
      title: "Something went wrong",
      message: "",
    });
  };

  // ========================================================
  // CLOSE CANCEL MODAL
  // ========================================================

  const closeCancelModal = () => {
    setReservationToCancel(null);
    setCancelSuccess(false);
  };

  // ========================================================
  // Tab
  // ========================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // ========================================================
  // Search
  // ========================================================

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="flex min-h-screen bg-base-850">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Reservations"
        onNavigate={onNavigate}
      />

      <div className="flex-1 min-w-0">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
          <PageHeader onNavigate={onNavigate} />

          <StatsCards stats={loading ? null : stats} />

          <FilterTabs onChange={handleTabChange} />

          <ReservationsTable
            rows={pageRows}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={handleSearchChange}
            total={filtered.length}
            onEdit={handleEditReservation}
            onCancel={handleCancelReservation}
            cancellingId={cancellingId}
          />

          <Pagination
            currentPage={currentPage}
            meta={paginationMeta}
            onPageChange={setPage}
            itemLabel="reservations"
          />
        </main>

        {/* ==================================================
            Edit Reservation Modal
        ================================================== */}

        {editingReservation && (
          <EditReservationModal
            reservation={editingReservation}
            onClose={() => setEditingReservation(null)}
            onSaved={handleReservationSaved}
          />
        )}

        {/* ==================================================
            Cancel Reservation Modal
        ================================================== */}

        {reservationToCancel && (
          <CancelReservationModal
            reservation={reservationToCancel}
            loading={cancellingId === reservationToCancel?.dbId}
            success={cancelSuccess}
            onClose={closeCancelModal}
            onConfirm={confirmCancelReservation}
          />
        )}
        {/* ==================================================
            Error Modal
        ================================================== */}

        {errorModal.open && (
          <ErrorModal
            title={errorModal.title}
            message={errorModal.message}
            onClose={closeErrorModal}
          />
        )}
      </div>
    </div>
  );
}

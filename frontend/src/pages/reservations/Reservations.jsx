import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client"; // same import as AddReservation.jsx, adjust the path
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import PageHeader from "../../components/reservations/PageHeader";
import StatsCards from "../../components/reservations/StatsCards";
import FilterTabs from "../../components/reservations/FilterTabs";
import ReservationsTable from "../../components/reservations/ReservationsTable";
import { normalizeReservation } from "../../components/reservations/reservationMapper";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10; // rows per page shown in the table
const FETCH_SIZE = 100; // rows requested per API call

const tabToStatuses = {
  All: null,
  Active: ["pending", "confirmed", "checked_in"],
  "Checked In": ["checked_in"],
  "Checked Out": ["checked_out"],
  Cancelled: ["cancelled"],
};

// GET /reservations returns { status, data: <Laravel paginator> }.
// Fetch every page so tabs, search and stats work on the full list.
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

export default function Reservations({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const items = await fetchAllReservations();
        if (!cancelled) setAllRows(items.map(normalizeReservation));
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load reservations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stat cards, computed from the loaded data.
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

  // Tab filter + search.
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

  // Pagination (must come after `filtered`).
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex bg-base-850 min-h-screen">
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
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
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
          />
          <Pagination
            currentPage={currentPage}
            meta={paginationMeta}
            onPageChange={setPage}
            itemLabel="reservations"
          />
        </main>
      </div>
    </div>
  );
}
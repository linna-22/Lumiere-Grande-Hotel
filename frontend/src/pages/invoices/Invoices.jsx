import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { apiFetch, apiDownload } from "../../api/client";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import Pagination from "../../components/common/Pagination";
import InvoicesHeader from "../../components/invoices/Invoicesheader";
import InvoiceStatsCards from "../../components/invoices/InvoiceStatsCards";
import InvoicesTable from "../../components/invoices/InvoicesTable";
import InvoiceDetailModal, {
  fetchInvoice,
  printInvoice,
} from "../../components/invoices/InvoiceDetailModal";

export default function InvoicesPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExporting(true);

      const blob = await apiDownload("/invoices/export/excel");

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "lumiere_hotel_invoices.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Invoices Excel error:", error);

      alert(error.message || "Failed to export invoices.");
    } finally {
      setExporting(false);
    }
  };

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load invoices whenever page or search changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ page });
        if (search) params.set("search", search);
        if (status) params.set("status", status);

        const res = await apiFetch(`/invoices?${params.toString()}`);
        if (cancelled) return;

        const rows = Array.isArray(res) ? res : (res?.data ?? []);
        const pageMeta =
          res?.meta ??
          (res?.current_page
            ? {
                current_page: res.current_page,
                last_page: res.last_page,
                per_page: res.per_page,
                total: res.total,
              }
            : null);

        setInvoices(rows);
        setMeta(pageMeta);

        setSummary(
          res?.summary ?? {
            total: pageMeta?.total ?? rows.length,
            paid: rows
              .filter((r) => r.status === "PAID")
              .reduce((sum, r) => sum + r.total_amount, 0),
            outstanding: rows
              .filter((r) => r.status !== "PAID")
              .reduce((sum, r) => sum + r.total_amount, 0),
            this_month: rows
              .filter((r) =>
                r.date?.startsWith(new Date().toISOString().slice(0, 7)),
              )
              .reduce((sum, r) => sum + r.total_amount, 0),
          },
        );
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load invoices.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  const handlePrintRow = async (inv) => {
    try {
      printInvoice(await fetchInvoice(inv.id));
    } catch (err) {
      alert(err.message || "Failed to load invoice for printing.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#081325]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Invoices"
        onNavigate={onNavigate}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 sm:p-6">
          <InvoicesHeader
            onExportExcel={handleExportExcel}
            exporting={exporting}
          />

          <InvoiceStatsCards summary={summary} />

          <div className="bg-base-850 border border-base-border rounded-2xl p-4 sm:p-6 mt-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
                <div className="relative w-full sm:w-96">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search invoice #, guest name or email..."
                    className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by status"
                  className="bg-base-800 border border-base-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                >
                  <option value="">All statuses</option>
                  <option value="paid">Paid</option>
                  {/* <option value="partial">Partial</option> */}
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <p className="text-sm text-slate-400">
                {meta?.total ?? 0} records
              </p>
            </div>

            <InvoicesTable
              invoices={invoices}
              loading={loading}
              error={error}
              onPreview={(inv) => setSelectedId(inv.id)}
              onView={(inv) => setSelectedId(inv.id)}
              onPrint={handlePrintRow}
            />

            <Pagination
              currentPage={page}
              meta={meta}
              onPageChange={setPage}
              itemLabel="invoices"
            />
          </div>
        </main>
      </div>

      {selectedId && (
        <InvoiceDetailModal
          invoiceId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

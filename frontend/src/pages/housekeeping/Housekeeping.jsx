import { useMemo, useState } from "react";
import {
  Search,
  FileDown,
  FileSpreadsheet,
  Printer,
  Plus,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import TaskFormModal from "../../components/housekeeping/TaskFormModal";
import DeleteTaskModal from "../../components/housekeeping/DeleteTaskModal";

// Mock data — replace with a real fetch (e.g. GET /api/housekeeping-tasks)
const INITIAL_TASKS = [
  {
    id: 1,
    room: "102",
    floor: 1,
    roomType: "Standard",
    task: "Daily Cleaning",
    priority: "Normal",
    status: "Completed",
    assignedTo: "Elena Ramos",
    assignedAt: "2024-07-31 08:00",
    completedAt: "2024-07-31 09:30",
  },
  {
    id: 2,
    room: "103",
    floor: 1,
    roomType: "Standard",
    task: "Checkout Clean",
    priority: "High",
    status: "In Progress",
    assignedTo: "Juana Cruz",
    assignedAt: "2024-07-31 09:00",
    completedAt: null,
  },
  {
    id: 3,
    room: "201",
    floor: 2,
    roomType: "Deluxe",
    task: "Daily Cleaning",
    priority: "Normal",
    status: "Pending",
    assignedTo: "Elena Ramos",
    assignedAt: "2024-07-31 10:00",
    completedAt: null,
  },
  {
    id: 4,
    room: "401",
    floor: 4,
    roomType: "Suite",
    task: "Turn Down",
    priority: "High",
    status: "Pending",
    assignedTo: "Carmen Bautista",
    assignedAt: "2024-07-31 18:00",
    completedAt: null,
  },
  {
    id: 5,
    room: "302",
    floor: 3,
    roomType: "Executive",
    task: "Deep Clean",
    priority: "Urgent",
    status: "Inspected",
    assignedTo: "Pedro Navarro",
    assignedAt: "2024-07-31 07:00",
    completedAt: "2024-07-31 11:00",
  },
  {
    id: 6,
    room: "403",
    floor: 4,
    roomType: "Suite",
    task: "Checkout Clean",
    priority: "High",
    status: "In Progress",
    assignedTo: "Juana Cruz",
    assignedAt: "2024-07-31 11:00",
    completedAt: null,
  },
  {
    id: 7,
    room: "204",
    floor: 2,
    roomType: "Deluxe",
    task: "Inspection",
    priority: "Normal",
    status: "Pending",
    assignedTo: "Carmen Bautista",
    assignedAt: "2024-07-31 14:00",
    completedAt: null,
  },
];

const FILTER_TABS = ["All", "Pending", "In Progress", "Completed", "Inspected"];

const statusDotColor = {
  Pending: "bg-sky-400",
  "In Progress": "bg-amber-400",
  Completed: "bg-sky-400",
  Inspected: "bg-rose-400",
};

const statusBadgeStyles = {
  Pending: "bg-violet-500/15 text-violet-400",
  "In Progress": "bg-amber-500/15 text-amber-400",
  Completed: "bg-slate-500/15 text-slate-300",
  Inspected: "bg-emerald-500/15 text-emerald-400",
};

const priorityStyles = {
  Normal: "bg-sky-500/15 text-sky-400",
  High: "bg-amber-500/15 text-amber-400",
  Urgent: "bg-rose-500/15 text-rose-400",
};

function nextAction(status) {
  if (status === "Pending") return { label: "Start", next: "In Progress" };
  if (status === "In Progress") return { label: "Done", next: "Completed" };
  if (status === "Completed") return { label: "Approve", next: "Inspected" };
  return null;
}

export default function Housekeeping({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [activeTab, setActiveTab] = useState('All')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const counts = useMemo(
    () => ({
      Pending: tasks.filter((t) => t.status === "Pending").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      Completed: tasks.filter((t) => t.status === "Completed").length,
      Inspected: tasks.filter((t) => t.status === "Inspected").length,
    }),
    [tasks],
  );

  const boardFiltered = useMemo(() => {
    if (activeTab === "All") return tasks;
    return tasks.filter((t) => t.status === activeTab);
  }, [tasks, activeTab]);

  const tableFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.room.toLowerCase().includes(q) ||
        t.task.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q),
    );
  }, [tasks, query]);

  function advanceTask(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const action = nextAction(t.status);
        if (!action) return t;
        return {
          ...t,
          status: action.next,
          completedAt:
            action.next === "Completed"
              ? new Date().toISOString().slice(0, 16).replace("T", " ")
              : t.completedAt,
        };
      }),
    );
    // TODO: submit status change to backend (e.g. PATCH /api/housekeeping-tasks/{id})
  }
  function handleAddClick() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function handleEditClick(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleFormSubmit(formData) {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                room: formData.room,
                floor: Number(formData.floor) || t.floor,
                roomType: formData.roomType,
                task: formData.taskType,
                assignedTo: formData.assignedTo,
                priority: formData.priority,
                status: formData.status,
                notes: formData.notes,
              }
            : t,
        ),
      );
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          room: formData.room,
          floor: Number(formData.floor) || 1,
          roomType: formData.roomType,
          task: formData.taskType,
          assignedTo: formData.assignedTo,
          priority: formData.priority,
          status: "Pending",
          assignedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          completedAt: null,
          notes: formData.notes,
        },
      ]);
    }
  }

  function handleDeleteClick(task) {
    setDeletingTask(task);
  }

  function handleConfirmDelete() {
    // TODO: DELETE /api/housekeeping-tasks/{id}
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    setDeletingTask(null);
  }
  const boardColumns = ["Pending", "In Progress", "Completed", "Inspected"];

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Housekeeping"
        onNavigate={onNavigate}
      />
      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                Housekeeping
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage cleaning schedules and tasks
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <FileDown size={15} />
                Export PDF
              </button>
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
              <button className="flex items-center gap-1.5 bg-base-800 border border-base-border hover:bg-base-700 text-slate-200 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
                <Printer size={15} />
                Print
              </button>
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                New Task
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-amber-400">
                {counts.Pending}
              </p>
              <p className="text-sm text-slate-400 mt-1">Pending</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-sky-400">
                {counts["In Progress"]}
              </p>
              <p className="text-sm text-slate-400 mt-1">In Progress</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-emerald-400">
                {counts.Completed}
              </p>
              <p className="text-sm text-slate-400 mt-1">Completed</p>
            </div>
            <div className="bg-base-850 border border-base-border rounded-2xl py-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-slate-500">
              <p className="text-3xl font-bold font-serif text-white">
                {counts.Inspected}
              </p>
              <p className="text-sm text-slate-400 mt-1">Inspected</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-amber-400 text-base-950 font-semibold"
                    : "text-slate-400 hover:bg-base-800 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Kanban board */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            {boardColumns.map((column) => {
              const columnTasks = boardFiltered.filter(
                (t) => t.status === column,
              );
              if (activeTab !== "All" && activeTab !== column) return null;

              return (
                <div key={column}>
                  <p className="text-sm text-slate-400 mb-3">
                    {column} ({columnTasks.length})
                  </p>
                  <div className="space-y-4">
                    {columnTasks.map((t) => {
                      const action = nextAction(t.status);
                      return (
                        <div
                          key={t.id}
                          className="bg-base-850 border border-base-border rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-white font-bold">Rm {t.room}</p>
                            <span
                              className={`w-2 h-2 rounded-full ${statusDotColor[t.status]}`}
                            />
                          </div>
                          <p className="text-sm text-slate-300 mt-1">
                            {t.task}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {t.assignedTo}
                          </p>

                          {action && (
                            <button
                              onClick={() => advanceTask(t.id)}
                              className={`w-full mt-4 text-sm font-semibold py-2 rounded-lg transition-colors ${
                                action.label === "Start"
                                  ? "bg-sky-500/15 hover:bg-sky-500/25 text-sky-400"
                                  : action.label === "Done"
                                    ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                    : "bg-amber-400 hover:bg-amber-500 text-base-950"
                              }`}
                            >
                              {action.label}
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <p className="text-sm text-slate-600 text-center py-6">
                        No tasks
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-base-850 border border-base-border rounded-xl mt-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-base-800 border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
              </div>
              <span className="text-sm text-slate-500 shrink-0">
                {tableFiltered.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead>
                  <tr className="border-y border-base-border text-slate-400">
                    {[
                      "Room",
                      "Task",
                      "Priority",
                      "Status",
                      "Assigned To",
                      "Assigned At",
                      "Completed",
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left font-medium px-4 py-3 whitespace-nowrap"
                      >
                        <span className="inline-flex items-center gap-1">
                          {col}
                          <ChevronUp size={12} className="text-slate-600" />
                        </span>
                      </th>
                    ))}
                    <th className="text-right font-medium px-4 py-3 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableFiltered.map((t) => {
                    const action = nextAction(t.status);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-base-border last:border-b-0 hover:bg-base-800/50 transition-colors"
                      >
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <p className="text-white font-semibold">{t.room}</p>
                          <p className="text-xs text-slate-500">
                            Floor {t.floor} · {t.roomType}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-200 whitespace-nowrap">
                          {t.task}
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${priorityStyles[t.priority]}`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${statusBadgeStyles[t.status]}`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-300 whitespace-nowrap">
                          {t.assignedTo}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-400 whitespace-nowrap">
                          {t.assignedAt}
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {t.completedAt ? (
                            <span className="text-emerald-400">
                              {t.completedAt}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            {action && (
                              <button
                                onClick={() => advanceTask(t.id)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                                  action.label === "Start"
                                    ? "bg-sky-500/15 hover:bg-sky-500/25 text-sky-400"
                                    : action.label === "Done"
                                      ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                                      : "bg-amber-400 hover:bg-amber-500 text-base-950"
                                }`}
                              >
                                {action.label}
                              </button>
                            )}
                            <button
                              onClick={() => handleEditClick(t)}
                              className="flex items-center gap-1 bg-base-800 hover:bg-base-700 border border-base-border text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(t)}
                              className="flex items-center gap-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {tableFiltered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No tasks match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {modalOpen && (
            <TaskFormModal
              task={editingTask}
              onClose={() => setModalOpen(false)}
              onSubmit={handleFormSubmit}
            />
          )}

          {deletingTask && (
            <DeleteTaskModal
              room={deletingTask.room}
              onCancel={() => setDeletingTask(null)}
              onConfirm={handleConfirmDelete}
            />
          )}
        </main>
      </div>
    </div>
  );
}

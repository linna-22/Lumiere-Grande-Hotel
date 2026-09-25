import { useState } from 'react'
import { FileDown, FileSpreadsheet, Loader2, Plus, Printer, X } from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

import HousekeepingStats from '../../components/housekeeping/HousekeepingStats'
import HousekeepingTabs from '../../components/housekeeping/HousekeepingTabs'
import HousekeepingBoard from '../../components/housekeeping/HousekeepingBoard'
import HousekeepingTable from '../../components/housekeeping/HousekeepingTable'
import TaskFormModal from '../../components/housekeeping/TaskFormModal'
import AssignStaffModal from '../../components/housekeeping/AssignStaffModal'
import useHousekeeping from '../../components/housekeeping/useHousekeeping'

export default function Housekeeping({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [assigningTask, setAssigningTask] = useState(null)

  const {
    tasks,
    loading,
    error,
    actionError,
    clearActionError,
    busyId,
    reload,
    advance,
    create,
    assign,
  } = useHousekeeping()

  return (
    <div className="flex bg-base-850 min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Housekeeping"
        onNavigate={onNavigate}
      />

      <div className="flex-1 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={onNavigate} />

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
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-3.5 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                New Task
              </button>
            </div>
          </div>

          {/* Action error (Start / Done / Approve failed) */}
          {actionError && (
            <div className="flex items-start justify-between gap-3 mt-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg px-4 py-3">
              <span>{actionError}</span>
              <button
                onClick={clearActionError}
                aria-label="Dismiss"
                className="shrink-0 hover:text-rose-300"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Loading / error / content */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Loading tasks…
            </div>
          ) : error ? (
            <div className="mt-8 bg-base-850 border border-base-border rounded-xl px-6 py-10 text-center">
              <p className="text-rose-400">{error}</p>
              <button
                onClick={() => reload()}
                className="mt-4 bg-amber-400 hover:bg-amber-500 text-base-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <HousekeepingStats tasks={tasks} />

              <HousekeepingTabs activeTab={activeTab} onChange={setActiveTab} />

              <HousekeepingBoard
                tasks={tasks}
                activeTab={activeTab}
                busyId={busyId}
                onAdvance={advance}
              />

              <HousekeepingTable
                tasks={tasks}
                busyId={busyId}
                onAdvance={advance}
                onAssign={setAssigningTask}
              />
            </>
          )}

          {createOpen && (
            <TaskFormModal
              onClose={() => setCreateOpen(false)}
              onSubmit={create}
            />
          )}

          {assigningTask && (
            <AssignStaffModal
              task={assigningTask}
              onClose={() => setAssigningTask(null)}
              onSubmit={assign}
            />
          )}
        </main>
      </div>
    </div>
  )
}
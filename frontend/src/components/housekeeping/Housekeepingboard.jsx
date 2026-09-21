import {
  ACTION_STYLES,
  BOARD_COLUMNS,
  STATUS_LABELS,
  nextAction,
  statusDotColor,
} from './Housekeepingutils'

export default function HousekeepingBoard({
  tasks,
  activeTab,
  busyId,
  onAdvance,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
      {BOARD_COLUMNS.map((column) => {
        if (activeTab !== 'all' && activeTab !== column) return null

        const columnTasks = tasks.filter((t) => t.status === column)

        return (
          <div key={column}>
            <p className="text-sm text-slate-400 mb-3">
              {STATUS_LABELS[column]} ({columnTasks.length})
            </p>

            <div className="space-y-4">
              {columnTasks.map((t) => {
                const action = nextAction(t.status)
                const busy = busyId === t.id

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

                    <p className="text-sm text-slate-300 mt-1">{t.task}</p>

                    <p
                      className={`text-sm mt-0.5 ${
                        t.assignedTo ? 'text-slate-500' : 'text-slate-600 italic'
                      }`}
                    >
                      {t.assignedTo ?? 'Unassigned'}
                    </p>

                    {action && (
                      <button
                        onClick={() => onAdvance(t)}
                        disabled={busy}
                        className={`w-full mt-4 text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${ACTION_STYLES[action.key]}`}
                      >
                        {busy ? 'Updating…' : action.label}
                      </button>
                    )}
                  </div>
                )
              })}

              {columnTasks.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-6">
                  No tasks
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
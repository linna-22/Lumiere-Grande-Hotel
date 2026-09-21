// Status values are exactly what the Laravel backend uses.
export const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  inspected: 'Inspected',
}

export const BOARD_COLUMNS = ['pending', 'in_progress', 'completed', 'inspected']

export const FILTER_TABS = [
  { value: 'all', label: 'All' },
  ...BOARD_COLUMNS.map((value) => ({ value, label: STATUS_LABELS[value] })),
]

export const statusDotColor = {
  pending: 'bg-sky-400',
  in_progress: 'bg-amber-400',
  completed: 'bg-sky-400',
  inspected: 'bg-rose-400',
}

export const statusBadgeStyles = {
  pending: 'bg-violet-500/15 text-violet-400',
  in_progress: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-slate-500/15 text-slate-300',
  inspected: 'bg-emerald-500/15 text-emerald-400',
}

export const ACTION_STYLES = {
  start: 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400',
  done: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400',
  approve: 'bg-amber-400 hover:bg-amber-500 text-base-950',
}

/**
 * The next step for a task:
 *  pending      -> PATCH status = in_progress
 *  in_progress  -> PATCH status = completed
 *  completed    -> POST approve (backend sets task inspected + room available)
 */
export function nextAction(status) {
  if (status === 'pending')
    return { key: 'start', label: 'Start', kind: 'status', next: 'in_progress' }
  if (status === 'in_progress')
    return { key: 'done', label: 'Done', kind: 'status', next: 'completed' }
  if (status === 'completed')
    return { key: 'approve', label: 'Approve', kind: 'approve' }
  return null
}

export function formatDateTime(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null

  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Turns one task from the API into the shape the UI uses.
 *
 * Note: Laravel serialises the `assignedUser` relation as `assigned_user`
 * (snake_case), so both spellings are checked.
 */
export function normalizeTask(t) {
  const user = t.assigned_user ?? t.assignedUser ?? null
  const done = t.status === 'completed' || t.status === 'inspected'

  return {
    id: t.id,
    roomId: t.room_id,
    room: t.room?.room_number ?? '—',
    floor: t.room?.floor ?? null,
    task: t.task_type,
    status: t.status,
    notes: t.notes,
    assignedToId: t.assigned_to,
    assignedTo: user?.name ?? null,
    createdAt: formatDateTime(t.created_at),
    // There is no "completed_at" in the API, so updated_at is the closest value.
    completedAt: done ? formatDateTime(t.updated_at) : null,
  }
}

export function getErrorMessage(err) {
  const fieldErrors = err?.data?.errors
  if (fieldErrors) {
    const first = Object.values(fieldErrors)[0]
    if (first?.[0]) return first[0]
  }
  return (
    err?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  )
}
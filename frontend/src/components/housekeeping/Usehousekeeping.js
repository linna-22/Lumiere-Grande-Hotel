import { useCallback, useEffect, useState } from 'react'
import {
  approveTask,
  assignStaff,
  createTask,
  getTasks,
  toList,
  updateTaskStatus,
} from '../../api/housekeepingApi'
import { getErrorMessage, nextAction, normalizeTask } from './Housekeepingutils'
import { echo } from '../../lib/echo'

export default function useHousekeeping() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('') // page-level load error
  const [actionError, setActionError] = useState('') // error from a button action
  const [busyId, setBusyId] = useState(null) // task currently being updated

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)

    try {
      const res = await getTasks()
      setTasks(toList(res).map(normalizeTask))
      setError('')
    } catch (err) {
      if (silent) setActionError(getErrorMessage(err))
      else setError(getErrorMessage(err))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Checkout and manual task creation broadcast on this channel.
  // Refresh the server list so the housekeeping board updates immediately.
  useEffect(() => {
    const channel = echo.channel('housekeeping-board')

    const handleTaskCreated = (event) => {
      console.log('[WebSocket] housekeeping.task.created received:', event)
      load({ silent: true })
    }

    channel.listen('.housekeeping.task.created', handleTaskCreated)

    return () => {
      channel.stopListening('.housekeeping.task.created', handleTaskCreated)
      echo.leaveChannel('housekeeping-board')
    }
  }, [load])

  /**
   * Start / Done / Approve button.
   * We reload the list afterwards because the status and approve endpoints
   * do not return the assigned user, so the server list is the source of truth.
   */
  const advance = useCallback(
    async (task) => {
      const action = nextAction(task.status)
      if (!action) return

      setBusyId(task.id)
      setActionError('')

      try {
        if (action.kind === 'approve') await approveTask(task.id)
        else await updateTaskStatus(task.id, action.next)

        await load({ silent: true })
      } catch (err) {
        setActionError(getErrorMessage(err))
      } finally {
        setBusyId(null)
      }
    },
    [load]
  )

  // These two throw on failure so the modal can show the error itself.
  const create = useCallback(
    async (payload) => {
      await createTask(payload)
      await load({ silent: true })
    },
    [load]
  )

  const assign = useCallback(
    async (id, userId) => {
      await assignStaff(id, userId)
      await load({ silent: true })
    },
    [load]
  )

  return {
    tasks,
    loading,
    error,
    actionError,
    clearActionError: () => setActionError(''),
    busyId,
    reload: load,
    advance,
    create,
    assign,
  }
}
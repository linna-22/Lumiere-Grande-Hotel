import { useEffect, useState } from 'react'
import { getRooms, getStaff, toList } from '../../api/housekeepingApi'

/**
 * Loads the rooms and staff lists used by the "New Task" and "Assign" forms.
 * Customers are removed from the staff list.
 */
export default function useLookups() {
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([getRooms(), getStaff()]).then(([r, s]) => {
      if (cancelled) return

      if (r.status === 'fulfilled') setRooms(toList(r.value))
      if (s.status === 'fulfilled') {
        setStaff(toList(s.value).filter((u) => u.role !== 'customer'))
      }

      if (r.status === 'rejected') setError('Could not load the rooms list.')
      else if (s.status === 'rejected') setError('Could not load the staff list.')

      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { rooms, staff, loading, error }
}
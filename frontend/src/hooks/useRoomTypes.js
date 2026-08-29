import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/room-types')
        const list = Array.isArray(data) ? data : data.data ?? []
        if (!cancelled) setRoomTypes(list)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { roomTypes, loading, error }
}
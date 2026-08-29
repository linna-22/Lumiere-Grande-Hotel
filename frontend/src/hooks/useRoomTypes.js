import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

// Laravel may return snake_case keys and store `facilities` as a JSON
// array, a comma-separated string, or null depending on the column cast.
// Normalize everything here so components never have to guess the shape.
function normalizeRoomType(raw) {
  let facilities = raw.facilities ?? []
  if (typeof facilities === 'string') {
    facilities = facilities
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
  }
  if (!Array.isArray(facilities)) facilities = []

  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    capacity: raw.capacity ?? 0,
    basePrice: Number(raw.base_price ?? raw.basePrice ?? 0),
    maxOccupancy: raw.max_occupancy ?? raw.maxOccupancy ?? 0,
    status: raw.status ?? 'Active',
    facilities,
  }
}

export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/room-types')
      const list = Array.isArray(data) ? data : data.data ?? []
      setRoomTypes(list.map(normalizeRoomType))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    // wrap so the cancelled flag still works with the shared `load`
    ;(async () => {
      if (!cancelled) await load()
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const deleteRoomType = useCallback(async (id) => {
    // optimistic removal, roll back on failure
    const prev = roomTypes
    setRoomTypes((curr) => curr.filter((rt) => rt.id !== id))
    try {
      await apiFetch(`/room-types/${id}`, { method: 'DELETE' })
    } catch (err) {
      setRoomTypes(prev)
      throw err
    }
  }, [roomTypes])

  return { roomTypes, loading, error, refetch: load, deleteRoomType }
}
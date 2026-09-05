import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

function normalizeRoomType(raw) {
  let facilities = raw.facilities ?? []
  if (typeof facilities === 'string') {
    facilities = facilities
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
  }
 if (!Array.isArray(facilities)) facilities = []
  facilities = facilities.map((f) =>
    typeof f === 'string' ? { id: null, name: f } : { id: f.id, name: f.name ?? f.label ?? '' }
  )

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

const TAB_TO_STATUS = {
  Active: 'active',
  Inactive: 'inactive',
}

export function useRoomTypes({ activeTab = 'All', page = 1, perPage = 8 } = {}) {
  const [roomTypes, setRoomTypes] = useState([])
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'All') {
        params.set('status', TAB_TO_STATUS[activeTab] ?? activeTab.toLowerCase())
      }
      params.set('page', page)
      params.set('per_page', perPage)

      const data = await apiFetch(`/room-types?${params.toString()}`)
      const list = Array.isArray(data) ? data : data.data ?? []

      setRoomTypes(list.map(normalizeRoomType))
      setSummary(data.summary ?? null)
      setMeta(
        data.meta
          ? {
              current_page: data.meta.curren_page ?? data.meta.current_page,
              last_page: data.meta.last_page,
              per_page: data.meta.per_page,
              total: data.meta.total,
            }
          : null
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, perPage])

  useEffect(() => {
    load()
  }, [load])

  const deleteRoomType = useCallback(async (id) => {
    const prev = roomTypes
    setRoomTypes((curr) => curr.filter((rt) => rt.id !== id))
    try {
      await apiFetch(`/room-types/${id}`, { method: 'DELETE' })
    } catch (err) {
      setRoomTypes(prev)
      throw err
    }
  }, [roomTypes])

  return { roomTypes, summary, meta, loading, error, refetch: load, deleteRoomType }
}
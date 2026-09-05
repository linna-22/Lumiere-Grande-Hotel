import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop'

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function normalizeRoom(apiRoom) {
  const type = apiRoom.room_type || {}

  return {
    id: apiRoom.id,
    number: apiRoom.room_number,
    room_type_id: apiRoom.room_type_id ?? type.id ?? '',
    type: type.name || 'Unknown',
    floor: apiRoom.floor,
    guests: apiRoom.capacity ?? '-',
    price: Number(type.base_price ?? 0),
    status: capitalize(apiRoom.status || ''),
    description: apiRoom.description || type.description || '',
    image: apiRoom.image_url || FALLBACK_IMAGE,
    amenities: apiRoom.amenities || [],
    facilities: type.facilities || [], // from the room's related room_type
  }
}
const TAB_TO_STATUS = {
  Available: 'available',
  Occupied: 'occupied',
  Reserved: 'reserved',
  Cleaning: 'cleaning',
  Maintenance: 'maintenance',
}

export function useRooms({ activeTab = 'All', page = 1, perPage = 8 } = {}) {
  const [rooms, setRooms] = useState([])
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'All') {
        params.set('status', TAB_TO_STATUS[activeTab] ?? activeTab.toLowerCase())
      }
      params.set('page', page)
      params.set('per_page', perPage)

      const data = await apiFetch(`/rooms?${params.toString()}`)

      setRooms((data.data ?? []).map(normalizeRoom))
      setSummary(data.summary ?? null)
      setMeta(data.meta ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab, page, perPage])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return { rooms, summary, meta, loading, error, refetch: fetchRooms }
}
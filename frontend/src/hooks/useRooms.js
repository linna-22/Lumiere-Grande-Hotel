import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop'

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Adjust this if your API returns the relation under a different key
// (e.g. `roomType` instead of `room_type`) — check the network tab response.
function normalizeRoom(apiRoom) {
  const type = apiRoom.room_type || apiRoom.roomType || {}

  return {
    id: apiRoom.id,
    number: apiRoom.room_number,
    type: type.name || 'Unknown',
    floor: apiRoom.floor,
    guests: type.max_occupancy ?? type.capacity ?? '-',
    price: Number(type.base_price ?? 0),
    status: capitalize(apiRoom.status || ''),
    description: apiRoom.description || type.description || '',
    image: apiRoom.image_url || FALLBACK_IMAGE,
    amenities: apiRoom.amenities || [], // not in your DB schema yet — see note below
  }
}

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/rooms')
      // handles both a plain array response and a Laravel paginated { data: [...] } response
      const list = Array.isArray(data) ? data : data.data ?? []
      setRooms(list.map(normalizeRoom))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return { rooms, loading, error, refetch: fetchRooms }
}
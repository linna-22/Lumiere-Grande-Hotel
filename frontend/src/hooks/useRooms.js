import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { echo } from '../lib/echo'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop'

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function normalizeRoom(apiRoom) {
  const type = apiRoom.room_type || apiRoom.roomType || {}

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
    facilities: type.facilities || [],
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

  const fetchRooms = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()

        if (activeTab !== 'All') {
          params.set(
            'status',
            TAB_TO_STATUS[activeTab] ?? activeTab.toLowerCase(),
          )
        }

        params.set('page', page)
        params.set('per_page', perPage)

        const data = await apiFetch(`/rooms?${params.toString()}`)

        setRooms((data.data ?? []).map(normalizeRoom))
        setSummary(data.summary ?? null)
        setMeta(data.meta ?? null)
      } catch (err) {
        setError(err.message || 'Failed to load rooms.')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [activeTab, page, perPage],
  )

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  /**
   * Laravel backend event:
   *
   * Channel: rooms-board
   * Event:   room.updated
   * Payload:
   * {
   *   room_id: 1,
   *   room_number: "101",
   *   status: "available",
   *   updated_at: "..."
   * }
   *
   * Important: the backend sends flat fields, NOT event.room.
   */
  useEffect(() => {
    const channel = echo.channel('rooms-board')

    const handleRoomUpdated = (event) => {
      console.log('[WebSocket] room.updated received:', event)

      const roomId = Number(event?.room_id)
      const status = event?.status

      if (!Number.isFinite(roomId) || !status) {
        console.warn('[WebSocket] Invalid room.updated payload:', event)
        return
      }

      // Update the visible room immediately.
      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          Number(room.id) === roomId
            ? { ...room, status: capitalize(status) }
            : room,
        ),
      )

      // Refresh silently so filters, pagination and summary stay correct.
      fetchRooms({ silent: true })
    }

    channel.listen('.room.updated', handleRoomUpdated)

    console.log('[WebSocket] Listening on rooms-board')

    return () => {
      channel.stopListening('.room.updated', handleRoomUpdated)
      echo.leaveChannel('rooms-board')
      console.log('[WebSocket] Left rooms-board')
    }
  }, [fetchRooms])

  return {
    rooms,
    summary,
    meta,
    loading,
    error,
    refetch: fetchRooms,
  }
}

import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export function useFacilities() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch('/facilities')
        // Response shape is { facilities: [...] } — not a plain array,
        // and not wrapped in "data" like the paginated endpoints.
        const list = Array.isArray(data) ? data : data.facilities ?? data.data ?? []
        if (!cancelled) setFacilities(list)
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

  return { facilities, loading, error }
}
import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { echo } from '../../lib/echo'

export default function RealtimeNotifications() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const channel = echo.channel('notifications')

    const handleNotification = (event) => {
      console.log('[WebSocket] notification.alert received:', event)

      const item = {
        id: `${Date.now()}-${Math.random()}`,
        type: event?.type || 'info',
        message: event?.message || 'New hotel notification',
        data: event?.data || {},
        time: new Date().toLocaleTimeString(),
      }

      setItems((current) => [item, ...current].slice(0, 5))
    }

    channel.listen('.notification.alert', handleNotification)

    return () => {
      channel.stopListening('.notification.alert', handleNotification)
      echo.leaveChannel('notifications')
    }
  }, [])

  return (
    <div className="fixed right-4 top-20 z-[100] w-[min(380px,calc(100vw-2rem))] space-y-3 pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto bg-base-900 border border-amber-400/30 shadow-2xl rounded-xl p-4 animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Bell size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold">{item.message}</p>
              {item.data?.guest_name && (
                <p className="text-xs text-slate-400 mt-1">
                  Guest: {item.data.guest_name}
                </p>
              )}
              {item.data?.reservation_id && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Reservation #{item.data.reservation_id}
                  {item.data?.amount != null ? ` · Amount: ${item.data.amount}` : ''}
                </p>
              )}
              <p className="text-[10px] text-slate-600 mt-2">{item.time}</p>
            </div>
            <button
              type="button"
              onClick={() => setItems((current) => current.filter((x) => x.id !== item.id))}
              className="text-slate-500 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

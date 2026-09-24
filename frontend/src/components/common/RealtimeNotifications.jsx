import { useEffect, useRef, useState } from 'react'
import { Bell, X, CalendarDays } from 'lucide-react'
import { echo } from '../../lib/echo'

export default function RealtimeNotifications({ onNavigate }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const notificationRef = useRef(null)

  useEffect(() => {
    const channel = echo.channel('notifications')

    const handleNotification = (event) => {
      console.log(
        '[WebSocket] notification.alert received:',
        event
      )

      const item = {
        id: `${Date.now()}-${Math.random()}`,
        type: event?.type || 'info',
        message:
          event?.message ||
          'New hotel notification',
        data: event?.data || {},
        time: new Date().toLocaleTimeString(),
        unread: true,
      }

      setItems((current) => [
        item,
        ...current,
      ].slice(0, 20))
    }

    channel.listen(
      '.notification.alert',
      handleNotification
    )

    return () => {
      channel.stopListening(
        '.notification.alert',
        handleNotification
      )

      echo.leaveChannel('notifications')
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  const unreadCount = items.filter(
    (item) => item.unread
  ).length

  const handleNotificationClick = (item) => {
    // Mark this notification as read
    setItems((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    )

    // Close notification dropdown
    setOpen(false)

    // Go to Reservations page
    onNavigate?.('Reservations')
  }

  const handleRemoveNotification = (
    event,
    id
  ) => {
    event.stopPropagation()

    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    )
  }

  return (
    <div
      ref={notificationRef}
      className="relative"
    >
      {/* ==================================================
          Notification Button
      ================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="
          relative
          w-9
          h-9
          flex
          items-center
          justify-center
          rounded-lg
          text-slate-300
          hover:text-white
          hover:bg-base-800
          transition-colors
        "
        aria-label="Notifications"
      >
        <Bell size={19} />

        {/* Notification count */}
        {unreadCount > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[18px]
              h-[18px]
              px-1
              rounded-full
              bg-rose-500
              text-white
              text-[10px]
              font-bold
              flex
              items-center
              justify-center
              border-2
              border-[#091326]
            "
          >
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>

      {/* ==================================================
          Notification Dropdown
      ================================================== */}

      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            mt-2
            w-[360px]
            max-w-[calc(100vw-2rem)]
            bg-base-850
            border
            border-base-border
            rounded-xl
            shadow-2xl
            overflow-hidden
            z-50
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-border">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Notifications
              </h3>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {items.length === 0
                  ? 'No notifications'
                  : `${items.length} notification${
                      items.length === 1
                        ? ''
                        : 's'
                    }`}
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setItems([])
                }
                className="
                  text-[11px]
                  text-slate-500
                  hover:text-rose-400
                  transition-colors
                "
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-base-800 flex items-center justify-center">
                  <Bell
                    size={18}
                    className="text-slate-500"
                  />
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      item
                    )
                  }
                  className={`
                    w-full
                    text-left
                    px-4
                    py-3
                    border-b
                    border-base-border
                    transition-colors
                    hover:bg-base-800
                    ${
                      item.unread
                        ? 'bg-base-800/40'
                        : ''
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="relative w-9 h-9 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                      <CalendarDays size={16} />

                      {item.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                          text-sm
                          ${
                            item.unread
                              ? 'text-white font-semibold'
                              : 'text-slate-300'
                          }
                        `}
                      >
                        {item.message}
                      </p>

                      {item.data?.guest_name && (
                        <p className="text-xs text-slate-400 mt-1">
                          Guest:{' '}
                          {item.data.guest_name}
                        </p>
                      )}

                      {item.data
                        ?.reservation_id && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Reservation #
                          {
                            item.data
                              .reservation_id
                          }

                          {item.data
                            ?.amount != null
                            ? ` · Amount: ${item.data.amount}`
                            : ''}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-600 mt-2">
                        {item.time}
                      </p>
                    </div>

                    {/* Remove */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) =>
                        handleRemoveNotification(
                          event,
                          item.id
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            'Enter' ||
                          event.key ===
                            ' '
                        ) {
                          handleRemoveNotification(
                            event,
                            item.id
                          )
                        }
                      }}
                      className="
                        text-slate-600
                        hover:text-white
                        shrink-0
                        p-1
                        rounded
                      "
                    >
                      <X size={14} />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-base-border">
              <p className="text-[11px] text-slate-600 text-center">
                Click a notification to view reservations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
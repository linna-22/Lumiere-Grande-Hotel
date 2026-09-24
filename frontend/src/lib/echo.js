import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
})

// Useful while developing locally. These logs can be removed later.
echo.connector.pusher.connection.bind('state_change', (states) => {
  console.log(
    `[Reverb] ${states.previous} → ${states.current}`,
  )
})

echo.connector.pusher.connection.bind('connected', () => {
  console.log('[Reverb] WebSocket connected')
})

echo.connector.pusher.connection.bind('error', (error) => {
  console.error('[Reverb] WebSocket error:', error)
})

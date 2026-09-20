<!-- ==============Authentication============ -->

composer require laravel/reverb:@beta

php artisan reverb:install


<!-- ===============Notification Handle============= -->

To handle real-time booking alerts on the dashboard, you do not need to create or poll any HTTP API endpoints. Instead, connect to our Laravel Reverb WebSocket server using Laravel Echo and listen on the public channel notifications for the .notification.alert event. When a guest submits a booking, Reverb will automatically push an event payload containing the notification type, message, and data (which includes reservation_id, guest_name, and amount) directly to your active WebSocket connection. Your component can simply consume this incoming payload to trigger an instant toast alert, play a chime sound, or update dashboard counters live without requiring a page refresh.

* You have to install this packages for connect with laravel echo 

npm install laravel-echo pusher-js react-hot-toast

* Laravel Echo Instance (src/lib/echo.js)

* Create a helper file to configure the Echo instance connecting to your Laravel Reverb server:

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});

* React Dashboard Component Listener



import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { echo } from '../lib/echo';

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // 1. Subscribe to public channel "notifications"
    const channel = echo.channel('notifications');

    // 2. Listen for custom event ".notification.alert"
    // Note: The leading dot '.' tells Echo to use the exact event name
    channel.listen('.notification.alert', (event) => {
      console.log('Real-time notification received:', event);

      // Trigger a visual toast banner
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              🔔 {event.message}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Guest: <strong>{event.data.guest_name}</strong> • Amount: <strong>${event.data.amount}</strong>
            </p>
          </div>
        </div>
      ), { duration: 5000 });

      // Update local state to add to notification feed/counter
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: event.type,
          message: event.message,
          data: event.data,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    // 3. Cleanup connection when component unmounts
    return () => {
      channel.stopListening('.notification.alert');
      echo.leaveChannel('notifications');
    };
  }, []);

  return (
    <div className="p-6">
      {/* Toast container */}
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-4">Hotel Management Dashboard</h1>

      {/* Real-time Notification Feed */}
      <div className="bg-white shadow rounded-lg p-4 max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Live Alerts ({notifications.length})</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No new alerts received yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((item) => (
              <li key={item.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 text-sm rounded">
                <div className="font-semibold text-blue-900">{item.message}</div>
                <div className="text-blue-700">
                  Code: #{item.data.reservation_id} | Guest: {item.data.guest_name}
                </div>
                <div className="text-xs text-blue-400 mt-1">{item.time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

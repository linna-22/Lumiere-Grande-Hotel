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

<!-- ===========================HouseKeeping============================================== -->
 * We intergrate it with WebSocket also
📢 Housekeeping Module & Real-Time Sync Specification
🎯 Overview
The Housekeeping module manages room cleaning tasks after guest checkouts. When a supervisor approves a cleaned room, the room's status instantly transitions to available, triggering a WebSocket broadcast to update the front-desk UI without requiring a manual page refresh.

1. Room & Task State Definitions
Room Statuses (rooms.status)
occupied: Guest is currently in the room.

dirty: Guest checked out; room requires cleaning.

available: Room is inspected, clean, and ready for new guest check-ins.

Housekeeping Task Statuses (housekeeping_tasks.status)
pending: Task created, waiting for staff assignment or cleanup.

in_progress: Housekeeper is currently cleaning the room.

completed: Housekeeper finished cleaning; waiting for supervisor inspection.

inspected: Supervisor approved the cleanup. (Triggers room state to available).

2. End-to-End Workflow
[Guest Checkout] ──> Room: dirty | Task: pending
                          │
[Housekeeper Cleans] ──> Task: in_progress ──> Task: completed
                          │
[Supervisor Approves] ──> Task: inspected ──> Room: available
                          │
              ⚡ WEBSOCKET BROADCAST SENT
                          │
[Front-Desk UI] ──> Room card instantly updates to "available" (Green)


* Guest Checkout: API sets room.status = "dirty" and auto-creates a housekeeping task with status = "pending".

Cleaning Phase: Housekeeper updates task status to "in_progress", then "completed".

Supervisor Approval: Supervisor hits the approve endpoint. The backend updates task status to "inspected", changes room status to available, and fires a WebSocket event.

Real-Time Update: The front-desk application receives the WebSocket event and updates the room status in the UI immediately.

3. API END POINT 

GET /api/housekeeping/tasks — Fetch tasks list (supports query params: ?status=pending or ?assigned_to={userId}).

POST /api/housekeeping/tasks — Create manual task (e.g., maintenance/deep clean).

PATCH /api/housekeeping/tasks/{id}/assign — Assign task to housekeeper ({ "assigned_to": userId }).

PATCH /api/housekeeping/tasks/{id}/status — Housekeeper updates status ({ "status": "in_progress" | "completed" }).

POST /api/housekeeping/tasks/{id}/approve — Supervisor approves room (triggers WebSocket event).

* You have to set up Laravel Echo 

example logic 

import Echo from 'laravel-echo';

// Subscribe to public channel
Echo.channel('rooms-board')
    .listen('.room.updated', (event) => {
        // event.room contains the updated Room object
        const updatedRoom = event.room;

        console.log(`Room ${updatedRoom.room_number} is now ${updatedRoom.status}`);

        // Example: Update React/Vue state array
        setRooms(prevRooms => 
            prevRooms.map(room => 
                room.id === updatedRoom.id ? updatedRoom : room
            )
        );
    });

    <!--=========================Check IN controller=================================== -->


* Workflow Breakdown

STEP 1: Guest Search or Walk-In
  ├─ Existing Reservation ──> GET  /api/check-in/search?query={term}
  └─ Walk-In Draft         ──> POST /api/check-in/walk-in

STEP 2: Guest ID Verification
  └─ POST /api/check-in/{id}/verify-guest (Updates name, nationality & photo)

STEP 3: Room Assignment
  └─ POST /api/check-in/{id}/assign-room (Locks room for reservation)

STEP 4: Balance Settlement & Check-In
  └─ POST /api/check-in/{id}/settle (Executes existing ReservationController logic)

------------------------------------------------------------------------------------------------

* Step-by-Step Breakdown
STEP 1: Find Booking or Create Walk-In
Goal: Identify which reservation we are working on.

Flow:

If the guest already booked online, search by name, phone, or code using GET /api/check-in/search.

If the guest is a walk-in, submit their basic info to POST /api/check-in/walk-in.

Output: You receive a reservation_id (e.g., 15), which you hold in frontend state for Steps 2, 3, and 4.

STEP 2: Verify Guest Identity
Goal: Collect mandatory guest details and identity documents upon arrival.

Flow: Submit guest information (and optionally an ID/Passport photo scan) to POST /api/check-in/{reservation_id}/verify-guest.

Output: Guest profile is updated in the database and linked to the reservation.

STEP 3: Assign Room
Goal: Assign a specific physical room number to the guest.

Flow: Display available clean rooms in the selected category and send the chosen room ID to POST /api/check-in/{reservation_id}/assign-room.

Output: The room is pre-assigned to this reservation.

STEP 4: Settle Payment & Finalize Check-In
Goal: Collect remaining payment balance (if any) and finalize the check-in process.

Flow:

Check remaining balance.

If balance > 0, collect payment via Cash or Bakong KHQR.

Send payment details and confirmation to POST /api/check-in/{reservation_id}/settle.

Output:

Reservation status changes to checked_in.

Room status changes to occupied.

Invoice payment status is updated to paid.

Check-in complete!

---------------------------------------------------------------------------------------------------
<!-- =========================CheckOutController================================-->

┌──────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND CHECK-OUT FLOW                            │
├───────────────────────────────┬─────────────────────────────────┬────────────────┤
│ Step 1: Initial Page Load     │ Step 2: Select Guest            │ Step 3: Action  │
│ Fetch active checked-in guests│ Fetch itemized bill & inspection│ Process check-out│
└───────────────┬───────────────┴────────────────┬────────────────┴────────┬───────┘
                │                                │                         │
                ▼                                ▼                         ▼
  GET /api/check-out/guests        GET /api/check-out/{id}/billing   POST /api/check-out/{id}/complete


1️⃣ Step 1: Load Sidebar Guest Feed
Trigger: When the user clicks on the Check Out navigation menu.

API Endpoint: GET /api/check-out/guests

Frontend Action:

Render the left sidebar list displaying each guest's name, room number, room type, check-out date, and PAID / UNPAID badge.

Store the list in state (guests).

Auto-select the first guest in the list by default.

-----------------------------------------------------------

* Step 2: Fetch Guest Billing & Inspection Details
Trigger: When staff clicks on any guest card in the sidebar.

API Endpoint: GET /api/check-out/{reservationId}/billing

Frontend Action:

Update the active selected guest state (selectedReservationId).

Render the Inspection Checklist (Bathroom, Bedroom, Mini Bar, Electronics, Furniture, Balcony).

Render the Billing Summary table:
Room Charges: (Nights $\times$ Nightly Rate)Extra Services: 
Financial Totals: Subtotal, Discount (%), VAT (12%), and TOTAL DUE.


-----------------------------------------------------------

* Step 3: Complete Check-Out (Orange Button)
Trigger: Clicking the Complete Check-out button.

API Endpoint: POST /api/check-out/{reservationId}/complete

------------------------------------------------------------------------

<!-- =====================Setiing Hotel Info function============== -->

Instead of hardcoding the hotel name, logo URL, contact details, or tax rates inside frontend components, all global configuration data is stored dynamically in the backend database.

Public Users & Guests: Can fetch basic branding data (logo, hotel name, address) to display on the navbar, footer, public booking pages, and guest receipts.

Admins & Management: Have privileged access to view, update, and manage all hotel configuration settings dynamically through the Admin Settings Dashboard.

🌐 API Endpoints Reference
1. Fetch Public Branding Info
Endpoint: GET /api/public-settings

Access: Public (No authentication or token required)

Usage: Fetch on initial app load (e.g., in React/Vue App Context or Global State Provider) to dynamically set page titles, nav logos, contact footers, and invoices.

2. Fetch All Admin Settings
Endpoint: GET /api/admin/settings

Access: Protected (Requires Bearer Token with Admin role)

Usage: Used inside the Admin Settings page form inputs to populate current database configuration values.

3. Update Admin Settings
Endpoint: POST /api/admin/settings

Access: Protected (Requires Bearer Token with Admin role)

Usage: Submit text fields, numbers, or toggles updated by the admin.

4. Upload Hotel Logo
Endpoint: POST /api/admin/settings/logo

Access: Protected (Requires Bearer Token with Admin role)

Usage: Upload an image file for the hotel logo. Handles file storage on backend/Cloudinary and updates the logo setting automatically.

For logo We are store on cloundinary with the same Room image

----------------------------------------------------------------------
composer require irazasyed/telegram-bot-sdk
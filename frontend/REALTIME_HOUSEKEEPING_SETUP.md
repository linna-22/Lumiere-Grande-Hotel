# Lumiere Hotel - Frontend API / Realtime Setup

This frontend is aligned to the Laravel 10 backend routes and WebSocket events in `backend/doc/node.md` and the supplied backend source.

## Frontend

```bash
npm install
npm run dev
```

The project uses:

- `laravel-echo`
- `pusher-js`

The Reverb client is in `src/lib/echo.js`.

## Backend processes

Run these in the Laravel project:

```bash
php artisan serve
php artisan reverb:start
```

The backend `.env` must use the Reverb broadcaster. After changing `.env`, clear cached configuration:

```bash
php artisan optimize:clear
```

The supplied backend uses `QUEUE_CONNECTION=sync`, so a separate queue worker is not required for the current local configuration. If the backend changes to a queued connection, a queue worker must also be running for `ShouldBroadcast` events.

## Room WebSocket

The supplied backend broadcasts:

- Channel: `rooms-board`
- Event: `.room.updated`
- Payload: `room_id`, `room_number`, `status`, `updated_at`

The frontend `useRooms` hook listens to that exact payload.

This is triggered by the supplied backend when checkout sets a room to `cleaning` and when housekeeping approval sets a room to `available`.

## Notifications

The frontend subscribes to:

- Channel: `notifications`
- Event: `.notification.alert`

and displays a live notification overlay.

Important: the supplied backend defines `NotificationAlert`, but the source currently supplied does not contain a `NotificationAlert::dispatch(...)` call. Therefore the frontend listener is ready, but no notification can arrive until the backend actually dispatches that event.

## Check-in

The frontend now uses the supplied backend routes:

- `GET /api/check-in/search`
- `POST /api/check-in/walk-in`
- `POST /api/check-in/{id}/verify-guest`
- `POST /api/check-in/{id}/assign-room`
- `POST /api/check-in/reservation/{reservationCode}/check-in`

The final check-in payload uses the backend's actual `room_assignments` contract.

## Check-out

The frontend uses:

- `GET /api/reservations?status=checked_in&per_page=100` for the checked-in guest list because the supplied `/check-out/guests` route points to `getCheckedInGuests()` while the controller currently defines `getCheckedInGuest()`.
- `GET /api/check-out/{reservationId}/billing` when available, with a reservation-data fallback because the supplied route/controller method names currently differ (`getBillingSummary` vs `getBillSummary`).
- `POST /api/check-out/{reservationId}/complete` for the actual checkout operation.

The final checkout endpoint in the supplied backend sets the room to `cleaning` and dispatches `RoomStatusUpdated`, so the Rooms page can update through Reverb.

## Important backend limitations found while matching the code

The frontend does not modify these backend issues:

1. `NotificationAlert` is defined but not dispatched in the supplied source.
2. The checkout list/billing route names do not match the controller method names.
3. The check-in controller does not dispatch `RoomStatusUpdated` after the final check-in, so another browser cannot learn about the room becoming `occupied` through the existing WebSocket event.
4. The supplied housekeeping checkout specification says checkout auto-creates a housekeeping task, but the supplied checkout controller only changes the room to `cleaning`; it does not create a housekeeping task.

These require backend changes if the team wants those specific behaviors to be realtime/automatic. The frontend has been written to match the backend that actually exists rather than inventing new backend events.

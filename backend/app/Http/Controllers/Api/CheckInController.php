<?php

namespace App\Http\Controllers\Api;

use App\Events\RoomStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Guests;
use App\Models\Reservation_rooms;
use App\Models\Reservations;
use App\Models\Rooms;
use App\Models\Room_types;
use App\Models\Invoices;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckInController extends Controller
{
    public function searchOrInit(Request $request)
    {
        $search = $request->input('query');

        $reservations = Reservations::with(['guest', 'invoice', 'reservationRooms.room', 'reservationRooms.roomType'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reservation_code', 'like', "%{$search}%")
                        ->orWhereHas('guest', function ($guestQuery) use ($search) {
                            $guestQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservations,
        ]);
    }

    public function createWalkIn(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'nullable|email',
        ]);

        return DB::transaction(function () use ($request) {
            $guest = Guests::firstOrCreate(
                ['phone' => $request->phone],
                [
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email ?? 'walkin_' . time() . '@hotel.com',
                ]
            );

            $reservation = Reservations::create([
                'reservation_code' => 'RES-' . strtoupper(Str::random(6)),
                'guest_id' => $guest->id,
                'check_in_date' => now()->toDateString(),
                'check_out_date' => now()->addDay()->toDateString(),
                'adults' => 1,
                'children' => 0,
                'total_amount' => 0.00,
                'paid_amount' => 0.00,
                'payment_status' => 'unpaid',
                'status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Walk-in draft created.',
                'reservation' => $reservation->load('guest'),
            ], 201);
        });
    }

    public function verifyGuest(Request $request, $reservationId)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'nationality' => 'nullable|string',
            'id_card' => 'nullable|string',
            'id_photo' => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:2048',
        ]);

        $reservation = Reservations::with('guest')->findOrFail($reservationId);

        $idPath = $reservation->guest->id_photo_path;
        if ($request->hasFile('id_photo')) {
            $idPath = $request->file('id_photo')->store('guest_identifications', 'public');
        }

        $reservation->guest->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'nationality' => $request->nationality,
            'id_card_no' => $request->id_card,
            'id_photo_path' => $idPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Guest details verified successfully.',
            'guest' => $reservation->guest,
        ]);
    }

    /**
     * Pre-assign the room selected in the Check-In UI.
     *
     * This updates the existing reservation_rooms row instead of creating
     * a second pivot row. The final check-in endpoint remains responsible
     * for the atomic availability check and changing the room to occupied.
     */
    public function assignRoom(Request $request, $reservationId)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        return DB::transaction(function () use ($request, $reservationId) {
            $reservation = Reservations::with('reservationRooms')->lockForUpdate()->findOrFail($reservationId);

            if (!in_array($reservation->status, ['confirmed', 'pending'], true)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only confirmed or pending reservations can be assigned a room.',
                ], 422);
            }

            $room = Rooms::whereKey($request->room_id)
                ->where('status', 'available')
                ->lockForUpdate()
                ->first();

            if (!$room) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'The selected room is no longer available.',
                ], 422);
            }

            $reservationRoom = $reservation->reservationRooms()
                ->where('status', 'reserved')
                ->orderBy('id')
                ->first();

            // Walk-in reservations start without a reservation_rooms row.
            // Create the row from the selected physical room and its room type.
            if (!$reservationRoom) {
                $roomType = Room_types::findOrFail($room->room_type_id);
                $nights = max(1, (int) round((strtotime($reservation->check_out_date) - strtotime($reservation->check_in_date)) / 86400));
                $nightlyRate = (float) $roomType->base_price;
                $subtotal = $nightlyRate * $nights;

                $reservationRoom = $reservation->reservationRooms()->create([
                    'room_type_id' => $roomType->id,
                    'room_id' => $room->id,
                    'nightly_rate' => $nightlyRate,
                    'status' => 'reserved',
                ]);

                $reservation->update([
                    'total_amount' => $subtotal,
                    'paid_amount' => 0,
                    'payment_status' => 'unpaid',
                ]);

                $invoice = Invoices::firstOrCreate(
                    ['reservation_id' => $reservation->id],
                    [
                        'invoice_no' => 'INV-' . strtoupper(Str::random(8)),
                        'guest_id' => $reservation->guest_id,
                        'invoice_date' => now(),
                        'subtotal' => $subtotal,
                        'tax' => 0,
                        'discount' => 0,
                        'total_amount' => $subtotal,
                        'status' => 'unpaid',
                    ]
                );

                $invoice->update([
                    'guest_id' => $reservation->guest_id,
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal,
                    'status' => 'unpaid',
                ]);

                if (!$invoice->items()->where('item_type', 'room_charge')->exists()) {
                    $invoice->items()->create([
                        'item_type' => 'room_charge',
                        'description' => "Walk-in for {$nights} night(s)",
                        'quantity' => $nights,
                        'unit_price' => $nightlyRate,
                        'amount' => $subtotal,
                    ]);
                }
            } else {
                $reservationRoom->update([
                    'room_id' => $room->id,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => "Room {$room->room_number} assigned.",
                'reservation' => $reservation->fresh([
                    'guest',
                    'reservationRooms.room',
                    'reservationRooms.roomType',
                    'invoice',
                ]),
            ]);
        });
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guests;
use App\Models\Reservations;
use App\Models\Rooms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckInController extends Controller
{

    public function searchOrInit(Request $request)
    {
        $search = $request->input('query');

        // Search active/pending arrivals
        $reservations = Reservations::with(['guest', 'reservationRooms.room'])
            ->whereIn('status', ['confirmed', 'pending'])
            ->when($search, function ($query) use ($search) {
                $query->where('reservation_code', 'like', "%{$search}%")
                    ->orWhereHas('guest', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservations
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
            // 1. Create or retrieve guest
            $guest = Guests::firstOrCreate(
                ['phone' => $request->phone],
                [
                    'first_name' => $request->first_name,
                    'last_name'  => $request->last_name,
                    'email'      => $request->email ?? 'walkin_' . time() . '@hotel.com',
                ]
            );

            // 2. Draft initial reservation
            $reservation = Reservations::create([
                'reservation_code' => 'RES-' . strtoupper(Str::random(6)),
                'guest_id'         => $guest->id,
                'check_in_date'    => now()->toDateString(),
                'check_out_date'   => now()->addDay()->toDateString(),
                'adults'           => 1,
                'children'         => 0,
                'total_amount'     => 0.00,
                'paid_amount'      => 0.00,
                'payment_status'   => 'unpaid',
                'status'           => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Walk-in draft created.',
                'reservation' => $reservation->load('guest')
            ], 201);
        });
    }

    public function verifyGuest(Request $request, $reservationId)
    {
        $request->validate([
            'first_name'  => 'required|string',
            'last_name'   => 'required|string',
            'nationality' => 'nullable|string',
            'id_card'     => 'nullable|string',
            'id_photo'    => 'nullable|file|mimes:jpeg,jpg,png,pdf|max:2048',
        ]);

        $reservation = Reservations::with('guest')->findOrFail($reservationId);

        // Optional document upload logic
        $idPath = $reservation->guest->id_photo_path;
        if ($request->hasFile('id_photo')) {
            $idPath = $request->file('id_photo')->store('guest_identifications', 'public');
        }

        $reservation->guest->update([
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'nationality'   => $request->nationality,
            'id_card_no'    => $request->id_card,
            'id_photo_path' => $idPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Guest details verified successfully.',
            'guest' => $reservation->guest
        ]);
    }

    public function assignRoom(Request $request, $reservationId)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        $room = Rooms::where('id', $request->room_id)
            ->where('status', 'available')
            ->firstOrFail();

        $reservation = Reservations::findOrFail($reservationId);

        // Assign physical room or link via pivot table
        $reservation->reservationRooms()->updateOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'room_id'          => $room->id,
                'actual_check_in'  => now()->toDateString(),
                'nightly_rate'     => $room->roomType->base_price ?? 0,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => "Room {$room->room_number} pre-assigned.",
            'reservation' => $reservation->load('reservationRooms.room')
        ]);
    }


}

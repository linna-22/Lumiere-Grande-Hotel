<?php

namespace App\Http\Controllers\Api;

use App\Events\RoomStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Reservations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckOutController extends Controller
{

    public function getCheckedInGuest(): JsonResponse
    {

        $guests = Reservations::with(['guest', 'room', 'room.roomType', 'invoice'])
            ->where(['status', 'checked_in'])
            ->orderBy('check_out_date', 'asc')
            ->get()
            ->map(function ($reservation) {
                $invoice = $reservation->invoice;
                $isPaid = $invoice ? $invoice->status === 'paid' : false;

                return [
                    'reservation_id' => $reservation->id,
                    'reference_no'   => $reservation->reference_no ?? 'HD-' . $reservation->id,
                    'guest_name'     => $reservation->guest->name ?? $reservation->guest_name,
                    'initials'       => $this->getInitials($reservation->guest->name ?? $reservation->guest_name),
                    'room_number'    => $reservation->room->room_number ?? 'N/A',
                    'room_type'      => $reservation->room->roomType->name ?? 'Standard',
                    'check_out_date' => $reservation->check_out_date,
                    'payment_status' => $isPaid ? 'PAID' : 'UNPAID',
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $guests
        ]);
    }

    public function getBillSummary(string $reservationId): JsonResponse
    {
        $reservation = Reservations::with(['guest', 'room.roomType', 'invoice.items', 'services'])
            ->findOrFail($reservationId);

        $invoice = $reservation->invoice;

        $roomCharge = $invoice->room_charge ?? ($reservation->room->roomType->price_per_night * $reservation->total_nights);
        $serviceItems = $invoice ? $invoice->items : [];
        $subtotal = $roomCharge + $serviceItems->sum('amount');

        $discountPercent = $invoice->discount_percent ?? 0;
        $discountAmount  = $subtotal * ($discountPercent / 100);
        $taxableAmount   = $subtotal - $discountAmount;

        $vatPercent = 12; // 12% VAT as shown in UI
        $vatAmount  = $taxableAmount * ($vatPercent / 100);
        $totalDue   = $taxableAmount + $vatAmount;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'reservation_id' => $reservation->id,
                'guest' => [
                    'first_name'  => $reservation->guest->first_name ?? $reservation->guest_name,
                    'last_name' => $reservation->guest->last_name ?? $reservation->guest_name,
                    'phone' => $reservation->guest->phone ?? $reservation->guest_phone,
                ],
                'room' => [
                    'id'          => $reservation->room_id,
                    'room_number' => $reservation->room->room_number ?? 'N/A',
                    'inspected'   => $reservation->room_inspected ?? false,
                ],
                'billing' => [
                    'room_charge'      => $roomCharge,
                    'total_nights'     => $reservation->total_nights ?? 1,
                    // 'items'            => $serviceItems,
                    'subtotal'         => $subtotal,
                    'discount_percent' => $discountPercent,
                    'discount_amount'  => $discountAmount,
                    'vat_percent'      => $vatPercent,
                    'vat_amount'       => $vatAmount,
                    'total_due'        => $totalDue,
                    'paid_amount'      => $invoice->paid_amount ?? 0,
                    'balance_due'      => max(0, $totalDue - ($invoice->paid_amount ?? 0)),
                ]
            ]
        ]);
    }

    public function completeCheckOut(Request $request, string $reservationId): JsonResponse
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:cash,bakong_khqr,card',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        return DB::transaction(function () use ($request, $reservationId) {
            $reservation = Reservations::with(['room', 'invoice'])->findOrFail($reservationId);

            if ($reservation->status !== 'checked_in') {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Guest is not currently checked in.'
                ], 422);
            }

            // A. Update Reservation Status
            $reservation->update([
                'status'         => 'checked_out',
                'actual_check_out' => now(),
            ]);

            // B. Update Room Status to Needs Cleaning (for Housekeeping tab)
            if ($reservation->room) {
                $reservation->room->update([
                    'status' => 'cleaning', // Send room straight to housekeeping queue
                ]);

                DB::afterCommit(fn() => RoomStatusUpdated::dispatch($reservation->room->fresh()));
            }

            // C. Finalize Invoice
            if ($reservation->invoice) {
                $reservation->invoice->update([
                    'status'      => 'paid',
                    'paid_at'     => now(),
                    'total_amount' => $request->input('total_due', $reservation->invoice->total_amount),
                ]);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Check-out completed successfully! Room status set to cleaning.',
                'data'    => [
                    'reservation_id' => $reservation->id,
                    'status'         => 'checked_out',
                    'room_status'    => 'cleaning',
                ]
            ]);
        });
    }
}

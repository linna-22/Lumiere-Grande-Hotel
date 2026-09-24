<?php

namespace App\Http\Controllers\Api;

use App\Events\RoomStatusUpdated;
use App\Events\HousekeepingTaskCreated;
use App\Http\Controllers\Controller;
use App\Models\Housekeeping_tasks;
use App\Models\Payments;
use App\Models\Reservations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckOutController extends Controller
{
    public function getCheckedInGuests(): JsonResponse
    {
        $reservations = Reservations::with([
            'guest',
            'reservationRooms.room.roomType',
            'invoice',
        ])
            ->where('status', 'checked_in')
            ->orderBy('check_out_date', 'asc')
            ->get();

        $guests = $reservations->map(function ($reservation) {
            $firstReservationRoom = $reservation->reservationRooms->first();
            $room = $firstReservationRoom?->room;

            $guestName = trim(
                ($reservation->guest->first_name ?? '') . ' ' .
                ($reservation->guest->last_name ?? '')
            );

            return [
                'reservation_id' => $reservation->id,
                'reservation_code' => $reservation->reservation_code,
                'guest_name' => $guestName !== ''
                    ? $guestName
                    : ($reservation->guest->name ?? 'Guest'),
                'room_number' => $room?->room_number ?? 'N/A',
                'room_id' => $room?->id,
                'room_type' => $room?->roomType?->name ?? 'Standard',
                'check_in_date' => $reservation->check_in_date,
                'check_out_date' => $reservation->check_out_date,
                'payment_status' => $reservation->payment_status,
                'total_amount' => (float) $reservation->total_amount,
                'paid_amount' => (float) $reservation->paid_amount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $guests,
        ]);
    }

    /**
     * Return billing information using the actual invoice/reservation schema.
     */
    public function getBillingSummary(string $reservationId): JsonResponse
    {
        $reservation = Reservations::with([
            'guest',
            'reservationRooms.room.roomType',
            'invoice.items',
        ])->findOrFail($reservationId);

        $invoice = $reservation->invoice;
        $subtotal = (float) ($invoice?->subtotal ?? $reservation->total_amount);
        $discountAmount = (float) ($invoice?->discount ?? 0);
        $taxAmount = (float) ($invoice?->tax ?? 0);
        $totalDue = (float) ($invoice?->total_amount ?? $reservation->total_amount);
        $paidAmount = (float) $reservation->paid_amount;

        return response()->json([
            'status' => 'success',
            'data' => [
                'reservation_id' => $reservation->id,
                'guest' => [
                    'first_name' => $reservation->guest->first_name ?? '',
                    'last_name' => $reservation->guest->last_name ?? '',
                    'phone' => $reservation->guest->phone ?? '',
                ],
                'rooms' => $reservation->reservationRooms->map(function ($reservationRoom) {
                    return [
                        'reservation_room_id' => $reservationRoom->id,
                        'room_id' => $reservationRoom->room_id,
                        'room_number' => $reservationRoom->room?->room_number,
                        'room_type' => $reservationRoom->roomType?->name,
                        'nightly_rate' => (float) $reservationRoom->nightly_rate,
                    ];
                })->values(),
                'billing' => [
                    'subtotal' => $subtotal,
                    'discount_percent' => $subtotal > 0 ? round(($discountAmount / $subtotal) * 100, 2) : 0,
                    'discount_amount' => $discountAmount,
                    'vat_amount' => $taxAmount,
                    'total_due' => $totalDue,
                    'paid_amount' => $paidAmount,
                    'balance_due' => max(0, $totalDue - $paidAmount),
                ],
            ],
        ]);
    }

    public function completeCheckOut(Request $request, string $reservationId): JsonResponse
    {
        $request->validate([
            'payment_method' => 'nullable|string|in:cash,bakong_khqr,card',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $result = DB::transaction(function () use ($request, $reservationId) {
            $reservation = Reservations::with([
                'guest',
                'invoice',
                'reservationRooms.room',
            ])->lockForUpdate()->findOrFail($reservationId);

            if ($reservation->status !== 'checked_in') {
                return [
                    'response' => response()->json([
                        'status' => 'error',
                        'message' => 'Guest is not currently checked in.',
                    ], 422),
                ];
            }

            $invoice = $reservation->invoice;

            // The checkout screen calculates the discount from the invoice
            // subtotal. The server is the final source of truth.
            $subtotal = (float) ($invoice?->subtotal ?? $reservation->total_amount);
            $discountPercent = (float) ($request->input('discount_percent') ?? 0);
            $discountAmount = round($subtotal * ($discountPercent / 100), 2);
            $taxableAmount = max(0, $subtotal - $discountAmount);

            // Keep the existing hotel's checkout VAT rule.
            $vatAmount = round($taxableAmount * 0.12, 2);
            $totalDue = round($taxableAmount + $vatAmount, 2);
            $paidAmount = (float) $reservation->paid_amount;
            $remainingBalance = max(0, round($totalDue - $paidAmount, 2));

            // Collect the actual physical rooms before changing reservation status.
            $reservationRooms = $reservation->reservationRooms
                ->filter(fn ($reservationRoom) => $reservationRoom->room !== null)
                ->values();

            if ($reservationRooms->isEmpty()) {
                return [
                    'response' => response()->json([
                        'status' => 'error',
                        'message' => 'No physical room is assigned to this checked-in reservation.',
                    ], 422),
                ];
            }

            // Settle any remaining balance at checkout.
            if ($remainingBalance > 0 && $invoice) {
                Payments::create([
                    'invoice_id' => $invoice->id,
                    'reservation_id' => $reservation->id,
                    'payment_date' => now(),
                    'amount' => $remainingBalance,
                    'payment_method' => $request->input('payment_method', 'cash'),
                    'payment_type' => 'remaining_balance',
                    'status' => 'completed',
                ]);
            }

            $reservation->update([
                'status' => 'checked_out',
                'paid_amount' => $totalDue,
                'payment_status' => 'paid',
            ]);

            if ($invoice) {
                $invoice->update([
                    'discount' => $discountAmount,
                    'tax' => $vatAmount,
                    'total_amount' => $totalDue,
                    'status' => 'paid',
                ]);
            }

            $createdTasks = [];
            $roomsForBroadcast = [];

            foreach ($reservationRooms as $reservationRoom) {
                $reservationRoom->update([
                    'actual_check_out' => now(),
                    'status' => 'checked_out',
                ]);

                $room = $reservationRoom->room;

                $room->update([
                    'status' => 'cleaning',
                ]);

                $task = Housekeeping_tasks::create([
                    'room_id' => $room->id,
                    'assigned_to' => null,
                    'task_type' => 'Checkout Clean',
                    'status' => 'pending',
                    'notes' => "Automatic checkout cleaning for reservation {$reservation->reservation_code}.",
                ]);

                $createdTasks[] = $task->load('room');
                $roomsForBroadcast[] = $room->fresh();
            }

            // Broadcast only after the transaction has committed.
            DB::afterCommit(function () use ($roomsForBroadcast, $createdTasks) {
                foreach ($roomsForBroadcast as $room) {
                    RoomStatusUpdated::dispatch($room);
                }

                foreach ($createdTasks as $task) {
                    HousekeepingTaskCreated::dispatch($task);
                }
            });

            return [
                'response' => response()->json([
                    'status' => 'success',
                    'message' => 'Check-out completed successfully. Housekeeping task(s) created.',
                    'data' => [
                        'reservation_id' => $reservation->id,
                        'reservation_code' => $reservation->reservation_code,
                        'status' => 'checked_out',
                        'room_status' => 'cleaning',
                        'total_due' => $totalDue,
                        'paid_amount' => $totalDue,
                        'remaining_balance' => 0,
                        'housekeeping_tasks_created' => count($createdTasks),
                    ],
                ]),
            ];
        });

        return $result['response'];
    }
}

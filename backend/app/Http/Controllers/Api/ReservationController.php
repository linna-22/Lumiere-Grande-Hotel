<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Models\Guests;
use App\Models\Invoices;
use App\Models\Payments;
use App\Models\Reservation_rooms;
use App\Models\Reservations;
use App\Models\Room_types;
use App\Models\Rooms;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReservationController extends Controller
{

// public function index(Request $request) {
//     $query = Reservations::
// }

    public function index(Request $request){

    $query = Reservations::with(['guest', 'rooms', 'invoice', 'payments', 'creator']);

    if($request->has('status')){

    $query->where('status', $request->query('status'));

    }

    if($request->has('search')){

    $search = $request->query('search');

    $query->where(function ($q) use ($search) {

    $q->where('reservation_code', 'Like', "%{$search}")->orWhereHas('guest', function($gQuery) use ($search){
        $gQuery->where('name', 'Like', "%{$search}")->orWhere('email', 'like', "%{$search}");
    });

    });

    }

    $reservation = $query->latest()->paginate($request->query('per_page', 10));

    return response()->json([
        'status' => 'success',
        'data' => $reservation
    ], 200);

    }


    
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // return DB::transaction(function () use (&$validated) {
        //     // 1. Guest Profile Management
        //     $guestId = $validated['guest_id'] ?? null;

        //     if (!$guestId && isset($validated['guest_details'])) {
        //         $guest = Guests::firstOrCreate(
        //             ['phone' => $validated['guest_details']['phone']],
        //             $validated['guest_details']
        //         );
        //         $guestId = $guest->id;
        //     }

        //     // 2. Stay Duration & Room Charges Calculation
        //     $nights = max(1, (int) round((strtotime($validated['check_out_date']) - strtotime($validated['check_in_date'])) / 86400));
        //     $subtotal = 0;

        //     foreach ($validated['rooms'] as $i => $roomData) {
        //         $roomType = Room_types::findOrFail($roomData['room_type_id']);
        //         $nightlyRate = $roomType->base_price;

        //         $validated['rooms'][$i]['nightly_rate'] = $nightlyRate;
        //         $subtotal += ($nightlyRate * $nights);
        //     }

        //     $tax = $validated['tax'] ?? 0;
        //     $discount = $validated['discount'] ?? 0;
        //     $totalAmount = max(0, ($subtotal + $tax) - $discount);

        //     // 3. Deposit / Full Payment Logic
        //     $paymentOption = $validated['payment_option'] ?? 'full';
        //     $paidAmount = 0;

        //     if ($paymentOption === 'deposit') {
        //         $paidAmount = $totalAmount * 0.50;
        //     } else if ($paymentOption === 'full') {
        //         $paidAmount = $totalAmount;
        //     }

        //     $paymentStatus = 'unpaid';
        //     if ($paidAmount >= $totalAmount && $totalAmount > 0) {
        //         $paymentStatus = 'paid';
        //     } else if ($paidAmount > 0) {
        //         $paymentStatus = 'partially_paid';
        //     }

        //     // 4. Reservation Unique Code Generation
        //     do {
        //         $reservationCode = 'RES-' . strtoupper(Str::random(6));
        //     } while (Reservations::where('reservation_code', $reservationCode)->exists());

        //     // 5. Create Reservation Envelope
        //     $reservation = Reservations::create([
        //         'guest_id'         => $guestId,
        //         'reservation_code' => $reservationCode,
        //         'check_in_date'    => $validated['check_in_date'],
        //         'check_out_date'   => $validated['check_out_date'],
        //         'adults'           => $validated['adults'],
        //         'children'         => $validated['children'] ?? 0,
        //         'total_amount'     => $totalAmount,
        //         'paid_amount'      => $paidAmount,
        //         'payment_status'   => $paymentStatus,
        //         'status'           => 'confirmed',
        //         'created_by'       => auth()->id() ?? null,
        //     ]);

        //     // 6. Attach Reserved Rooms
        //     foreach ($validated['rooms'] as $roomData) {
        //         $reservation->reservationRooms()->create([
        //             'room_type_id' => $roomData['room_type_id'],
        //             'room_id'      => null, // Assigned at check-in
        //             'nightly_rate' => $roomData['nightly_rate'],
        //             'status'       => 'reserved',
        //         ]);
        //     }

        //     // 7. Create Invoice & Items
        //     $invoice = Invoices::create([
        //         'invoice_no'     => 'INV-' . strtoupper(Str::random(8)),
        //         'reservation_id' => $reservation->id,
        //         'guest_id'       => $guestId,
        //         'invoice_date'   => now(),
        //         'subtotal'       => $subtotal,
        //         'tax'            => $tax,
        //         'discount'       => $discount,
        //         'total_amount'   => $totalAmount,
        //         'status'         => $paymentStatus,
        //     ]);

        //     $invoice->items()->create([
        //         'item_type'   => 'room_charge',
        //         'description' => "Online Booking for {$nights} night(s)",
        //         'quantity'    => $nights,
        //         'unit_price'  => $nights > 0 ? ($subtotal / $nights) : $subtotal,
        //         'amount'      => $subtotal,
        //     ]);

        //     // 8. Record Initial Payment (if any)
        //     if ($paidAmount > 0) {
        //         Payments::create([
        //             'invoice_id'     => $invoice->id,
        //             'reservation_id' => $reservation->id,
        //             'payment_date'   => now(),
        //             'amount'         => $paidAmount,
        //             'payment_method' => $validated['payment_method'],
        //             'payment_type'   => $paymentOption === 'deposit' ? 'deposit' : 'full_payment',
        //             'status'         => 'completed',
        //         ]);
        //     }

        //     return response()->json([
        //         'message' => 'Booking confirmed successfully!',
        //         'data' => [
        //             'reservation_code'  => $reservation->reservation_code,
        //             'status'            => $reservation->status,
        //             'payment_status'    => $reservation->payment_status,
        //             'total_amount'      => $reservation->total_amount,
        //             'paid_amount'       => $reservation->paid_amount,
        //             'remaining_balance' => $reservation->total_amount - $reservation->paid_amount,
        //             'invoice_no'        => $invoice->invoice_no,
        //             'guest'             => $reservation->guest,
        //             'qr_data'           => $reservation->reservation_code,
        //         ]
        //     ], 201);
        // });

        return DB::transaction(function () use (&$validated) {
        // 1. Guest Profile Management
        $guestId = $validated['guest_id'] ?? null;

        if (!$guestId && isset($validated['guest_details'])) {
            $guest = Guests::firstOrCreate(
                ['phone' => $validated['guest_details']['phone']],
                $validated['guest_details']
            );
            $guestId = $guest->id;
        }

        // 2. Stay Duration & Room Charges Calculation
        $nights = max(1, (int) round((strtotime($validated['check_out_date']) - strtotime($validated['check_in_date'])) / 86400));
        $subtotal = 0;

        foreach ($validated['rooms'] as $i => $roomData) {
            $roomType = Room_types::findOrFail($roomData['room_type_id']);
            $nightlyRate = $roomType->base_price;

            $validated['rooms'][$i]['nightly_rate'] = $nightlyRate;
            $subtotal += ($nightlyRate * $nights);
        }

        $tax = $validated['tax'] ?? 0;
        $discount = $validated['discount'] ?? 0;
        $totalAmount = max(0, ($subtotal + $tax) - $discount);

        // 3. Payment Method & Initial Status Calculation
        $paymentOption = $validated['payment_option'] ?? 'full';
        $paymentMethod = $validated['payment_method'] ?? 'cash';
        
        // If cash/card at front desk, record instant payment. If KHQR, set as unpaid pending scan.
        $isKhqr = ($paymentMethod === 'bakong_khqr');
        
        $paidAmount = 0;
        if (!$isKhqr) {
            if ($paymentOption === 'deposit') {
                $paidAmount = $totalAmount * 0.50;
            } else if ($paymentOption === 'full') {
                $paidAmount = $totalAmount;
            }
        }

        $paymentStatus = 'unpaid';
        if ($paidAmount >= $totalAmount && $totalAmount > 0) {
            $paymentStatus = 'paid';
        } else if ($paidAmount > 0) {
            $paymentStatus = 'partially_paid';
        }

        // 4. Reservation Unique Code Generation
        do {
            $reservationCode = 'RES-' . strtoupper(Str::random(6));
        } while (Reservations::where('reservation_code', $reservationCode)->exists());

        // 5. Create Reservation Record
        $reservation = Reservations::create([
            'guest_id'         => $guestId,
            'reservation_code' => $reservationCode,
            'check_in_date'    => $validated['check_in_date'],
            'check_out_date'   => $validated['check_out_date'],
            'adults'           => $validated['adults'],
            'children'         => $validated['children'] ?? 0,
            'total_amount'     => $totalAmount,
            'paid_amount'      => $paidAmount,
            'payment_status'   => $paymentStatus,
            'status'           => 'confirmed',
            'created_by'       => auth()->id() ?? null,
        ]);

        // 6. Attach Reserved Rooms
        foreach ($validated['rooms'] as $roomData) {
            $reservation->reservationRooms()->create([
                'room_type_id' => $roomData['room_type_id'],
                'room_id'      => null, // Assigned at check-in
                'nightly_rate' => $roomData['nightly_rate'],
                'status'       => 'reserved',
            ]);
        }

        // 7. Create Invoice
        $invoice = Invoices::create([
            'invoice_no'     => 'INV-' . strtoupper(Str::random(8)),
            'reservation_id' => $reservation->id,
            'guest_id'       => $guestId,
            'invoice_date'   => now(),
            'subtotal'       => $subtotal,
            'tax'            => $tax,
            'discount'       => $discount,
            'total_amount'   => $totalAmount,
            'status'         => $paymentStatus,
        ]);

        $invoice->items()->create([
            'item_type'   => 'room_charge',
            'description' => "Online Booking for {$nights} night(s)",
            'quantity'    => $nights,
            'unit_price'  => $nights > 0 ? ($subtotal / $nights) : $subtotal,
            'amount'      => $subtotal,
        ]);

        // 8. Record Payment ONLY if Cash/Card (KHQR will be handled by PaymentController)
        if ($paidAmount > 0 && !$isKhqr) {
            Payments::create([
                'invoice_id'     => $invoice->id,
                'reservation_id' => $reservation->id,
                'payment_date'   => now(),
                'amount'         => $paidAmount,
                'payment_method' => $paymentMethod,
                'payment_type'   => $paymentOption === 'deposit' ? 'deposit' : 'full_payment',
                'status'         => 'completed',
            ]);
        }

        return response()->json([
            'message' => 'Reservation created successfully!',
            'data' => [
                'reservation_id'    => $reservation->id,
                'reservation_code'  => $reservation->reservation_code,
                'status'            => $reservation->status,
                'payment_status'    => $reservation->payment_status,
                'total_amount'      => $reservation->total_amount,
                'paid_amount'       => $reservation->paid_amount,
                'remaining_balance' => $reservation->total_amount - $reservation->paid_amount,
                'invoice_id'        => $invoice->id,
                'invoice_no'        => $invoice->invoice_no,
                'guest'             => $reservation->guest,
            ]
        ], 201);
    });
    
    }

    public function settleAndCheck(Request $request, $reservationCode): JsonResponse
    {
        $request->validate([
            'payment_method'                         => 'nullable|string|in:cash,bakong_khqr,credit_card',
            'room_assignments'                       => 'required|array',
            'room_assignments.*.reservation_room_id' => 'required|exists:reservation_rooms,id',
            'room_assignments.*.room_id'             => 'required|exists:rooms,id',
        ]);

        return DB::transaction(function () use ($request, $reservationCode) {
            $reservation = Reservations::where('reservation_code', $reservationCode)->firstOrFail();
            $invoice = $reservation->invoice;

            $remainingBalance = $reservation->total_amount - $reservation->paid_amount;

            // Settle Balance
            if ($remainingBalance > 0) {
                Payments::create([
                    'invoice_id'     => $invoice->id,
                    'reservation_id' => $reservation->id,
                    'payment_date'   => now(),
                    'amount'         => $remainingBalance,
                    'payment_method' => $request->payment_method ?? 'cash',
                    'payment_type'   => 'remaining_balance',
                    'status'         => 'completed',
                ]);

                $reservation->update([
                    'paid_amount'    => $reservation->total_amount,
                    'payment_status' => 'paid',
                ]);

                $invoice->update(['status' => 'paid']);
            }

            // Assign Physical Rooms & Check In
            foreach ($request->room_assignments as $assignment) {
                Reservation_rooms::where('id', $assignment['reservation_room_id'])
                    ->update([
                        'room_id'         => $assignment['room_id'],
                        'actual_check_in' => now(),
                        'status'          => 'checked_in',
                    ]);

                Rooms::where('id', $assignment['room_id'])->update(['status' => 'occupied']);
            }

            $reservation->update(['status' => 'checked_in']);

            return response()->json([
                'message' => 'Check-In complete and remaining balance settled. Final receipt ready.',
                'receipt' => $invoice->load(['items', 'payments', 'guest']),
            ]);
        });
    }
}

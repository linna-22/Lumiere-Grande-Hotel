<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
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
    
    public function store(StoreReservationRequest $request): JsonResponse {

    $validated = $request->validated();

    return DB::transaction(function () use ($validated) {

        $guestId = $validated['guest_id'] ?? null;

        if(!$guestId && isset($validated['guest_details'])){

        $guest = Guests::firstOrCreate(
            ['phone' => $validated['guest_details']['phone']],
            $validated['guest_details']
        );

        $guestId = $guest->id;

        }

        $nights = max(1, (int) round((strtotime($validated['check_out_date']) - strtotime($validated['check_int_date'])) / 86400));

        $subtotal = 0;

       foreach($validated['rooms'] as $i => $roomData) {

       $roomType = Room_types::findOrFail($roomData['room_type_id']);

       $nightlyRate = $roomType->base_price;

       $validated['room'][$i]['nightly_rate'] = $nightlyRate;

       $subtotal += ($nightlyRate * $nights);

       } 

       $tax = $validated['tax'] ?? 0;
       $discount = $validated['discount'] ?? 0;
       $totalAmount = max(0,($subtotal +$tax) - $discount);

       $paymentOption = $validated['payment_option'] ?? 'full';
       
       $paidAmount = 0;

       if($paymentOption === 'deposit') {

        $paidAmount = $totalAmount * 0.50;
        
       }else if ($paymentOption === 'full') {

        $paidAmount = $totalAmount;

       }
        
       $paymentStatus = 'unpaid';

       if($paidAmount >= $totalAmount && $totalAmount > 0) {

        $paymentStatus = 'paid';

       }else if ($paidAmount > 0) {

        $paymentStatus = 'partially_paid';

       }

       do {

        $reservationCode = 'RES-' . strtoupper(Str::random(6));

       }while(Reservations::where('reservation_code', $reservationCode)->exists());

       $reservation = Reservations::create([

       'guest_id' => $guestId,
       'reservation_code' => $reservationCode,
       'check_in_date' => $validated['check_in_date'],
       'check_out_date' => $validated['check_out_date'],
       'adults' => $validated['adults'],
       'children' => $validated['children'] ?? 0,
       'total_amount' => $totalAmount,
       'paid_amount' => $paidAmount,
       'payment_status' => $paymentStatus,
       'status' => 'confirmed',
       'created_by' => null

       ]);

       foreach($validated['rooms'] as $roomdata) {

       $reservation->reservationRooms()->create([

       'room_type_id' => $roomData['room_type_id'],
       'room_id' => null,
       'nightly_rate' => $roomData['nightly_rate'],
       'status' => 'reserved',

       ]);

       }

        $invoice = Invoices::create([
            'invoice_no' => 'INV-' . time(),
            'reservation' => $reservation->id,
            'guest_id' => $guestId,
            'invoice_date' => now(),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'total_amount' => $totalAmount,
            'status' => $paymentStatus
        ]);

        $invoice->item()->create([
            'item_type' => 'room_charge',
            'desciption' => "Online Booking for {$nights} night(s)",
            'quantity' => $nights,
            'unit_price' => $subtotal / $nights,
            'amount' => $subtotal,
        ]);

        if($paidAmount > 0){

            Payments::create([

                'invoice_id' => $invoice->id,
                'reservation_id' => $reservation->id,
                'payment_date' => now(),
                'amount' => $paidAmount,
                'payment_method' => $validated['payment_method'],
                'payment_type' => $paymentOption === 'deposit' ? 'deposit' : 'full_payment',
                'status' => 'completed', 
            ]) ;
        }

        return response()->json([

            'message' => 'Booking confirmed successfully!',
            'data' => [
                'reservation_code' => $reservation->reservation_code,
                'status' => $reservation->status,
                'payment_status' => $reservation->payment_status,
                'total_amount' => $reservation->total_amount,
                'paid_amount' => $reservation->paid_amount,
                'remaining_balance' => $reservation->total_amount - $reservation->paid_amount,
                'invoice_no' => $invoice->invoice_no,
                'guest' => $reservation->guest,
                'qr_data' => $reservation->reservation_code
            ]
        ], 201);

    });

  

    }

    public function settleAndCheck(Request $request, $reservationCode): JsonResponse {

    $request->validate([
        
        'payment_method' => 'nullable|string|in:cash,bakong_khqr,credit_card',
        'room_assigments' => 'required|array',
        'room_assigments.*.reservation_room_id' => 'required|exists:reservation_rooms,id',
        'room_assigments.*.room_id' => 'required|exists:rooms,id',
    ]);

    return DB::transaction(function() use ($request, $reservationCode) {

    $reservation = Reservations::where('reservation_code', $reservationCode)->firstOrFail();
    $invoice = $reservation->invoice;

    $remainingBalance = $reservation->total_amount - $reservation->paid_amount;

    if($remainingBalance > 0){

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
            'paid_amount' => $reservation->total_amount,
            'payment_status' => 'paid'
        ]);

        $invoice->update(['status' => 'paid']);

    }

    foreach($request->room_assigments as $assignment) {
        Reservation_rooms::where('id', $assignment['reservation_room_id'])
        ->update([
            'room_id' => $assignment['room_id'],
            'actual_check_in' => now(),
            'status'   => 'checked_in',
        ]);

        Rooms::where('id', $assignment['room_id'])->update(['status' => 'occupaid']);
    }

    $reservation->update(['status' => 'checked_id']);

    return response()->json([
        'message' => 'Check-In complete and remaining balacne settled. Final recepit ready',
        'receipt' => $invoice->load(['items', 'payments', 'guest'])
    ]);
    });
    }

}

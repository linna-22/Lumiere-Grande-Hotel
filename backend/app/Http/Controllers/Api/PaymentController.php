<?php

namespace App\Http\Controllers;

use App\Models\Payments;
use App\Services\KhqrService;
use Faker\Provider\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    
    protected KhqrService $khqrService;

    public function __construct(KhqrService $khqrService)
    {
        $this->khqrService = $khqrService;
    }

    public function generatePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'invoice_id'     => 'required',
            'amount'         => 'required|numeric|min:0.01',
            'currency'       => 'nullable|string|in:USD,KHR',
        ]);

        $referenceNo = 'INV-' . $validated['invoice_id'];
        $currency    = $validated['currency'] ?? 'USD';

        // 1. Call KhqrService to generate QR and MD5
        $qrResult = $this->khqrService->generateQr(
            billNumber: $referenceNo,
            amount: (float) $validated['amount'],
            currency: $currency
        );

        if (!$qrResult['success']) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to generate QR: ' . $qrResult['error']
            ], 400);
        }

        // 2. Save payment record in your payments table
        $payment =  Payments::create([
            'reservation_id' => $validated['reservation_id'],
            'invoice_id'     => $validated['invoice_id'],
            'payments_date'  => now(),
            'amount'         => $validated['amount'],
            'payment_method' => 'khqr',
            'payments_type'  => 'room_booking',
            'reference_no'   => $referenceNo,
            'bakong_hash'    => $qrResult['md5'], // MD5 saved here!
            'status'         => 'pending',
        ]);

        // 3. Return QR data + payment info to frontend
        return response()->json([
            'status'     => 'success',
            'payment_id' => $payment->id,
            'qr_code'    => $qrResult['qr_code'],
            'md5'        => $qrResult['md5'],
            'deeplink'   => $qrResult['deeplink'],
        ], 201);
    }

    public function verifyPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([

            'payment_id' => 'required|exists:payments,id',
        ]);

        $payment = Payments::findOrFail($validated['payment_id']);

        // $payment = Payment::findOrFail($validated['payment_id']);

        // 1. Return immediately if already verified and marked as paid
        if ($payment->status === 'paid') {
            return response()->json([
                'status'  => 'success',
                'paid'    => true,
                'message' => 'Payment already completed.'
            ]);
        }

        // 2. Ensure we have the saved Bakong MD5 hash
        if (!$payment->bakong_hash) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No Bakong transaction hash associated with this payment.'
            ], 400);
        }

        // 3. Query Bakong via KhqrService
        $verification = $this->khqrService->verifyTransaction($payment->bakong_hash);

        // 4. Update status if payment succeeded
        if ($verification['paid']) {
            $payment->update([
                'status' => 'paid',
            ]);

            // Optional: Update room reservation status if needed
            $payment->reservation()->update(['status' => 'confirmed']);

            return response()->json([
                'status'  => 'success',
                'paid'    => true,
                'message' => 'Payment verified successfully.'
            ]);
        }

        return response()->json([
            'status'  => 'pending',
            'paid'    => false,
            'message' => 'Payment not completed yet.'
        ]);
    }

}

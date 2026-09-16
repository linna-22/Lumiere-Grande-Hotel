<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payments;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        'invoice_id'     => 'required|exists:invoices,id',
        'amount'         => 'required|numeric|min:0.01',
        'currency'       => 'nullable|string|in:USD,KHR',
    ]);

    $referenceNo = 'INV-' . $validated['invoice_id'];
    $currency    = $validated['currency'] ?? 'USD';
    
    $formattedAmount = number_format((float) $validated['amount'], 2, '.', '');

    $qrResult = $this->khqrService->generateQr(
        billNumber: $referenceNo,
        amount: $formattedAmount,
        currency: $currency
    );

    if (!$qrResult['success']) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Failed to generate QR: ' . $qrResult['error']
        ], 400);
    }

    $payment = Payments::create([
        'reservation_id' => $validated['reservation_id'],
        'invoice_id'     => $validated['invoice_id'],
        'payment_date'   => now(),
        'amount'         => $validated['amount'],
        'payment_method' => 'bakong_khqr',
        'payment_type'   => 'room_booking',
        'reference_no'   => $referenceNo,
        'bakong_hash'    => $qrResult['md5'],
        'status'         => 'pending',
    ]);

    return response()->json([
        'status'     => 'success',
        'payment_id' => $payment->id,
        'qr_code'    => $qrResult['qr_code'],
        'md5'        => $qrResult['md5'],
        'deeplink'   => $qrResult['deeplink'],
    ], 201);
}
    /**
     * Verify payment status against Bakong Open API via paymentId route parameter.
     */
    public function verifyPayment(string $paymentId): JsonResponse
    {
        
        $payment = Payments::with(['reservation', 'invoice'])->findOrFail($paymentId);

     
        if (in_array($payment->status, ['paid', 'completed'])) {
            return response()->json([
                'status'  => 'success',
                'paid'    => true,
                'message' => 'Payment already completed.'
            ]);
        }

        // 3. Ensure Bakong MD5 hash exists
        if (!$payment->bakong_hash) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No Bakong transaction hash associated with this payment.'
            ], 400);
        }

        // 4. Query NBC Bakong API
        $verification = $this->khqrService->verifyTransaction($payment->bakong_hash);

        // 5. Update database inside transaction if transfer confirmed
        if ($verification['paid']) {
            DB::transaction(function () use ($payment) {
                $payment->update(['status' => 'completed']);

                $reservation = $payment->reservation;
                if ($reservation) {
                    $newPaidAmount = $reservation->paid_amount + $payment->amount;
                    $paymentStatus = ($newPaidAmount >= $reservation->total_amount) ? 'paid' : 'partially_paid';

                    $reservation->update([
                        'paid_amount'    => $newPaidAmount,
                        'payment_status' => $paymentStatus,
                        'status'         => 'confirmed',
                    ]);

                    if ($payment->invoice) {
                        $payment->invoice->update(['status' => $paymentStatus]);
                    }
                }
            });

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

    public function processCashPayment(Request $request) : JsonResponse {

    $validated = $request->validate([
        'reservation_id' => 'required|exists:reservations,id',
        'invoice_id'     => 'required|exists:invoices,id',
        'amount_due' => 'required|numeric|min:0.01',
        'cash_recived' => 'required|numeric|min:0.01',
        'currency' => 'nullable|string|in:USD,KHR',
        'exchange' => 'nullable|numeric|min:1',
    ]);

    $currency = $validated['currency'] ?? 'USD';
    $exchangeRate = $validated['exchange'] ?? 4200;
    $amountDue = $validated['amount_due'];
    $cashReceived = $validated['cash_recived'];

    $recivedInUsd = ($currency === 'KHR') ? ($cashReceived / $exchangeRate) : $cashReceived;

    if($recivedInUsd < $amountDue) {
        return response()->json([
            'status' => 'error',
            'message' => 'Received cash is less than the amount due.'
        ], 422);


    }

    $changeUsd = $recivedInUsd - $amountDue;
    $changeKhr = $changeUsd * $exchangeRate;

    $referenceNo = 'CASH-' . $validated['invoice_id']. '-' . time();

   $payment = DB::transaction(function () use ($validated, $amountDue, $referenceNo) {
            // 1. Create Payment record
            $payment = Payments::create([
                'reservation_id' => $validated['reservation_id'],
                'invoice_id'     => $validated['invoice_id'],
                'payment_date'   => now(),
                'amount'         => $amountDue,
                'payment_method' => 'cash',
                'payment_type'   => 'room_booking',
                'reference_no'   => $referenceNo,
                'status'         => 'completed',
            ]);

            // 2. Update Reservation totals & status
            $reservation = $payment->reservation;
            if ($reservation) {
                $newPaidAmount = $reservation->paid_amount + $amountDue;
                $paymentStatus = ($newPaidAmount >= $reservation->total_amount) ? 'paid' : 'partially_paid';

                $reservation->update([
                    'paid_amount'    => $newPaidAmount,
                    'payment_status' => $paymentStatus,
                    'status'         => 'confirmed',
                ]);

                if ($payment->invoice) {
                    $payment->invoice->update(['status' => $paymentStatus]);
                }
            }

            return $payment;
        });

        return response()->json([
            'status'     => 'success',
            'message'    => 'Cash payment processed successfully.',
            'payment_id' => $payment->id,
            'summary'    => [
                'amount_due_usd' => number_format($amountDue, 2),
                'cash_received'  => number_format($cashReceived, 2) . ' ' . $currency,
                'exchange_rate'  => '1 USD = ' . number_format($exchangeRate) . ' KHR',
                'change_due'     => [
                    'usd' => number_format($changeUsd, 2),
                    'khr' => number_format(round($changeKhr, -2)), // Rounded to hundreds for KHR notes
                ]
            ]
        ], 201);

    }

}
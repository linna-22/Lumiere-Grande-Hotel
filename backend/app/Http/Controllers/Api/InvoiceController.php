<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoices;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class InvoiceController extends Controller
{

    public function index(Request $request)
    {

        $query = Invoices::with(['reservation.guest', 'reservation.reservationRooms.room']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {

                $q->where('invoice_number', 'LIKE', "%{$search}")
                    ->orWhereHas('reservation.guest', function ($guestQuery) use ($search) {

                        $guestQuery->where('name', 'LIKE', "%{$search}")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {

            $query->where('status', strtoupper($status));
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(10);


        $formattedData = $invoices->getCollection()->transform(function ($invoice) {
            $reservation = $invoice->reservation;
            $guest = $reservation->guest ?? null;
            $room = $reservation?->reservationRooms->first()?->room;

            return [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number ?? ('INV-' . $invoice->id),
                'guest'          => [
                    'first_name'   => $guest->first_name ?? 'N/A',
                    'last_name' => $guest->last_name ?? 'N/A',
                    'email'  => $guest->email ?? 'N/A',
                    'avatar' => $guest->avatar_url ?? null,
                ],
                'room'           => [
                    'number' => $room->room_number ?? 'N/A',
                    'type'   => $room->room_type ?? 'N/A',
                    'label'  => $room ? "{$room->room_number} · {$room->room_type}" : 'N/A',
                ],
                'stay'           => [
                    'check_in'  => $reservation->check_in_date ?? null,
                    'check_out' => $reservation->check_out_date ?? null,
                    'formatted' => ($reservation->check_in_date && $reservation->check_out_date)
                        ? "{$reservation->check_in_date} → {$reservation->check_out_date}"
                        : 'N/A',
                ],
                'total_amount'   => (float) $invoice->total_amount,
                'status'         => strtoupper($invoice->status),
                'date'           => $invoice->created_at->format('Y-m-d'),
            ];
        });
        $invoices->setCollection($formattedData);

        return response()->json($invoices);
    }

    public function show(string $id): JsonResponse
    {

        $invoice = Invoices::with([
            'reservation.guest',
            'reservation.reservationRooms.room'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number ?? ('INV-' . $invoice->id),
                'status'         => strtoupper($invoice->status),
                'created_at'     => $invoice->created_at->format('Y-m-d H:i'),
                'guest'          => [
                    'first_name'   => $guest->first_name ?? 'N/A',
                    'last_name' => $guest->last_name ?? 'N/A',
                    'email' => $invoice->reservation->guest->email ?? 'N/A',
                    'phone' => $invoice->reservation->guest->phone ?? 'N/A',
                ],
                'room'           => [
                    'number' => $invoice->reservation->room->room_number ?? 'N/A',
                    'type'   => $invoice->reservation->room->room_type ?? 'N/A',
                ],
                'stay'           => [
                    'check_in'  => $invoice->reservation->check_in_date,
                    'check_out' => $invoice->reservation->check_out_date,
                    'nights'    => $invoice->reservation->total_nights ?? 1,
                ],
                'pricing'        => [
                    'subtotal'  => (float) $invoice->subtotal,
                    'tax'       => (float) $invoice->tax,
                    'total'     => (float) $invoice->total_amount,
                    'paid'      => (float) $invoice->payments->where('status', 'completed')->sum('amount'),
                    'balance'   => (float) ($invoice->total_amount - $invoice->payments->where('status', 'completed')->sum('amount')),
                ],
                'payments'       => $invoice->payments,
            ],
        ]);
    }
}

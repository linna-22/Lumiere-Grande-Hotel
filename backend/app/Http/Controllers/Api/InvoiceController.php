<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoices;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class InvoiceController extends Controller
{
    
    public function index(Request $request){

    $query = Invoices::with(['reservation.guest', 'reservation.room']);

    if($search = $request->input('search')){
        $query->where(function ($q) use($search){

            $q->where('invoice_number', 'LIKE', "%{$search}")
            ->orWhereHas('reservation.guest', function($guestQuery) use ($search){

                $guestQuery->where('name', 'LIKE', "%{$search}")
                ->orWhere('email', 'LIKE', "%{$search}%");
            });
        });
    }

    if($status = $request->input('status')){

    $query->where('status', strtoupper($status));
    }

    $invoices = $query->orderBy('created_at', 'desc')->paginate(10);


    $formattedData = $invoices->getCollection()->tranform(function ($invoices){
        $reservation = $invoices->reservation;
            $guest = $reservation->guest ?? null;
            $room = $reservation->room ?? null;

            return [
                'id'             => $invoices->id,
                'invoice_number' => $invoice->invoice_number ?? ('INV-' . $invoices->id),
                'guest'          => [
                    'name'   => $guest->name ?? 'N/A',
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
                'total_amount'   => (float) $invoices->total_amount,
                'status'         => strtoupper($invoices->status), 
                'date'           => $invoices->created_at->format('Y-m-d'),
            ];
    });

    
    }

    // public function show(string $id): JsonResponse {

    
    // }
}

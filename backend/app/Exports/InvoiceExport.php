<?php

namespace App\Exports;

use App\Models\Invoices;
use Maatwebsite\Excel\Concerns\FromCollection;

class InvoiceExport implements FromCollection
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        //

        return Invoices::all();
    }

    public function headings(): array
    {

        return [

            'invoice_no',
            'reservation_id',
            'guest_id',
            'invoice_date',
            'due_date',
            'subtotal',
            'tax',
            'total_amount',
            'status'

        ];
    }

    public function map($invoice): array
    {
        return [

            $invoice->invoice_no,
            $invoice->reservation_id,
            $invoice->guest_id,
            $invoice->invoice_date,
            $invoice->subtotal,
            $invoice->tax,
            $invoice->total_amount,
            $invoice->status

        ];
    }
}

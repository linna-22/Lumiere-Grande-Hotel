<?php

namespace App\Exports;

use App\Models\Guests;
use Maatwebsite\Excel\Concerns\FromCollection;

class GuestsExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Guests::all();
    }

    public function headings(): array {

        return [
            'user_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'indenfication_type',
            'idenfication_number',
            'nationality',
                        
        ];
    }

    public function map($guests): array {

    return [
        $guests->user_id,
        $guests->id,
        $guests->first_name,
        $guests->last_name,
        $guests->email,
        $guests->phone,
        $guests->address,
        $guests->identification_type,
        $guests->identification_type,
        $guests->nationality
    ];

    }
}

<?php

namespace App\Exports;

use App\Models\Room_types;
use Maatwebsite\Excel\Concerns\FromCollection;

class RoomTypesExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        //

        return Room_types::all();


    }

    public function headings(): array {

    return [
        'RoomTypeName',
        'description',
        'capcacity',
        'Price($)',
        'max_occupancy',
        'status'
    ];

    }

    public function map($room_type): array {


    return [

        $room_type->id,
        $room_type->name,
        ucfirst($room_type->status),
        number_format($room_type->base_price, 2),
        $room_type->created_at ? $room_type->created_at->format('Y-m-d H:i') : '',
        
    ];

    }
}

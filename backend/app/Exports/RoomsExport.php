<?php

namespace App\Exports;


use App\Models\Rooms;
use Maatwebsite\Excel\Concerns\FromCollection;

class RoomsExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Rooms::with('roomType')->get();
    }

    public function headings(): array {

        return [
            'RoomId',
            'Room Number',
            'Room Type',
            'Floor',
            'description',
            'room_img',
            'cloundinary_id',
            'Satus',
        ];
    }

    public function map($room): array {

    return [
        
        $room->id,
            $room->room_number,
            $room->roomType->name ?? 'N/A',
            ucfirst($room->status),
            $room->created_at ? $room->created_at->format('Y-m-d H:i') : '',
    ];
    }
}

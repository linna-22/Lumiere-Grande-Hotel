<?php

namespace Database\Seeders;

use App\Models\Room_types;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $roomtype = [
            [
                'name'          => 'Lumière Classic',
                'description'   => 'A cozy and stylish room designed for a comfortable stay.',
                'base_price'    => 55.00,
                'capacity'      => 2,
                'max_occupancy' => 2,
                'status'        => 'active',
            ],

            [
                 'name'          => 'Deluxe Ocean View',
                'description'   => 'Spacious room featuring a king-sized bed and scenic ocean vistas.',
                'base_price'    => 95.00,
                'capacity'      => 3,
                'max_occupancy' => 2,
                'status'        => 'active',
            ],

            [
                'name'          => 'Executive Suite',
                'description'   => 'Premium suite with separate living room area, work desk, and VIP perks.',
                'base_price'    => 150.00,
                'capacity'      => 4,
                'max_occupancy' => 4,
                'status'        => 'active',
            ],

            [
                'name'          => 'Presidential Suite',
                'description'   => 'Top-tier luxury penthouse suite with full amenities and private balcony.',
                'base_price'    => 300.00,
                'capacity'      => 4,
                'max_occupancy' => 6,
                'status'        => 'active',
            ]
        ];

        foreach($roomtype as $type){
            Room_types::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}

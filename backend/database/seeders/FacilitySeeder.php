<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            ['name' => 'Free wifi', 'icon' => 'wifi'],
            ['name' => 'Air conditioning', 'icon' => 'ac_unit'],
            ['name' => 'Television', 'icon' => 'tv'],
            ['name' => 'Mini bar', 'icon' => 'local_bar'],
            ['name' => 'Room service', 'icon' => 'room_service'],
            ['name' => 'Private bathroom', 'icon' => 'bathtub'],
            ['name' => 'Hair dryer', 'icon' => 'hairdryer'],
            ['name' => 'Safe deposit box', 'icon' => 'lock'],
            ['name' => 'Coffee/tea maker', 'icon' => 'coffee'],
            ['name' => 'Iron and ironing board', 'icon' => 'iron'],
            ['name' => 'Balcony or terrace', 'icon' => 'deck'],
            ['name' => 'Seating area', 'icon' => 'weekend'],
            ['name' => 'Work desk', 'icon' => 'work'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate(['name' => $facility['name']], $facility);
        }
    }
}

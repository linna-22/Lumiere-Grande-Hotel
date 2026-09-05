<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\Room_types;
use App\Models\Rooms;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
    //     if (Room_types::count() === 0) {
            
    //         Room_types::factory()->count(4)->create();
    //     }

    //     // 2. Seed 15 mock rooms distributed across those room types
    //     Rooms::factory()->count(15)->create();
    // }

    $roomTypes = Room_types::all();

        if ($roomTypes->isEmpty()) {
            $this->command->error('Please run RoomTypeSeeder first!');
            return;
        }

        // Get IDs or fallback to first room type
        $classicId = $roomTypes->where('name', 'Lumière Classic')->first()->id ?? $roomTypes->first()->id;
        $deluxeId  = $roomTypes->where('name', 'Deluxe Ocean View')->first()->id ?? $roomTypes->first()->id;
        $suiteId   = $roomTypes->where('name', 'Executive Suite')->first()->id ?? $roomTypes->first()->id;
        $vipId     = $roomTypes->where('name', 'Presidential Suite')->first()->id ?? $roomTypes->first()->id;

        // Sample Cloudinary test image
        $sampleImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
        $cloudinaryId = 'sample';

        // Array of 20 Rooms
        $rooms = [
            // Floor 1 (Classic Rooms)
            ['room_number' => '101', 'room_type_id' => $classicId, 'status' => 'available'],
            ['room_number' => '102', 'room_type_id' => $classicId, 'status' => 'occupied'],
            ['room_number' => '103', 'room_type_id' => $classicId, 'status' => 'available'],
            ['room_number' => '104', 'room_type_id' => $classicId, 'status' => 'reserved'],
            ['room_number' => '105', 'room_type_id' => $classicId, 'status' => 'cleaning'],

            // Floor 2 (Deluxe Rooms)
            ['room_number' => '201', 'room_type_id' => $deluxeId,  'status' => 'available'],
            ['room_number' => '202', 'room_type_id' => $deluxeId,  'status' => 'occupied'],
            ['room_number' => '203', 'room_type_id' => $deluxeId,  'status' => 'available'],
            ['room_number' => '204', 'room_type_id' => $deluxeId,  'status' => 'maintenance'],
            ['room_number' => '205', 'room_type_id' => $deluxeId,  'status' => 'reserved'],

            // Floor 3 (Executive Suites)
            ['room_number' => '301', 'room_type_id' => $suiteId,   'status' => 'available'],
            ['room_number' => '302', 'room_type_id' => $suiteId,   'status' => 'occupied'],
            ['room_number' => '303', 'room_type_id' => $suiteId,   'status' => 'cleaning'],
            ['room_number' => '304', 'room_type_id' => $suiteId,   'status' => 'available'],
            ['room_number' => '305', 'room_type_id' => $suiteId,   'status' => 'reserved'],

            // Floor 4 (Presidential Suites)
            ['room_number' => '401', 'room_type_id' => $vipId,     'status' => 'available'],
            ['room_number' => '402', 'room_type_id' => $vipId,     'status' => 'occupied'],
            ['room_number' => '403', 'room_type_id' => $vipId,     'status' => 'available'],
            ['room_number' => '404', 'room_type_id' => $vipId,     'status' => 'maintenance'],
            ['room_number' => '405', 'room_type_id' => $vipId,     'status' => 'cleaning'],
        ];

        // Populate database
        foreach ($rooms as $data) {
            $data['image_url'] = $sampleImage;
            $data['cloudinary_id'] = $cloudinaryId;

            Rooms::firstOrCreate(['room_number' => $data['room_number']], $data);
        }
    }

    
    }

  
    



<?php

namespace Database\Seeders;

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
        if (Room_types::count() === 0) {
            Room_types::factory()->count(4)->create();
        }

        // 2. Seed 15 mock rooms distributed across those room types
        Rooms::factory()->count(15)->create();
    }
}

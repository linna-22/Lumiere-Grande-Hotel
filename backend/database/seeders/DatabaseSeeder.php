<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Room_types;
use App\Models\Rooms;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */

    public function run(): void
    {
        // Call your individual seeders here
        $this->call([
            RoomTypeSeeder::class,
            RoomSeeder::class,
            // Add any other seeders you have here (e.g., UserSeeder::class)
        ]);
    }
   
}

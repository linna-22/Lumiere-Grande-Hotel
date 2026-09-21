<?php

namespace Database\Seeders;

use App\Models\Room_types;
use App\Models\Rooms;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Pexels photo IDs of hotel rooms, grouped by room type.
     * Each room gets a random image from its type's pool; images are
     * shuffled first so rooms of the same type don't repeat a photo.
     */
    private const IMAGES = [
        'classic' => [237371, 28011238, 18801062, 36162677, 27638174],
        'deluxe'  => [33389169, 7745929, 34040619, 32021575, 28962539],
        'suite'   => [5860693, 4493299, 36767624, 31146633, 7746080],
        'vip'     => [7722164, 34496702, 36916378, 34496701, 14750394],
    ];

    private function imageUrl(int $photoId): string
    {
        return "https://images.pexels.com/photos/{$photoId}/pexels-photo-{$photoId}.jpeg?auto=compress&cs=tinysrgb&w=1200";
    }

    public function run(): void
    {
        $roomTypes = Room_types::all();

        if ($roomTypes->isEmpty()) {
            $this->command->error('Please run RoomTypeSeeder first!');
            return;
        }

        // Get IDs or fallback to first room type
        $typeIds = [
            'classic' => $roomTypes->where('name', 'Lumière Classic')->first()->id ?? $roomTypes->first()->id,
            'deluxe'  => $roomTypes->where('name', 'Deluxe Ocean View')->first()->id ?? $roomTypes->first()->id,
            'suite'   => $roomTypes->where('name', 'Executive Suite')->first()->id ?? $roomTypes->first()->id,
            'vip'     => $roomTypes->where('name', 'Presidential Suite')->first()->id ?? $roomTypes->first()->id,
        ];

        // 20 rooms: room_number => status, grouped by room type
        $roomsByType = [
            // Floor 1 (Classic Rooms)
            'classic' => [
                '101' => 'available',
                '102' => 'occupied',
                '103' => 'available',
                '104' => 'reserved',
                '105' => 'cleaning',
            ],
            // Floor 2 (Deluxe Rooms)
            'deluxe' => [
                '201' => 'available',
                '202' => 'occupied',
                '203' => 'available',
                '204' => 'maintenance',
                '205' => 'reserved',
            ],
            // Floor 3 (Executive Suites)
            'suite' => [
                '301' => 'available',
                '302' => 'occupied',
                '303' => 'cleaning',
                '304' => 'available',
                '305' => 'reserved',
            ],
            // Floor 4 (Presidential Suites)
            'vip' => [
                '401' => 'available',
                '402' => 'occupied',
                '403' => 'available',
                '404' => 'maintenance',
                '405' => 'cleaning',
            ],
        ];

        foreach ($roomsByType as $type => $rooms) {
            $pool = collect(self::IMAGES[$type])->shuffle()->values();
            $i = 0;

            foreach ($rooms as $roomNumber => $status) {
                $photoId = $pool[$i++ % $pool->count()];

                $room = Rooms::firstOrCreate(
                    ['room_number' => (string) $roomNumber],
                    [
                        'room_type_id'  => $typeIds[$type],
                        'status'        => $status,
                        'image_url'     => $this->imageUrl($photoId),
                        'cloudinary_id' => null, // external image, not stored on Cloudinary
                    ]
                );

                // Room already existed (e.g. seeded with the old sample image):
                // refresh only the image, leave status and other data untouched.
                if (! $room->wasRecentlyCreated) {
                    $room->update([
                        'image_url'     => $this->imageUrl($photoId),
                        'cloudinary_id' => null,
                    ]);
                }
            }
        }
    }
}
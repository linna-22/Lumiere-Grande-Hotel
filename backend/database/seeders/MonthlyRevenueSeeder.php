<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Guests;
use App\Models\Payments;
use App\Models\Reservation_rooms;
use App\Models\Reservations;
use App\Models\Room_types;
use App\Models\Rooms;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MonthlyRevenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Ensure Room Types Exist
        |--------------------------------------------------------------------------
        */

        $deluxe = Room_types::updateOrCreate(
            ['name' => 'Lumière Classic'],
            [
                'base_price' => 55.00,
            ]
        );

        $suite = Room_types::updateOrCreate(
            ['name' => 'Executive Suite'],
            [
                'base_price' => 150.00,
            ]
        );

        $standard = Room_types::updateOrCreate(
            ['name' => 'Presidential Suite'],
            [
                'base_price' => 300.00,
            ]
        );

        $standardDiamond = Room_types::updateOrCreate(
            ['name' => 'Demere Classic Diamond'],
            [
                'base_price' => 55.00,
            ]
        );

        $roomTypeIds = [
            $deluxe->id,
            $suite->id,
            $standard->id,
            $standardDiamond->id,
        ];

        /*
        |--------------------------------------------------------------------------
        | 2. Ensure Rooms Exist
        |--------------------------------------------------------------------------
        */

        for ($i = 101; $i <= 110; $i++) {
            $roomTypeId = $roomTypeIds[array_rand($roomTypeIds)];

            Rooms::updateOrCreate(
                [
                    'room_number' => (string) $i,
                ],
                [
                    'room_type_id' => $roomTypeId,
                    'status' => 'available',
                ]
            );
        }

        Rooms::whereNull('room_type_id')->update([
            'room_type_id' => $roomTypeIds[array_rand($roomTypeIds)],
        ]);

        $rooms = Rooms::with('roomType')->get();

        if ($rooms->isEmpty()) {
            $this->command->error('No rooms found. Seeder stopped.');

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Current Month
        |--------------------------------------------------------------------------
        */

        $startOfMonth = Carbon::now()->startOfMonth();

        $daysInMonth = Carbon::now()->daysInMonth;

        /*
        |--------------------------------------------------------------------------
        | 5. Ensure Guest Exists
        |--------------------------------------------------------------------------
        */

        $guest = Guests::firstOrCreate(
            ['email' => 'testguest@hotel.com'],
            [
                'first_name'  => 'Sample',
                'last_name'   => 'Guest',
                'phone'       => '+85586247757',
                'nationality' => 'Cambodia',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | 6. Generate Reservations & Payments
        |--------------------------------------------------------------------------
        */

        for ($i = 1; $i <= 20; $i++) {

            /*
            |--------------------------------------------------------------------------
            | Select Room
            |--------------------------------------------------------------------------
            */

            $room = $rooms->random();

            /*
            |--------------------------------------------------------------------------
            | Make Sure Room Has A Room Type
            |--------------------------------------------------------------------------
            */

            if (!$room->roomType) {
                $this->command->warn(
                    "Room {$room->room_number} does not have a valid room type. Skipping."
                );

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Room Pricing
            |--------------------------------------------------------------------------
            */

            $nightlyRate = (float) $room->roomType->base_price;

            if ($nightlyRate <= 0) {
                $this->command->warn(
                    "Room {$room->room_number} has an invalid nightly rate. Skipping."
                );

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Generate Dates
            |--------------------------------------------------------------------------
            */

            $checkIn = $startOfMonth
                ->copy()
                ->addDays(rand(0, max(0, $daysInMonth - 3)));

            $numberOfNights = rand(1, 3);

            $checkOut = $checkIn
                ->copy()
                ->addDays($numberOfNights);

            /*
            |--------------------------------------------------------------------------
            | Calculate Reservation Amount
            |--------------------------------------------------------------------------
            */

            $amount = $nightlyRate * $numberOfNights;

            /*
            |--------------------------------------------------------------------------
            | Create Reservation
            |--------------------------------------------------------------------------
            */

            $reservation = Reservations::create([
                'reservation_code' => 'RES-' . strtoupper(Str::random(6)),

                'guest_id' => $guest->id,

                'check_in_date' => $checkIn->toDateString(),

                'check_out_date' => $checkOut->toDateString(),

                'adults' => 2,

                'children' => 0,

                'total_amount' => $amount,

                'paid_amount' => $amount,

                'payment_status' => 'paid',

                'status' => 'checked_out',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Connect Reservation To Room
            |--------------------------------------------------------------------------
            */

            Reservation_rooms::create([
                'reservation_id'   => $reservation->id,
                'room_id'          => $room->id,
                'room_type_id'     => $room->room_type_id,
                'actual_check_in'  => $checkIn->toDateString(),
                'actual_check_out' => $checkOut->toDateString(),
                'nightly_rate'     => $amount,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create Payment
            |--------------------------------------------------------------------------
            |
            | invoice_id is set to null because this seeder does not create
            | invoice records.
            |
            */

            Payments::create([
                'reservation_id' => $reservation->id,
                'invoice_id'     => $i,
                'payment_date'   => $checkIn,
                'amount'         => $amount,
                'payment_method' => (rand(1, 10) <= 7) ? 'bakong_khqr' : 'cash',
                'payment_type'   => 'room_booking',
                'reference_no'   => 'INV-' . (1000 + $i),
                'bakong_hash'    => Str::random(32),
                'status'         => 'completed',
                'created_at'     => $checkIn,
                'updated_at'     => $checkIn,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 7. Seed Staff & Employee Profiles
        |--------------------------------------------------------------------------
        */

        $staffData = [
            ['name' => 'John Receptionist', 'first_name' => 'John',   'last_name' => 'Receptionist', 'email' => 'john.staff@hotel.com', 'role' => 'manager',      'position' => 'manager',      'salary' => 600.00],
            ['name' => 'Sophea Cleaner',    'first_name' => 'Sophea', 'last_name' => 'Cleaner',      'email' => 'sophea.staff@hotel.com',  'role' => 'receptionist', 'position' => 'receptionist', 'salary' => 450.00],
            ['name' => 'Dara Technician',   'first_name' => 'Dara',   'last_name' => 'Technician',   'email' => 'dara.staff@hotel.com',   'role' => 'cashier',      'position' => 'cashier',      'salary' => 550.00],
        ];

        foreach ($staffData as $data) {

            $user = User::firstOrCreate(
                [
                    'email' => $data['email'],
                ],
                [
                    'name' => $data['name'],
                    'password' => bcrypt('password'),
                    'role' => $data['role'],
                ]
            );

            $nameParts = explode(' ', $data['name'], 2);

            Employee::firstOrCreate(
                [
                    'first_name' => $data['first_name'],
                    'last_name'  => $data['last_name'],
                    'position'  => $data['position'],
                    'salary'    => $data['salary'],
                    'hire_date' => $startOfMonth->copy()->subMonths(6)->toDateString(),
                    'status'    => 'active',
                ]
            );
        }
        /*
        |--------------------------------------------------------------------------
        | Done
        |--------------------------------------------------------------------------
        */

        $this->command->info(
            'Monthly revenue seeder completed successfully.'
        );
    }
}
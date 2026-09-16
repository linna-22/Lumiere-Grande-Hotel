<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Expense;
use App\Models\Guests;
use App\Models\Payments;
use App\Models\Reservation_rooms;
use App\Models\Reservations;
use App\Models\Room_types;
use App\Models\Rooms;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MonthlyRevenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        // 1. Ensure Room Types exist first
        $deluxe = Room_types::firstOrCreate(
            ['name' => 'Lumière Classic'],
            ['base_price' => 55.00]
        );

        $suite = Room_types::firstOrCreate(
            ['name' => 'Executive Suite'],
            ['base_price' => 150.00]
        );

        $standard = Room_types::firstOrCreate(
            ['name' => 'Presidential Suite'],
            ['base_price' => 300.00]
        );

        $standardDiamond = Room_types::firstOrCreate(
            ['name' => 'Demere Classic Diamond'],
            ['base_price' => 55.00]
        );

        $roomTypeIds = [$deluxe->id, $suite->id, $standard->id, $standardDiamond->id];

        
        for ($i = 101; $i <= 110; $i++) {
            Rooms::firstOrCreate(
                ['room_number' => (string)$i],
                [
                    '' => $roomTypeIds[array_rand($roomTypeIds)],
                    'status'       => 'available',
                ]
            );
        }

        $rooms = Rooms::with('roomType')->get();
        $startOfMonth = Carbon::now()->startOfMonth();
        $daysInMonth  = Carbon::now()->daysInMonth;

        // 3. Generate Reservations & Payments

        $guest = Guests::firstOrCreate(
            ['email' => 'testguest@hotel.com'],
            [   
                'first_name'  => 'Sample',
                'last_name'   => 'Guest',
                'phone'       => '+85586247757',
                'nationality' => 'Cambodia',
            ]
        );

        for ($i = 1; $i <= 20; $i++) {
            $checkIn  = $startOfMonth->copy()->addDays(rand(0, $daysInMonth - 3));
            $checkOut = $checkIn->copy()->addDays(rand(1, 3));
            $room     = $rooms->random();
            $amount   = 100.00 * $checkIn->diffInDays($checkOut);

            // Create Reservation
            $reservation = Reservations::create([
                'reservation_code' => 'RES-' . strtoupper(Str::random(6)),
                'guest_id' => $guest->id,
                'check_in_date'    => $checkIn->toDateString(),
                'check_out_date'   => $checkOut->toDateString(),
                'adults'           => 2,
                'children'         => 0,
                'total_amount'     => $amount,
                'paid_amount'      => $amount,
                'payment_status'   => 'paid',
                'status'           => 'checked_out',
            ]);

            // Connect Room via Pivot Table
            Reservation_rooms::create([
                'reservation_id' => $reservation->id,
                'room_id'        => $room->id,
                'actual_check_in'  => $checkIn->toDateString(),
                'actual_check_out' => $checkOut->toDateString(),
                'nightly_rate'   => $amount,
            ]);

            // Create Payment record
            Payments::create([
                'reservation_id' => $reservation->id,
                'invoice_id'     => $i,
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

        // 4. Seed Operational Expenses across the month
        $categories = ['utilities', 'maintenance', 'supplies', 'marketing'];
        
        for ($e = 1; $e <= 8; $e++) {
            $expenseDate = $startOfMonth->copy()->addDays(rand(1, $daysInMonth - 1));
            Expense::create([
                'title'        => 'Operational Expense #' . $e,
                'category'     => $categories[array_rand($categories)],
                'amount'       => rand(100, 500) + (rand(0, 99) / 100),
                'expense_date' => $expenseDate->toDateString(),
                'notes'        => 'Seeded operational cost for analytics testing.',
            ]);
        }

        // 5. Seed Staff & Employee Profiles for Payroll Calculation
        $staffData = [
            ['name' => 'John Receptionist', 'email' => 'john.staff@hotel.com', 'position' => 'manager', 'salary' => 600.00],
            ['name' => 'Sophea Cleaner',     'email' => 'sophea.staff@hotel.com', 'position' => 'receptionist', 'salary' => 450.00],
            ['name' => 'Dara Technician',   'email' => 'dara.staff@hotel.com',   'position' => 'cashier',    'salary' => 550.00],
        ];

        foreach ($staffData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => bcrypt('password'),
                    'role'     => $data['role'],
                ]
            );

            Employee::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'position'  => $data['position'],
                    'salary'    => $data['salary'],
                    'hire_date' => $startOfMonth->copy()->subMonths(6)->toDateString(),
                    'status'    => 'active',
                ]
            );
        }
    }
}

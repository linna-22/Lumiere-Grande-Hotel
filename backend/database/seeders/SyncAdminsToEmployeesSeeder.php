<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SyncAdminsToEmployeesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            // Split full name into first and last name if needed
            $names = explode(' ', $user->name, 2);
            $firstName = $names[0] ?? $user->name;
            $lastName = $names[1] ?? '';
         

            Employee::firstOrCreate(
                ['user_id' => $user->id], // Prevents creating duplicates if already synced
                [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
             
                    'status'     => 'active',
                    'hire_date'   => now(),
                ]
            );
        }

        $this->command->info('Users successfully synced to the employees table!');
    }
    }


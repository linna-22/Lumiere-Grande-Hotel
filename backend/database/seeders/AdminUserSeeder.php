<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'linaoeu567556@gmail.com',
            ],
            [
                'name' => 'Lina Oeu',
                'password' => Hash::make('lina@123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $this->command->info(
            'Admin user created/updated successfully.'
        );
    }
}
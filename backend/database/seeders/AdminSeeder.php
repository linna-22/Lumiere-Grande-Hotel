<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::unguarded(function () {
            User::updateOrCreate(
                ['email' => 'linaoeu567556@gmail.com'],
                [
                    'name'              => 'Lina Oeu',
                    'password'          => Hash::make('lina@123'),
                    'email_verified_at' => now(),
                    'is_2fa_enabled'    => true,
                    'role'              => 'admin',
                    'status'            => 'active',
                ]
            );
        });
    }
}
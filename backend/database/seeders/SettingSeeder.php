<?php

namespace Database\Seeders;

use App\Models\Settings;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            // General / Hotel Info
            ['key' => 'hotel_name', 'value' => 'Lumora Grende Hotel', 'group' => 'general'],
            ['key' => 'hotel_category', 'value' => '5-Star Luxury', 'group' => 'general'],
            ['key' => 'hotel_phone', 'value' => '+855 12 345 678', 'group' => 'general'],
            ['key' => 'hotel_email', 'value' => 'lumorahotel@gmail.com', 'group' => 'general'],
            ['key' => 'hotel_address', 'value' => 'Toul Kork, PhnomPenh', 'group' => 'general'],
            ['key' => 'check_in_time', 'value' => '14:00', 'group' => 'general'],
            ['key' => 'check_out_time', 'value' => '12:00', 'group' => 'general'],
            ['key' => 'currency_code', 'value' => 'USD', 'group' => 'general'],
            ['key' => 'tax_rate_percentage', 'value' => '10', 'group' => 'general'],
            ['key' => 'hotel_description', 'value' => 'A premier 5-star luxury hotel nestled in the heart of Dasmariñas.', 'group' => 'general'],

            // Theme
            ['key' => 'dark_mode_default', 'value' => 'true', 'group' => 'theme'],
            ['key' => 'primary_color', 'value' => '#EAB308', 'group' => 'theme'],

            // Security
            ['key' => 'enforce_2fa_staff', 'value' => 'true', 'group' => 'security'],
            ['key' => 'session_timeout_minutes', 'value' => '60', 'group' => 'security'],
        ];

        foreach ($defaults as $setting) {
            Settings::setByKey($setting['key'], $setting['value'], $setting['group']);
        }
    }

    }


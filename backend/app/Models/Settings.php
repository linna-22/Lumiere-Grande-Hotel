<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Settings extends Model
{
   protected $fillable = [
    'key',
    'value',
    'group'
   ];

   public static function getByKey(string $key, $default = null) {

    return Cache::rememberForever("setting_{$key}", function() use ($key, $default){

        $setting = self::where('key', $key)->first();

        return $setting ? $setting->value : $default;

    });

   }

   public static function setByKey(string $key, $value, string $group = 'general') : void 
   {

    self::updateOrCreate(
        [
            'key' => $key
        ],
        [
            'value' => $value, 'group' => $group
        ]
    );

    Cache::forget("sttings_{$key}");

   }

    
}

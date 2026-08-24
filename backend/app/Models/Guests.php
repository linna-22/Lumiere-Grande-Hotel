<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guests extends Model
{
    use HasFactory;

    protected $fillable = [

    'user_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'address',
    'identification_type',
    'identification_number',
    'nationality'
    ];

    public function user(): BelongsTo {

    return $this->belongsTo(User::class);


    }

    public function reservations(): HasMany {
        
        return $this->hasMany(Reservations::class);
    }
}

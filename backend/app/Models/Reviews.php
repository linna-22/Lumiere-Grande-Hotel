<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reviews extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'guest_id',
        'rating',
        'comment'
    ];

    public function reservation(): BelongsTo {

    return $this->belongsTo(Reservations::class);

    }

    public function guest(): BelongsTo {

    return $this->belongsTo(Guests::class);
    
    }
}

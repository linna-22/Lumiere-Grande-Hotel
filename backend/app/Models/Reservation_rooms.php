<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation_rooms extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'room_type_id',
        'room_id',
        'nightly_rate',
        'actual_check_in',
        'actual_check_out',
        'status'
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(
            Reservations::class,
            'reservation_id'
        );
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(
            Room_types::class,
            'room_type_id'
        );
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(
            Rooms::class,
            'room_id'
        );
    }
}
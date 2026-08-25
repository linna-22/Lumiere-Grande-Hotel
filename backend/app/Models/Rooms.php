<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rooms extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'room_type_id',
        'floor',
        'status',
        'description',
        'image_url',
        'cloudinary_id'
    ];

    public function roomType(): BelongsTo {

        return $this->belongsTo(Room_types::class, 'room_type_id');

    }

    public function reservationRooms(): HasMany {

    return $this->hasMany(Reservation_rooms::class);

    }

    public function houseKeepingTasks(): HasMany {

    return $this->hasMany(Housekeeping_tasks::class);
    
    }
}

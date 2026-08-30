<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

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

    // ================Search filter pagination block ===========

    public function scopeFilter(Builder $query, array $filter): Builder {

    $query->when($filter['search'] ?? null, function($q, $search) {
        $q->where('room_number', 'Like', '%' .$search . '%');
    });
    
    $query->when($filter['status'] ?? null, function ($q, $status) {

    if($status !== 'all'){

    $q->where('status', strtolower($status));

    }

    });

    $query->when($filter['room_type_id'] ?? null, function ($q, $typeId) {

    $q->where('room_type_id', $typeId);

    });

    $sort = $filter['sort'] ?? 'asc';
    
    $query->orderBy('room_number', $sort);

    return $query;
    }
}

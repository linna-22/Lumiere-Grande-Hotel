<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room_types extends Model
{
    use HasFactory;

    protected $fillable = [
        
        'name',
        'description',
        'capacity',
        'base_price',
        'max_occupancy',
        'status'
    ];

    public function rooms(): HasMany {

    return $this->hasMany(Rooms::class, 'room_type_id');
    }

    public function facilities(): BelongsToMany {

    return $this->belongsToMany(Facility::class, 'room_type_facilities', 'room_type_id', 'facility_id');
    
    }

    public function scopeFilter($query, array $filters){

    $query->when($filters['search'] ?? null, function($q, $search) {
       
    $q->when(function ($sub) use ($search) {

    $sub->where('name', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}");

    });

    });

    $query->when($filters['status'] ?? null, function($q, $status) {

    $q->when('status', $status);

    });

    $query->when($filters['capacity'] ?? null,  function($q, $capacity) {

    $q->where('capacity', '>=', $capacity);

    });

    }
}

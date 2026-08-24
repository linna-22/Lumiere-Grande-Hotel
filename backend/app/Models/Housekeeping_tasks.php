<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Housekeeping_tasks extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'assigned_to',
        'task_type',
        'status',
        'notes'
    ];

    public function room(): BelongsTo {

    return $this->belongsTo(Rooms::class);

    }

    public function houseKeeper(): BelongsTo {

    return $this->belongsTo(User::class, 'assigned_to');
    
    }
}

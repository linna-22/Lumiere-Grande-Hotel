<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [ 
        'user_id',
        'first_name',
        'last_name',
        'position',
        'salary',
        'hire_date',
        'status',
    ];

    public function getfullNameAttribute() :string {

        return "{$this->first_name} {$this->last_name}";
    }

    public function user() : BelongsTo {
        
        return $this->belongsTo(User::class);
    }
}

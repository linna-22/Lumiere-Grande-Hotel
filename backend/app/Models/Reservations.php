<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservations extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_id',
         'reservation_code',
         'check_in_date',
         'check_out_date',
         'adults',
         'children',
         'total_amount',
         'paid_amount',
         'payment_status',
         'status',
         'created_by'
    ];

    public function guest(): BelongsTo {

    return $this->belongsTo(Guests::class);

    }

    public function creator(): BelongsTo {

    return $this->belongsTo(User::class, 'created_by');

    }

    public function invoice(): HasOne {

        return $this->hasOne(Invoices::class);
    }

    public function payments(): HasMany {

    return $this->hasMany(Payments::class);
    }

    public function revivew(): HasOne {
        return $this->hasOne(Reviews::class);
    }
}

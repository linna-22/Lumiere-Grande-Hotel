<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoices extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'reservation_id',
        'guest_id',
        'invoice_date',
        'due_date',
        'sub_total',
        'tax',
        'total_amount',
        'status'
    ];

    public function reservation(): BelongsTo {
        return $this->belongsTo(Reservations::class);
    }

    public function guest(): BelongsTo {
        return $this->belongsTo(Guests::class);
    }

    public function items(): HasMany {
        return $this->hasMany(Invoice_items::class);
    }

    public function payments(): HasMany {
        
        return $this->hasMany(Payments::class);
    }


}

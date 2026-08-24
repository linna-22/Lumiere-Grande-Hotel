<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\CssSelector\XPath\Extension\FunctionExtension;

class Payments extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'reservation_id',
        'payment_date',
        'amount',
        'payment_method',
        'payment_type',
        'reference_no',
        'bakong_hash',
        'status'
    ];

    public function invoice(): BelongsTo {
        return $this->belongsTo(Invoices::class);
    }

    public function reservation(): BelongsTo {

    return $this->belongsTo(Reservations::class);
    }
}

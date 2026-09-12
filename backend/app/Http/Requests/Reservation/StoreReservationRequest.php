<?php

namespace App\Http\Requests\Reservation;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [


            'guest_id' => 'required_without:guest_details|nullable|exists:guests,id',
            'guest_details' => 'required_without:guest_id|nullable|array',
            'guest_details.first_name' => 'required_with:guest_details|string|max:100',
            'guest_details.last_name' => 'required_with:guest_details|string|max:100',
            'guest_details.email' => 'nullable|email|max:255',
            'guest_details.phone' => 'required_with:guest_details|string|max:30',
            'guest_details.id_type' => 'nullable|string|max:50',
            'guest_details.id_number' => 'nullable|string|max:50',
            'guest_details.nationality' => 'nullable|string|max:100',

            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',

            'rooms' => 'required|array|min:1',
            'rooms.*.room_type_id' => 'required|exists:room_types,id',
            'rooms.*.room_id' => 'nullable|exists:rooms,id',
            'rooms.*.nightly_rate' => 'required|numeric|min:0',

            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'payment_option' => 'nullable|string|in:deposit,full',
            'payment_method' => 'required_with:payment_option|string|in:bakong_khqr,credit_card,stripe',
        ];
    }
}

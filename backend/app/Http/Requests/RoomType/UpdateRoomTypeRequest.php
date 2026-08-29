<?php

namespace App\Http\Requests\RoomType;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomTypeRequest extends FormRequest
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
            
        'name' => 'sometimes | string | max:255',

        'description'=> 'nullable| string | max:255',

        'capacity' => 'sometimes| required | integer | min 1',

        'base_price' => 'sometimes | required | numberic | min 0',

        'max_occupancy' => 'sometimes | required | numberic min1',

        'status' => 'sometimes | required | string | in:active, inactive',

        'facilities_ids' => 'nullable|array',
        
        'facilities_ids*' => 'exists:facilities,id'
        
        
        ];
    }
}

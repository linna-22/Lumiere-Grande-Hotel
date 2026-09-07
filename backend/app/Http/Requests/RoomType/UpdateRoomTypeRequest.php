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
            
       'name' => 'sometimes|string|max:255',
        'description' => 'nullable|string|max:255',
        'capacity' => 'sometimes|integer|min:1',
        'base_price' => 'sometimes|numeric|min:0',
        
        // 1. Fixed typo: added missing pipe '|' between numeric and min:1
        'max_occupancy' => 'sometimes|numeric|min:1', 

        // 2. Fixed spaces in values: 'in:active,inactive' instead of 'in:active, inactive'
        'status' => 'sometimes|string|in:active,inactive',

        'facility_ids' => 'nullable|array',
        
        // 3. Fixed array wildcard notation and database table name
        // 'facility_ids.*' (dot added) and 'exists:facilities,id' (table name is usually facilities)
        'facility_ids.*' => 'exists:facilities,id',
        
        
        ];
    }
}

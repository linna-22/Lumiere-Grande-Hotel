<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
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
            
        'room_number' => 'required|string|max:50|unique:rooms,room_number',
        'room_type_id' => 'required|exists:room_types,id',
        'floor' => 'nullable|integer',
        'status' => 'required|string|in:available,occupied,dirty,maintenance',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ];
    }
}

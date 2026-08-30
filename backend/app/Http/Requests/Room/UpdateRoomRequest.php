<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
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


            $roomId = $this->route('id'),
    
            'room_number' => 'sometimes|required|string|max:50|unique:rooms,room_number,' . $roomId,
            'room_type_id' => 'sometimes|required|exists:room_types,id',
            'floor' => 'nullable|integer',
            'status' => 'sometimes|required|string|in:available,occupied,dirty,maintenance',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',


        ];
    }
}

<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;

class IndexRoomRequest extends FormRequest
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
            
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,available,occupied,reserved,cleaning,dirty,maintenance'],
            'room_type_id' => ['nullable', 'integer', 'exists:room_types,id'],
            'sort' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable','integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1']
        ];
    }
}

<?php

namespace App\Http\Requests\RoomType;

use Illuminate\Foundation\Http\FormRequest;

class IndexRoomTypeRequest extends FormRequest
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
            
            'search' => [
                'nullable',
                 'string', 
                 'max:255'
                 ],
            'name' => [
                'nullable', 
                'string',
                 'max:255'
                 ],
            'description' => [
                'nullable',
                 'string',
                  'max:155'
                ],
            'capacity' => [
                'nullable',
                'integer',
                'min:1',
                'max:5',
            ],
            'base_price' => ['nullable', 'integer' , 'min:50', 'max:250'],
            'max_occupancy' => ['nullable', 'integer', 'max:5'],
            'status' => ['nullable', 'string'],

            'sort' => ['nullable', 'string' , 'in:asc,desc'],
            'per_page' => ['nullable', 'string', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1']

        ];
    }
}

<?php

namespace App\Http\Requests\RoomType;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomTypeRequest extends FormRequest
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
           
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'capacity' => 'required|integer|min:1',
        'base_price'=>'required|numeric|min:0',
        'max_occupancy'=> 'required|integer|min:1',
        'status'=>'required|string|in:active,inactive',
        'facility_ids'=>'nullable|array',
        'facility_ids.*'=>'exists:facilities,id'

        ];
    }
}

// 'status' => $this->status,
            // 'facilities' => $this->whenLoaded('facilities', function () {
            //     return $this->facilities->map(function ($facility) {
            //         return [
            //             'id' => $facility->id,
            //             'name' => $facility->name,
            //             'icon' => $facility->icon,
            //         ];
            //     });
            // }),
            // 'created_at' => $this->created_at->toIso8601String(),
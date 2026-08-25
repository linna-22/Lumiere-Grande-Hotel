<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);

        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'floor' => $this->floor,
            'status' => $this->status,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

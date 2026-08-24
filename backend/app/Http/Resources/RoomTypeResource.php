<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);

       return [
        'id' => $this->id,
        'name' => $this->name,
        'description' => $this->description,
        'capacity' => $this->capacity,
        'base_price' => (float) $this-> base_price,
        'max_occupancy' => $this->max_occupancy,
        'status' => $this->status,
        'facilities' => $this-> whenLoaded('facilities', function() {
            return $this->facilities->map(function($facility) {
                return [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'icon' => $facility->icon
                ];
            });
        }),
        'create_at' => $this->created_at->toIso8601String(),
       ];
    
    }
}

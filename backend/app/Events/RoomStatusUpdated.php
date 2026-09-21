<?php

namespace App\Events;

use App\Models\Rooms;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoomStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public Rooms $room;

    public function __construct(Rooms $room)
    {
        //

        $this->room = $room;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('rooms-board'),
        ];
    }

    public function broadcastAs(): string {

        return 'room.updated';

    }

    public function broadcastWith(): array {

        return [
            'room_id' => $this->room->id,
            'room_number' => $this->room->room_number,
            'status' => $this->room->status,
            'updated_at' => $this->room->updated_at->toIso8601String(),
        ];
    }
}

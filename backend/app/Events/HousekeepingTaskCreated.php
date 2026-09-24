<?php

namespace App\Events;

use App\Models\Housekeeping_tasks;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HousekeepingTaskCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Housekeeping_tasks $task;

    public function __construct(Housekeeping_tasks $task)
    {
        $this->task = $task->loadMissing(['room', 'assignedUser']);
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('housekeeping-board'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'housekeeping.task.created';
    }

    public function broadcastWith(): array
    {
        return [
            'task' => [
                'id' => $this->task->id,
                'room_id' => $this->task->room_id,
                'assigned_to' => $this->task->assigned_to,
                'task_type' => $this->task->task_type,
                'status' => $this->task->status,
                'notes' => $this->task->notes,
                'created_at' => $this->task->created_at?->toIso8601String(),
                'room' => $this->task->room,
                'assigned_user' => $this->task->assignedUser,
            ],
        ];
    }
}

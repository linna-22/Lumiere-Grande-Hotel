<?php

namespace App\Http\Controllers\Api;

use App\Events\RoomStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Housekeeping_tasks;
use App\Models\Rooms;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HouseKeepingController extends Controller
{

    public function index(Request $request): JsonResponse
    {

        $query = Housekeeping_tasks::with(['room', 'assignedUser']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('assigned_to')) {

            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $tasks
        ]);
    }

    public function store(Request $request): JsonResponse
    {
 $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'assigned_to' => 'nullable|exists:users,id',
            'task_type' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Create housekeeping task
        $task = Housekeeping_tasks::create([
            'room_id' => $validated['room_id'],
            'assigned_to' => $validated['assigned_to'] ?? null,
            'task_type' => $validated['task_type'],
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Get the room
        $room = Rooms::findOrFail($validated['room_id']);

        // change room status
        $room->update([
            'status' => 'dirty',
        ]);

        // broadcast room status update through Reverb
        RoomStatusUpdated::dispatch($room);

        return response()->json([
            'status' => 'success',
            'message' => 'HouseKeeping task created',
            'data' => $task->load('room'),
        ], 201);
    }

    public function assignStaff(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $task = Housekeeping_tasks::findOrFail($id);
        $task->update([
            'assigned_to' => $validated['assigned_to'],
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Staff assigned successfully.',
            'data'    => $task->load(['room', 'assignedUser']),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
            'notes'  => 'nullable|string',
        ]);

        $task = Housekeeping_tasks::findOrFail($id);

        $task->update([
            'status' => $validated['status'],
            'notes'  => $validated['notes'] ?? $task->notes,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => "Task updated to {$validated['status']}.",
            'data'    => $task->load('room'),
        ]);
    }

    public function approveTask($id): JsonResponse
    {
        $task = Housekeeping_tasks::with('room')->findOrFail($id);

        if ($task->status !== 'completed') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only completed housekeeping tasks can be approved.',
            ], 422);
        }
        
        DB::transaction(function () use ($task) {
            // Update task status
            $task->update([
                'status' => 'inspected',
            ]);

            // Mark room as vacant_clean and broadcast
            if ($task->room) {
                $task->room->update(['status' => 'available']);

                DB::afterCommit(fn() => RoomStatusUpdated::dispatch($task->room));
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => "Room {$task->room->room_number} approved and released.",
            'data'    => $task->load('room'),
        ]);
    }
}

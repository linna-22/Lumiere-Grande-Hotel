<?php

namespace App\Http\Controllers\Api;

use App\Events\HousekeepingTaskCreated;
use App\Events\RoomStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Housekeeping_tasks;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HouseKeepingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Housekeeping_tasks::with(['room', 'assignedUser']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        $tasks = $query->latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $tasks,
        ]);
    }

    /**
     * Manual task creation remains available to admins/staff at any time.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'assigned_to' => 'nullable|exists:users,id',
            'task_type' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $task = DB::transaction(function () use ($validated) {
            $task = Housekeeping_tasks::create([
                'room_id' => $validated['room_id'],
                'assigned_to' => $validated['assigned_to'] ?? null,
                'task_type' => $validated['task_type'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            $task->load(['room', 'assignedUser']);

            DB::afterCommit(function () use ($task) {
                HousekeepingTaskCreated::dispatch($task);
            });

            return $task;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Housekeeping task created.',
            'data' => $task,
        ], 201);
    }

    public function assignStaff(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task = Housekeeping_tasks::findOrFail($id);

        $task->update([
            'assigned_to' => $validated['assigned_to'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Staff assigned successfully.',
            'data' => $task->load(['room', 'assignedUser']),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
            'notes' => 'nullable|string',
        ]);

        $task = Housekeeping_tasks::findOrFail($id);

        $task->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $task->notes,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Task updated to {$validated['status']}.",
            'data' => $task->load('room'),
        ]);
    }

    public function approveTask($id): JsonResponse
    {
        $task = Housekeeping_tasks::with('room')->findOrFail($id);

        if ($task->status !== 'completed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only completed housekeeping tasks can be approved.',
            ], 422);
        }

        DB::transaction(function () use ($task) {
            $task->update([
                'status' => 'inspected',
            ]);

            if ($task->room) {
                $task->room->update([
                    'status' => 'available',
                ]);

                DB::afterCommit(fn () => RoomStatusUpdated::dispatch($task->room->fresh()));
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => "Room {$task->room->room_number} approved and released.",
            'data' => $task->load('room'),
        ]);
    }
}

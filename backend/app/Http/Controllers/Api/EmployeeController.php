<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Policies\EmployeePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $query = Employee::with('user:id,name,email,role');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'status' => 'success',
            'data'   => $query->latest()->paginate($request->input('per_page', 15)),
        ]);
    }

    public function show(Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        return response()->json([
            'status' => 'success',
            'data'   => $employee->load('user:id,name,email,role'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Employee::class);

        $validated = $request->validate([
            'first_name'     => ['required', 'string', 'max:255'],
            'last_name'      => ['required', 'string', 'max:255'],
            'position'       => ['required', 'string', 'max:255'],
            'salary'         => ['required', 'numeric', 'min:0'],
            'hire_date'      => ['required', 'date'],
            'create_account' => ['boolean'],
            'email'          => ['nullable', 'required_if:create_account,true', 'email', 'max:255', 'unique:users,email'],
            'password'       => ['nullable', 'required_if:create_account,true', 'string', 'min:8'],
            'role'           => ['nullable', 'required_if:create_account,true', Rule::in(['admin', 'manager', 'receptionist', 'housekeeper', 'staff'])],
        ]);

        // Guard against assigning higher or equal rank unless Super Admin / Owner
        if ($request->boolean('create_account')) {
            $policy = new EmployeePolicy();
            $callerRank = $policy->getRoleRank($request->user()->role);
            $targetRank = $policy->getRoleRank($validated['role']);

            if ($targetRank >= $callerRank && !in_array($request->user()->role, ['super_admin', 'owner'], true)) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'You cannot assign a role equal to or higher than your own rank.'
                ], 403);
            }
        }

        $employee = DB::transaction(function () use ($request, $validated) {
            $userId = null;

            if ($request->boolean('create_account')) {
                $user = User::create([
                    'name'     => "{$validated['first_name']} {$validated['last_name']}",
                    'email'    => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role'     => $validated['role'] ?? 'staff',
                ]);
                $userId = $user->id;
            }

            return Employee::create([
                'user_id'    => $userId,
                'first_name' => $validated['first_name'],
                'last_name'  => $validated['last_name'],
                'position'   => $validated['position'],
                'salary'     => $validated['salary'],
                'hire_date'  => $validated['hire_date'],
                'status'     => 'active',
            ]);
        });

        return response()->json([
            'status'   => 'success',
            'message'  => 'Employee added successfully',
            'employee' => $employee->load('user:id,name,email,role'),
        ], 201);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'position'   => ['required', 'string', 'max:255'],
            'salary'     => ['required', 'numeric', 'min:0'],
            'hire_date'  => ['required', 'date'],
            'status'     => ['required', Rule::in(['active', 'inactive', 'on_leave'])],
        ]);

        $employee->update($validated);

        return response()->json([
            'status'   => 'success',
            'message'  => 'Employee updated successfully',
            'employee' => $employee->load('user:id,name,email,role'),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        // 1. Authorize action against EmployeePolicy@delete
        $this->authorize('delete', $employee);

        // 2. Extra fail-safe: Prevent self-deletion if policy is bypassed
        if ($employee->user_id && (int) auth()->id() === (int) $employee->user_id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You cannot delete or deactivate your own account.'
            ], 403);
        }

        DB::transaction(function () use ($employee) {
            // 3. Deactivate the linked user account to preserve audit logs and revoke access
            if ($employee->user) {
                $employee->user->update([
                    'status' => 'inactive',
                ]);
            }

            // 4. Delete the employee record
            $employee->delete();
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Employee deleted and associated user account deactivated successfully.',
        ]);
    }
}

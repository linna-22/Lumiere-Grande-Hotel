<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    
public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $request->user()->load('guest')
        ], 200);
    }

   
    public function changePassword(Request $request): JsonResponse // ✅ Fixed typo: changePassword
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers()->symbols()
            ],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password does not match'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ], 200);
    }

  
    public function index(Request $request): JsonResponse
    {
        $query = User::with('guest');

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->paginate(15), 200);
    }

   
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
           
            'role'     => ['required', Rule::in(['admin', 'super_admin', 'manager', 'cashier', 'receptionist', 'customer'])],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        return response()->json([
            'message' => 'User account created successfully',
            'data'    => $user
        ], 201);
    }

   
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $user->load('guest')
        ], 200);
    }

    
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
           
            'role'     => ['sometimes', Rule::in(['admin', 'super_admin', 'manager', 'cashier', 'receptionist', 'customer'])],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        if (isset($validated['email'])) {
            $validated['email'] = strtolower($validated['email']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User account updated successfully.',
            'data'    => $user
        ], 200);
    }

  
    public function destroy(User $user): JsonResponse
    {
        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Action denied. You cannot delete your own active account.'
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully.'
        ], 200);
    }
}

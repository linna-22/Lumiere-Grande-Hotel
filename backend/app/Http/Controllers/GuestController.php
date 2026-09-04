<?php

namespace App\Http\Controllers;

use App\Models\Guest; // Fixed: Singular model convention
use App\Models\Guests;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function showProfile(Request $request)
    {
        $guest = $request->user()->guest;

        if (!$guest) {
            return response()->json(['message' => 'Guest profile not found.'], 404);
        }

        return response()->json(['data' => $guest], 200);
    }

    public function updateProfile(Request $request)
    {
        $guest = $request->user()->guest;

        if (!$guest) {
            return response()->json(['message' => 'Guest profile not found.'], 404);
        }

        $validated = $request->validate([
            'first_name'  => 'sometimes|string|max:100',
            'last_name'   => 'sometimes|string|max:100',
            'phone'       => 'sometimes|string|max:20',
            'address'     => 'nullable|string',
            'id_type'     => 'nullable|string|max:50',
            'id_number'   => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
        ]);

        $guest->update($validated);

        return response()->json([
            'message' => 'Guest profile updated successfully.',
            'data'    => $guest
        ], 200);
    }

    public function index(Request $request)
    {
        $query = Guests::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Fixed: Executed pagination and added return statement
        $guests = $query->latest()->paginate(15);

        return response()->json($guests, 200);
    }

    public function storeWalkin(Request $request)
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|max:100',
            'last_name'   => 'required|string|max:100',
            'email'       => 'nullable|email|unique:guests,email',
            'phone'       => 'required|string|max:20',
            'address'     => 'nullable|string',
            'id_type'     => 'nullable|string|max:50',
            'id_number'   => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
        ]);

        $guest = Guests::create(array_merge($validated, ['user_id' => null]));

        return response()->json([
            'message' => 'Walk-in guest created successfully.',
            'data'    => $guest
        ], 201);
    }

    public function show($id)
    {
        $guest = Guests::with('bookings.room')->find($id);

        if (!$guest) {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        return response()->json(['data' => $guest], 200);
    }
}
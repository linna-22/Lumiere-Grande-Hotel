<?php

namespace App\Http\Controllers\Api;

use App\Exports\GuestsExport;
use App\Http\Controllers\Controller;
use App\Models\Guest; // Fixed: Singular model convention
use App\Models\Guests;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class GuestController extends Controller
{

    public function exportExcel(){

    try{

    
    $fileName = 'lumiere_hotel_guests_' . now()->format('Y_m_d_His') . '.xlsx';

    return Excel::download(new GuestsExport, $fileName);

    }catch(\Exception $e){

    return response()->json([
        'message' => 'Error' .$e,

    ], 500);
    }


    }
    public function showProfile(Request $request)
    {
        $guest = $request->user()->guest;

        if (!$guest) {
            return response()->json(['message' => 'Guest profile not found.'], 404);
        }

        return response()->json(['data' => $guest->load('user')], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $guest = $request->$user->guest;

        if (!$guest) {
            return response()->json(['message' => 'Guest profile not found.'], 404);
        }

        $validated = $request->validate([
            'first_name'  => 'sometimes|string|max:100',
            'last_name'   => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email|max:255',
            'phone'       => 'sometimes|string|max:20',
            'address'     => 'nullable|string',
            'indentification_type'     => 'nullable|string|max:155',
            'indentification_number'   => 'nullable|string|max:155',
            'nationality' => 'nullable|string|max:50',
        ]);

        $guest->update($validated);

        if(isset($validated['first_name']) || isset($validated['last_name'])) {

        $user->update([
            'name' => trim(($validated['first_name'] ?? $guest->first_name). ' ' .($validated['last_name'] ?? $guest->last_name))
        ]);

        }

        return response()->json([
            'message' => 'Guest profile updated successfully.',
            'data'    => $guest
        ], 200);
    }

    public function index(Request $request)
    {
        $query = Guests::with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {

                  $uq->where('email', 'like', "%{$search}");

                  });
            });
        }

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
            'indentification_type'     => 'nullable|string|max:155',
            'identification_number'   => 'nullable|string|max:155',
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
        $guest = Guests::with('user', 'bookings.room')->find($id);

        if (!$guest) {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        return response()->json(['data' => $guest], 200);
    }
}
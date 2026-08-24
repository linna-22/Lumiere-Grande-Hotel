<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomType\StoreRoomTypeRequest;
use App\Http\Requests\RoomType\UpdateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use App\Models\Room_types;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class RoomTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        

        $roomTypes = Room_types::with('facilities')->latest()->get();
        return RoomTypeResource::collection($roomTypes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoomTypeRequest $request): JsonResponse
    {
        
        $roomTypes = Room_types::create($request->validated());

        if($request->has('facility_ids')){

        $roomTypes->facilities()->sync($request->facility_ids);
        }

        return response()->json([
            'message' => 'Room Type Create Successfully',
            'data' => new RoomTypeResource($roomTypes->load('facilities'))
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Room_types $roomTypes): RoomTypeResource
    {
        

        return new RoomTypeResource($roomTypes->load('facilities'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomTypeRequest $request, Room_types $roomTypes): JsonResponse
    {
        

        $roomTypes->update($request->validated());

        if($request->has('facilitiy_ids')) {

        $roomTypes->facilities()->sync($request->facility_ids);


        }

        return response()->json([

        'message' => "Room Type Update successfully",
        'data' => new RoomTypeResource($roomTypes->load('facilities'))
        ], 200);

        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room_types $roomTypes): JsonResponse
    {
        $roomTypes->delete();

        return response()->json([
            'message' => 'Room Type deleted successfully'
        ], 200);
    }
}

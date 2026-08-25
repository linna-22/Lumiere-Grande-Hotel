<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Rooms;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary; 
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    $rooms = Rooms::with('roomType.facilities')->latest()->get();

    return RoomResource::collection($rooms);

    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $data = $request->validated();

        if($request->hasFile('image')){

        $uploadedFile = $request->file('image')->storeOnCloudinary('hotel/rooms');
        $data['image_url'] = $uploadedFile->getSecurePath();
        $data['cloudinary_id'] = $uploadedFile->getPublicId();

        }

        $room = Rooms::create($data);

        return response()->json([
            'message' => "Room create successfully",
            'data' => new RoomResource($room->load('roomType.facilities'))
        ], 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(Rooms $room): RoomResource
    {
        return new RoomResource($room->load('roomType.facilities'));
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomRequest $request, Rooms $room): JsonResponse
    {
        $data = $request->validated();

        if($request->hasfile('image')){

        if($room->cloudinary_id) {

            Cloudinary::destroy($room->cloudinary_id);

        }

        $uploadedFile = $request->file('image')->storeOnCloudinary('hotel/rooms');
        $data['image_url'] = $uploadedFile->getSecurePath();
        $data['cloudinary_id'] = $uploadedFile->getPublicId();
        }

        $room->update($data);

        return response()->json([
            'message' => 'Room updated successfully',
            'data' => new RoomResource($room->load('roomType.facilities'))
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rooms $room): JsonResponse
    {
        if($room->cloudinary_id){

            Cloudinary::destroy($room->cloudinary_id);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ], 200);
    }
}

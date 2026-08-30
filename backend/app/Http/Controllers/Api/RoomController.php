<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Room\IndexRoomRequest;
use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Models\Rooms;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexRoomRequest $request) :JsonResponse
    {

    $filter = $request->validated();

    $count = Rooms::select('status', DB::raw('count(*) as count')) -> groupBy('status')->pluck('count', 'status')->toArray();

    $summary = [
        'total' => Rooms::count(),
        'available' => $count['available'] ?? 0,
        'occupied' => $count['occupied'] ?? 0,
        'reserved' => $count['reserved'] ?? 0,
        'cleaning' => $count['cleaning'] ?? $count['dirty'] ??0,
        'maintenance' => $count['maintenance'] ?? 0
    ];

    $room = Rooms::with('roomType.facilities')->filter($filter)->paginate($filter['per_page'] ?? 8);
      // return RoomResource::collection($rooms);
    return response()->json([
        'summary' => $summary,
        'data' => RoomResource::collection($room)->response()->getData()->data,
        'meta' => [
            'curren_page' => $room->currentPage(),
            'last_page' => $room->lastPage(),
            'per_page' => $room->perPage(),
            'total' => $room->total()
        ]
    ]);
    // $rooms = Rooms::with('roomType.facilities')->latest()->get();

  

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
    public function show(string $id): JsonResponse
    {
        
        $room = Rooms::with('roomType.facilities')->findOrFail($id);

        return response()->json([
            
        'data' => new RoomResource($room)
        
        ], 200);


        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomRequest $request, string $id): JsonResponse
    {

    try{

    $room = Rooms::findOrFail($id);

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

    }catch(ModelNotFoundException $e){

    return response()->json([
        'message' => 'Room not found',
        'data' => null,
    ], 404);
       
    }  catch(Exception $e){

    return response()->json([

    'message' => 'fail to update room',
    'error' => $e->getMessage()
    ], 500);
    }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {

    try{

    $room = Rooms::findOrFail($id);
    
        if($room->cloudinary_id){

            Cloudinary::destroy($room->cloudinary_id);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ], 200);

    }catch(ModelNotFoundException $e){

    return response()->json([
        'message' => 'Room not found',
        'data' => null,

    ], 404);

    }catch(Exception $e){

    return response()->json([
        'message' => 'Failed to delete room',
        'error' => $e->getMessage(),
        'data' => null,
    ], 500);
    }
    }
}

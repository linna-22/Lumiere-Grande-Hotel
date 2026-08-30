<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomType\IndexRoomTypeRequest;
use App\Http\Requests\RoomType\StoreRoomTypeRequest;
use App\Http\Requests\RoomType\UpdateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use App\Models\Facility;
use App\Models\Room_types;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\JsonResponse;

class RoomTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    
    public function index(IndexRoomTypeRequest $request) : JsonResponse
    {
        $filter = $request->validated();

        $count = Room_types::select('status', DB::raw('count(*) as count')) -> groupBy('status')->pluck('count', 'status')->toArray();

        $summary = [

            'total' => Room_types::count(),
            'active' => $count['active'] ?? 0,
            'inactive' => $count['inactive'] ?? 0,

        ];

        $roomTypes = Room_types::with('facilities')-> filter($filter)->paginate($filter['per_page'] ?? 8);

        return response() -> json([

            'summary' => $summary,
            'data' => RoomTypeResource::collection($roomTypes) ,
            'meta' => [
            'current_page' => $roomTypes->currentPage(),
            'last_page' => $roomTypes->lastPage(),
            'per_page' => $roomTypes->perPage(),
            'total' => $roomTypes->total()
        ]

        ], 200);

        // $roomTypes = Room_types::with('facilities')->latest()->get();
        // return RoomTypeResource::collection($roomTypes);
    }

    /**
     * Store a newly created resource   storage.
     */
    public function store(StoreRoomTypeRequest $request): JsonResponse
    {
        
        $roomTypes = Room_types::create($request->validated());

        if($request->filled('facilities')){

        $facilityNames = array_map('trim', explode(',', $request->facilities));

        $facilityIds = [];

        foreach($facilityNames as $name){

            if(!empty($name)) {

            $facility = Facility::firstOrCreate(['name' => $name]);
            
            $facilityIds[] = $facility->id;

            }
         }
        }

        $roomTypes->facilities()->sync($request->facility_ids);
        return response()->json([
            'message' => 'Room Type Create Successfully',
            'data' => new RoomTypeResource($roomTypes->load('facilities'))
        ], 201);

        // if($request->has('facility_ids')){

        // }

    }


    /**
     * Display the specified resource.
     */
    public function show(Room_types $room_type): JsonResponse
    {
        
        dd($room_type->toArray());

        return response()->json([

            'data' => new RoomTypeResource($room_type->load('facilities'))

        ], 200);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomTypeRequest $request, Room_types $room_types): JsonResponse
    {
        

        $room_types->update($request->validated());

        if($request->has('facility_ids')) {

        $room_types->facilities()->sync($request->facility_ids);


        }

        return response()->json([

        'message' => "Room Type Update successfully",
        'data' => new RoomTypeResource($room_types->load('facilities'))
        ], 200);

        
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room_types $roomTypes): JsonResponse
    {   
        $roomTypes->facilities()->delete();
        $roomTypes->delete();

        return response()->json([
            'message' => 'Room Type deleted successfully'
        ], 200);
    }
}

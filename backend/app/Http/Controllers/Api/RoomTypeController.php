<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoomType\IndexRoomTypeRequest;
use App\Http\Requests\RoomType\StoreRoomTypeRequest;
use App\Http\Requests\RoomType\UpdateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
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

        $roomTypes = Room_types::with('facilities')->filter($filter)->paginate($filter['per_page'] ?? 8);

        return response() -> json([

            'summary' => $summary,
            'data' => RoomTypeResource::collection($roomTypes)->response()->getData()->data,
            'meta' => [
            'curren_page' => $roomTypes->currentPage(),
            'last_page' => $roomTypes->lastPage(),
            'per_page' => $roomTypes->perPage(),
            'total' => $roomTypes->total()
        ]

        ]);

        // $roomTypes = Room_types::with('facilities')->latest()->get();
        // return RoomTypeResource::collection($roomTypes);
    }

    /**
     * Store a newly created resource   storage.
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

        if($request->has('facility_ids')) {

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

after finish Reuqest Store toom 
next step update room 

then Rescoure 

'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'sometimes|required|integer|min:1',
            'base_price' => 'sometimes|required|numeric|min:0',
            'max_occupancy' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|string|in:active,inactive',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'exists:facilities,id',



            <!-- Api trnastrom -->
            class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'capacity' => $this->capacity,
            'base_price' => (float) $this->base_price,
            'max_occupancy' => $this->max_occupancy,
            'status' => $this->status,
            'facilities' => $this->whenLoaded('facilities', function () {
                return $this->facilities->map(function ($facility) {
                    return [
                        'id' => $facility->id,
                        'name' => $facility->name,
                        'icon' => $facility->icon,
                    ];
                });
            }),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

<!-- cntroller  -->

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Http\Requests\RoomType\StoreRoomTypeRequest;
use App\Http\Requests\RoomType\UpdateRoomTypeRequest;
use App\Http\Resources\RoomTypeResource;
use Illuminate\Http\JsonResponse;

class RoomTypeController extends Controller
{
    // GET /api/room-types
    public function index()
    {
        $roomTypes = RoomType::with('facilities')->latest()->get();
        return RoomTypeResource::collection($roomTypes);
    }

    // POST /api/room-types
    public function store(StoreRoomTypeRequest $request): JsonResponse
    {
        $roomType = RoomType::create($request->validated());

        if ($request->has('facility_ids')) {
            $roomType->facilities()->sync($request->facility_ids);
        }

        return response()->json([
            'message' => 'Room type created successfully',
            'data' => new RoomTypeResource($roomType->load('facilities'))
        ], 201);
    }

    // GET /api/room-types/{roomType}
    public function show(RoomType $roomType): RoomTypeResource
    {
        return new RoomTypeResource($roomType->load('facilities'));
    }

    // PUT/PATCH /api/room-types/{roomType}
    public function update(UpdateRoomTypeRequest $request, RoomType $roomType): JsonResponse
    {
        $roomType->update($request->validated());

        if ($request->has('facility_ids')) {
            $roomType->facilities()->sync($request->facility_ids);
        }

        return response()->json([
            'message' => 'Room type updated successfully',
            'data' => new RoomTypeResource($roomType->load('facilities'))
        ], 200);
    }

    // DELETE /api/room-types/{roomType}
    public function destroy(RoomType $roomType): JsonResponse
    {
        $roomType->delete();

        return response()->json([
            'message' => 'Room type deleted successfully'
        ], 200);
    }
}

then route
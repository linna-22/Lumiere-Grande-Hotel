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

<!-- ===============OTP loign=============  -->

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AuthController extends Controller
{
    // 1. REGISTER USER
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'nullable|string', // Optional based on your table
        ]);

        $user = User::create([
            'name'     => $fields['name'],
            'email'    => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role'     => $fields['role'] ?? 'user',
            'status'   => 'active',
        ]);

        // Option A: Automatically send OTP upon registration
        // $this->sendOtp(new Request(['email' => $user->email]));

        // Option B: Return token directly
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'       => true,
            'message'      => 'User registered successfully.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 201);
    }

    // 2. SEND OTP (For Login)
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (isset($user->status) && $user->status !== 'active') {
             return response()->json(['status' => false, 'message' => 'Account is inactive.'], 403);
        }

        $otp = rand(100000, 999999);

        $user->update([
            'otp'            => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(5),
        ]);

        // TODO: Send OTP via Email / SMS here

        return response()->json([
            'status'    => true,
            'message'   => 'OTP sent successfully.',
            'debug_otp' => $otp // Remove in production!
        ], 200);
    }

    // 3. VERIFY OTP & LOGIN
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|numeric',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user->otp || $user->otp !== $request->otp) {
            return response()->json(['status' => false, 'message' => 'Invalid OTP.'], 400);
        }

        if (Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['status' => false, 'message' => 'OTP has expired.'], 400);
        }

        // Clear OTP fields
        $user->update([
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        // Issue new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'       => true,
            'message'      => 'Login successful.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 200);
    }

    // 4. LOGOUT (Revoke Token)
    public function logout(Request $request)
    {   
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Successfully logged out.',
        ], 200);
    }
}
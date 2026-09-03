<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    //

    public function register(Request $request){

    try{

     $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users',
        'password' => 'required|string:min:8|confirmed',
    ]);

    $users = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'customer',
        'status' => 'active',
        'provider' => 'local',
        'prodvider_id' => null,
        'avatar' => null,
        'is_2fa_enabled' => false

    ]);

    $token = $users->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => "user account create successfully",
        'token_type' => 'Bearer',
        'user' => $users
    ], 200);

    }catch(Exception $e){

    return response()->json([
        'message' => 'failed to create user',
        'error' => $e->getMessage()
    ], 500);

    }

    }
    

    public function login(Request $request){

    $credentials = $request -> validated([
        'email' => 'required|email',
        'password' => 'required|string'
    ]);

    $users = User::where('email', strtolower($credentials['email']))->first();

    if(!$users || !Hash::check($credentials['password'], $users->password)) {

    return response()->json(['message' => "Inccorect email or password"], 401);

    }

     if($users->status !== 'active'){

    return response()->json(['message' => "Your account have been suspence"], 403);

    }

    $staffRoles = ['super_admin','admin', 'cashire', 'manager'];

    $requiredOtp = in_array($users->role, $staffRoles) || $users->is_2fa_enables;

    if($requiredOtp){

    $otpCode = random_int(100000, 999999);

    Cache::put("otp_{$users->id}", $otpCode, now()->addMinutes(3));

    Mail::to($users->email)->send(new SendOtpMail($otpCode));
   
    return response()->json([
        'requires_2fa' => true,
        'user_id' => $users->id,
        'message' => "Your account have to verify code",
        'dev_otp' => $otpCode
    ], 200);



    }

    $token = $users->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => "login success",
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $users
    ], 200);

    }

    public function verifyOtp(Request $request){

       $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp_code' => 'required|numeric'
        ]);

        $cachedOtp = Cache::get("otp_{$validated['user_id']}");

        if(!$cachedOtp || $cachedOtp != $validated['otp_code']){

        return response()->json([
            'message' => "Invaild otp code",
        ], 422);


        }

        Cache::forget("otp_{$validated['user_id']}");

        $users = User::findOrFail($validated['user_id']);

        $token = $users->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'otp verify success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $users
        ], 200);

    }
    
    public function redirectGoogle(){

    // return Socialite::driver('google')->stateless()->redirect();

    /** @var \Laravel\Socialite\Two\AbstractProvider $driver */

    $driver = Socialite::driver('google');

    return $driver->stateless()->redirect();

    }
 
    public function GoogleCallback(Request $request)
{

    $frontendurl = env('FRONTEND_URL', 'http://localhost:3000');


    try {
        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver('google');

        $googleUser = $driver->stateless()->user();

     
        $user = User::where('email', strtolower($googleUser->getEmail()))->first();

        if ($user) {

            if ($user->status !== 'active') {
                return response()->json([
                    'message' => 'Your account has been suspended.',
                ], 403);
            }

          
            if (!$user->provider_id) {
                $user->update([
                    'provider'    => 'google',
                    'provider_id' => $googleUser->getId(),
                    'avatar'      => $user->avatar ?? $googleUser->getAvatar(),
                ]);
            }
        } else {
          
            $user = User::create([
                'name'        => $googleUser->getName(),
                'email'       => strtolower($googleUser->getEmail()),
                'provider'    => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar'      => $googleUser->getAvatar(),
                'role'        => 'customer',
                'status'      => 'active',
            ]);
        }

       
        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect()->away("{$frontendurl}/auth/callback?token={$token}&user_id={$user->id}");

        // return response()->json([
        //     'message'      => 'Google authentication successful',
        //     'access_token' => $token,
        //     'token_type'   => 'Bearer',
        //     'user'         => $user,
        // ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to authenticate with Google',
            'error'   => $e->getMessage(),
        ], 500);
    }
}
    

}

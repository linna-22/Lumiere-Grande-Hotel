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
use App\Models\Guests;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    //

    private function ensureGuestProfileExists(User $user): void
    {

        if ($user->role === 'customer' && !$user->guest) {

            $nameParts = explode(' ', $user->name, 2);

            Guests::create([
                'user_id' => $user->id,
                'first_name' => $nameParts[0] ?? $user->name,
                'last_name'  => $nameParts[1] ?? '',
                'phone'      => $user->phone ?? null,
            ]);
        }
    }

    public function register(Request $request)
    {

        try {

            $validated = $request->validate([

                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users',
                'password' => [
                    'required',
                    'confirmed',
                    Password::min(8)->letters()->numbers()->symbols()
                ],

            ]);

            $users = User::create([

                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                'status' => 'active',
                'provider' => 'local',
                'provider_id' => null,
                'avatar' => null,
                'is_2fa_enabled' => false

            ]);

            $this->ensureGuestProfileExists($users);

            $token = $users->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => "user account create successfully",
                'token_type' => 'Bearer',
                'user' => $users->load('guest')
            ], 200);
        } catch (Exception $e) {

            return response()->json([
                'message' => 'failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function login(Request $request)
    {
        // 1. Throttle requests by IP + email to prevent brute-force attacks
        $throttleKey = Str::transliterate(Str::lower($request->input('email')) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Too many login attempts. Please try again in {$seconds} seconds."
            ], 429);
        }

        // 2. Validate request input
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        // 3. Retrieve user by email
        $user = User::where('email', strtolower($credentials['email']))->first();

        // 4. Verify user existence and password
        if (!$user || !Hash::check($credentials['password'], $user->password)) {

            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'Incorrect email or password.'
            ], 401);
        }

        // 5. Check user account status
        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account has been suspended.'
            ], 403);
        }

        // Clear rate limiter on successful authentication
        RateLimiter::clear($throttleKey);

        // 6. Role & 2FA Enforcement
        $staffRoles = ['super_admin', 'admin', 'cashier', 'manager'];
        $requiresOtp = in_array($user->role, $staffRoles) || (bool) $user->is_2fa_enabled;

        if ($requiresOtp) {
            $otpCode = random_int(100000, 999999);

            // Store hashed/plain OTP code in Cache (3 minutes)
            $email = strtolower($user->email);

            Cache::put("otp_{$email}", $otpCode, now()->addMinutes(3));
            Cache::forget("otp_attempts_{$email}");
            // Queue mail sending so API response is fast
            Mail::to($user->email)->queue(new SendOtpMail($otpCode, 'login'));

            $responseData = [
                'requires_2fa' => true,
                'user_id' => $user->id,
                'message' => 'Verification code sent to your email.'
            ];

            // Debug OTP only in local development environment
            if (app()->environment('local')) {
                $responseData['dev_otp'] = $otpCode;
            }

            return response()->json($responseData, 200);
        }

        // 7. Ensure guest profile exists and issue token
        $this->ensureGuestProfileExists($user);

        // Revoke old tokens before issuing new one
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('guest')
        ], 200);
    }

    public function verifyOtp(Request $request)
    {

        $validated = $request->validate([
            'email' => 'required|exists:users,email',
            'otp_code' => 'required|numeric|digits:6'
        ]);

        $email = strtolower($validated['email']);
        $cacheKey = "otp_{$email}";
        $attemptsKey = "otp_attempts_{$email}";

        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp) {
            return response()->json([
                'message' => 'OTP code has expired or was not requested.',
            ], 422);
        }

        // $user = User::where(
        //     'email', strtolower($request->email)
        // )->firstOrFail();

        if ($cachedOtp !=  $validated['otp_code']) {
            $attempts = Cache::increment($attemptsKey);

            if ($attempts >= 3) {
                Cache::forget($cacheKey);
                Cache::forget($attemptsKey);

                return response()->json([
                    'message' => 'Too many failed attempts. Your OTP has been invalidated. Please request a new code.',
                ], 429);
            }

            $remaining = 3 - $attempts;
            return response()->json([
                'message' => "Invalid OTP code. You have {$remaining} attempt(s) remaining.",
            ], 422);
        }

        Cache::forget($cacheKey);
        Cache::forget($attemptsKey);

        $users = User::where('email', $email)->firstOrFail();

        if ($users->role === 'customer' && !$users->guest) {

           $nameParts = explode(' ', $users->name, 2);

            Guests::create([
                'user_id' => $users->id,
                'first_name' => $nameParts[0] ?? $users->name,
                'last_name' => $nameParts[1] ?? '',
                'phone' => $users->phone ?? null
            ]);
        }

        $users->tokens()->delete();
        $token = $users->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'otp verify success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $users
        ], 200);
    }

    public function redirectGoogle()
    {

    // return Socialite::driver('google')->stateless()->redirect();

        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */

        $driver = Socialite::driver('google');

        return $driver->stateless()->redirect();
    }

    public function GoogleCallback(Request $request)
    {

        $frontendurl = env('FRONTEND_URL', 'http://localhost:5173');


        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('google');

            $googleUser = $driver->stateless()->user();


            $user = User::where('email', strtolower($googleUser->getEmail()))->first();

            if ($user) {

                if ($user->status !== 'active') {

                    return redirect()->away("{$frontendurl}/login?error=account_suspended");
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

            $user->tokens()->delete();


            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect()->away("{$frontendurl}/auth/callback?token={$token}&user_id={$user->id}");

            // return response()->json([
            //     'message'      => 'Google authentication successful',
            //     'access_token' => $token,
            //     'token_type'   => 'Bearer',
            //     'user'         => $user,
            // ], 200);

        } catch (\Exception $e) {
            return redirect()->away("{$frontendurl}/login?error=google_auth_failed");
        }
    }

    public function redirectGithub()
    {

        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */

        $driver = Socialite::driver('github');

        return $driver->scopes(['user:email'])->stateless()->redirect();;
    }

    public function githubCallback(Request $request)
    {
        $frontendurl = rtrim(env('FRONTEND_URL', 'http://localhost:5173', 'http://localhost:5174'), '/');

        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('github');

            $githubUser = $driver->stateless()->user();

            $email = $githubUser->getEmail() ? strtolower($githubUser->getEmail()) : null;

            if (!$email) {
                return redirect()->away("{$frontendurl}/login?error=github_email_not_found");
            }

            $user = User::where('email', $email)->first();

            if ($user) {
                if ($user->status !== 'active') {
                    return redirect()->away("{$frontendurl}/login?error=account_suspended");
                }

                if (!$user->provider_id) {
                    $user->update([
                        'provider'    => 'github',
                        'provider_id' => $githubUser->getId(),
                        'avatar'      => $user->avatar ?? $githubUser->getAvatar(),
                    ]);
                }
            } else {
                $user = User::create([
                    'name'        => $githubUser->getName() ?? $githubUser->getNickname() ?? 'GitHub User',
                    'email'       => $email,
                    'password'    => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)), // Prevents SQL non-null password errors
                    'provider'    => 'github',
                    'provider_id' => $githubUser->getId(),
                    'avatar'      => $githubUser->getAvatar(),
                    'role'        => 'customer',
                    'status'      => 'active',
                ]);
            }


            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect()->away("{$frontendurl}/auth/callback?token={$token}&user_id={$user->id}");
        } catch (\Exception $e) {
            return redirect()->away("{$frontendurl}/login?error=github_auth_failed");
        }
    }


    public function logout(Request $request)
    {

        try {

            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => "logout success"
            ], 200);
        } catch (Exception $e) {

            return response()->json([
                'message' => "failed to logout",
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function redirectFacebook()
    {

        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */

        $driver = Socialite::driver('facebook');

        return $driver->scopes(['email'])->stateless()->redirect();
    }

    public function facebookCallback(Request $request)
    {
        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('facebook');

            $facebookUser = $driver->stateless()->user();

            $email = $facebookUser->getEmail() ? strtolower($facebookUser->getEmail()) : null;

            if (!$email) {
                return response()->json([
                    'message' => 'Facebook account must have an email associated with it',
                ], 422);
            }

            $user = User::where('email', $email)->first();

            if ($user) {

                if ($user->status !== 'active') {
                    return response()->json([
                        'message' => 'Your account has been suspended',
                    ], 403);
                }


                if (!$user->provider_id) {
                    $user->update([
                        'provider'    => 'facebook',
                        'provider_id' => $facebookUser->getId(),
                        'avatar'      => $user->avatar ?? $facebookUser->getAvatar(),
                    ]);
                }
            } else {

                $user = User::create([
                    'name'        => $facebookUser->getName() ?? 'Facebook User',
                    'email'       => $email,
                    'password'    => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(24)),
                    'provider'    => 'facebook',
                    'provider_id' => $facebookUser->getId(),
                    'avatar'      => $facebookUser->getAvatar(),
                    'role'        => 'customer',
                    'status'      => 'active',
                ]);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message'      => 'Login with Facebook success',
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to login with Facebook',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function forgotPassword(Request $request)
    {

        $request->validate(['email' => 'required|email|exists:users,email']);

        $email = strtolower($request->email);
        $otp = rand(100000, 999999);
        $cachekey = 'otp_reset_' . $email;

        Cache::put($cachekey, $otp, now()->addMinutes(3));
        Cache::forget('otp_attempts_' . $email);

        Mail::to($email)->send(new SendOtpMail($otp, 'reset'));

        return response()->json([

            'status' => 'success',

            'message' => 'otp sent successfully'
        ], 200);
    }

    public function verifyResetOtp(Request $request)
    {

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        $email = strtolower($request->email);
        $cacheKey = 'otp_reset_' . $email;
        $attemptsKey = 'otp_attempts_' . $email;

        $cachedOtp = Cache::get($cacheKey);

        $attempts = Cache::get($attemptsKey, 0);


        if (!$cachedOtp) {
            return response()->json([
                'status' => 'error',
                'message' => 'Otp expired please try again'
            ], 422);
        }

        if ($cachedOtp != $request->otp) {
            $attempts++;
            Cache::put($attemptsKey, $attempts, now()->addMinutes(3));

            if ($attempts >= 3) {
                Cache::forget($cacheKey);
                Cache::forget($attemptsKey);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many failed attempts. Your OTP has been invalidated for security. Please request a new code',

                ], 429);
            }

            $remainingAttempts = 3 - $attempts;
            return response()->json([
                'status' => 'error',
                'message' => "Invalid OTP code. You have {$remainingAttempts} attempt(s) remaining.",

            ], 422);
        }

        Cache::forget($attemptsKey);

        return response()->json([
            'status' => 'success',
            'message' => 'OTP verified successfully'
        ], 200);
    }

    public function resetPassword(Request $request)
    {

        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $email = strtolower($request->email);
        $cacheKey = 'otp_reset_' . $email;
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired otp session'
            ], 422);
        }
        $user = User::where('email', $email)->first();

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        Cache::forget($cacheKey);
        Cache::forget("otp_attempts_{$email}");
        $user->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully'
        ], 200);
    }
}

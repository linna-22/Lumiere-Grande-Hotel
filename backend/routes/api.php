<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\GuestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Public Read-Only Routes
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::get('/room-types/{roomType}', [RoomTypeController::class, 'show']);

Route::get('/rooms', [RoomController::class, 'index'])->name('rooms');
Route::get('/rooms/{id}', [RoomController::class, 'show'])->name('rooms.show');

// Rate-Limited Authentication Routes (Max 10 requests per minute)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login']); // POST endpoint for actual login
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('verify.otp');
});

// Google OAuth Routes
Route::get('/auth/google', [AuthController::class, 'redirectGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'GoogleCallback'])->name('google.callback');

// GITHUB OAUTH ROUTES

Route::get('/auth/github', [AuthController::class, 'redirectGithub'])->name('auth.github');
Route::get('/auth/github/callback', [AuthController::class, 'githubCallback'])->name('github.callback');


Route::get('auth/facebook', [AuthController::class, 'redirectFacebook'])->name('auth.facebook');
Route::get('auth/facebook/callback', [AuthController::class, 'facebookCallback'])->name('facebook.callback');
// Fallback JSON route when Sanctum blocks an unauthenticated request
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');


/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Authenticated User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Room Types Management (Admin / Staff Only)
    Route::post('/room-types', [RoomTypeController::class, 'store']);
    Route::put('/room-types/{roomType}', [RoomTypeController::class, 'update']);
    Route::delete('/room-types/{roomType}', [RoomTypeController::class, 'destroy']);

    // Rooms Management (Admin / Staff Only)
    Route::post('/rooms/create', [RoomController::class, 'store'])->name('rooms.create');
    Route::put('/rooms/update/{id}', [RoomController::class, 'update'])->name('rooms.update');
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');
});


// ======================Guest=============================

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/guest/profile', [GuestController::class, 'showProfile'])->name('guest.profile');
    Route::put('/guest/profile', [GuestController::class, 'updateProfile']);

   Route::middleware('role:admin,receptionist')->group(function () {
        Route::get('/admin/guests', [GuestController::class, 'index']);
        Route::post('/admin/guests/walk-in', [GuestController::class, 'storeWalkIn']);
        Route::get('/admin/guests/{id}', [GuestController::class, 'show']);
    });

});


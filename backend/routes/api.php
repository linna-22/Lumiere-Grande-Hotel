<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\GuestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Public Read-Only Routes
// Public Read-Only & CRUD Routes (Unprotected for Pre-Demo)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Room Types (Unprotected for Pre-Demo)
Route::apiResource('room-types', RoomTypeController::class);

// Rooms (Unprotected for Pre-Demo)
Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
Route::get('/rooms/{id}', [RoomController::class, 'show'])->name('rooms.show');
Route::post('/rooms', [RoomController::class, 'store'])->name('rooms.store');
Route::put('/rooms/{id}', [RoomController::class, 'update'])->name('rooms.update');
Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');

// Rate-Limited Authentication Routes (Max 10 requests per minute)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('api.login'); 
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('verify.otp');
});

// OAuth Routes (Google, GitHub, Facebook)
Route::prefix('auth')->group(function () {
    Route::get('/google', [AuthController::class, 'redirectGoogle'])->name('auth.google');
    Route::get('/google/callback', [AuthController::class, 'googleCallback'])->name('auth.google.callback');

    Route::get('/github', [AuthController::class, 'redirectGithub'])->name('auth.github');
    Route::get('/github/callback', [AuthController::class, 'githubCallback'])->name('auth.github.callback');

    Route::get('/facebook', [AuthController::class, 'redirectFacebook'])->name('auth.facebook');
    Route::get('/facebook/callback', [AuthController::class, 'facebookCallback'])->name('auth.facebook.callback');
});

// Public Facilities Endpoint
Route::get('/facilities', [FacilityController::class, 'index'])->name('facilities.index');

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Sanctum Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth Actions
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Guest Profile
    Route::get('/guest/profile', [GuestController::class, 'showProfile'])->name('guest.profile');
    Route::put('/guest/profile', [GuestController::class, 'updateProfile'])->name('guest.profile.update');

    // Admin & Staff Operations
    Route::middleware('role:admin,receptionist')->prefix('admin')->group(function () {
        Route::get('/guests', [GuestController::class, 'index'])->name('admin.guests.index');
        Route::post('/guests/walk-in', [GuestController::class, 'storeWalkIn'])->name('admin.guests.walkin');
        Route::get('/guests/{id}', [GuestController::class, 'show'])->name('admin.guests.show');
    });

});
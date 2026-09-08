<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\GuestController;
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

// Public Browse Endpoints (Read-Only)
Route::get('/rooms', [RoomController::class, 'index'])->name('rooms.index');
Route::get('/rooms/{id}', [RoomController::class, 'show'])->name('rooms.show');
Route::get('/room-types', [RoomTypeController::class, 'index'])->name('room-types.index');
Route::get('/room-types/{id}', [RoomTypeController::class, 'show'])->name('room-types.show');
Route::get('/facilities', [FacilityController::class, 'index'])->name('facilities.index');

// Rate-Limited Authentication Routes (Max 10 requests per minute)
Route::middleware('throttle:5,1')->group(function () {
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

/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Sanctum Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Authenticated User Info & Actions
    Route::prefix('user')->group(function () {
        Route::get('/me', [UserController::class, 'me'])->name('user.me');
        Route::put('/change-password', [UserController::class, 'changePassword'])->name('user.change_password');
        
        // Customer Profile Endpoints
        Route::get('/profile', [GuestController::class, 'showProfile'])->name('guest.profile');
        Route::put('/profile', [GuestController::class, 'updateProfile'])->name('guest.profile.update');
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Guest Profile Management
    Route::get('/guest/profile', [GuestController::class, 'showProfile'])->name('guest.profile');
    Route::put('/guest/profile', [GuestController::class, 'updateProfile'])->name('guest.profile.update');

    // Admin & Staff Operations (Role Restricted)
    Route::middleware('role:admin,receptionist')->prefix('admin')->group(function () {
        
        Route::get('/user', [UserController::class, 'index'])->name('admin.user.index');
        Route::post('/user/create', [UserController::class, 'store'])->name('admin.user.store');
        Route::get('user/{id}', [UserController::class, 'show'])->name('admin.user.show');
        Route::put('user/update/{id}', [UserController::class, 'update'])->name('admin.user.update');
        Route::delete('user/delete', [UserController::class, 'destory'])->name('admin.user.destory');
        
        // Guest Management
        Route::get('/guests', [GuestController::class, 'index'])->name('admin.guests.index');
        Route::post('/guests/walk-in', [GuestController::class, 'storeWalkIn'])->name('admin.guests.walkin');
        Route::get('/guests/{id}', [GuestController::class, 'show'])->name('admin.guests.show');

        // Room Management (Protected CRUD)
        Route::post('/rooms/create', [RoomController::class, 'store'])->name('rooms.create');
        Route::put('/rooms/update/{id}', [RoomController::class, 'update'])->name('rooms.update');

        Route::delete('/rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');

        // Room Type Management (Protected CRUD)
        Route::post('/room-types/create', [RoomTypeController::class, 'store'])->name('room-types.store');
        Route::put('/room-types/{room_types}', [RoomTypeController::class, 'update'])->name('room-types.update');
        Route::delete('/room-types/{room_types}', [RoomTypeController::class, 'destroy'])->name('room-types.destroy');
    });

});

Route::middleware('throttle:5,1')->group(function() {

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    Route::post('/verify-reset-otp', [AuthController::class, 'verifyResetOtp']);

    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

});


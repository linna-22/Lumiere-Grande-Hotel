<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\RoomTypeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::apiResource('room-types', RoomTypeController::class);

Route::apiResource('rooms', RoomController::class);


// ================Public route ============

Route::post('/register', [AuthController::class], 'register');
Route::post('/send-otp', [AuthController::class], 'sendOtp');
Route::post('/verify-otp', [AuthController::class], 'verifyOtp');

Route::middleware(['auth:sanctum'])->controller(AuthController::class)->group(function() {

    Route::get('/users', function(Request $request) {
        return $request->user();
    });

});

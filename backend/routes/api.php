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


// Route::apiResource('room-types', RoomTypeController::class);

// Route::apiResource('rooms', RoomController::class);

// Manual Room Types Routes

// ====================RommType api =============================
Route::get('/room-types', [RoomTypeController::class, 'index']);
Route::post('/room-types', [RoomTypeController::class, 'store']);
Route::get('/room-types/{roomType}', [RoomTypeController::class, 'show']);
Route::put('/room-types/{roomType}', [RoomTypeController::class, 'update']);
Route::delete('/room-types/{roomType}', [RoomTypeController::class, 'destroy']);


// ======================Room api======================

Route::get('/rooms', [RoomController::class, 'index'])->name('rooms');
Route::post('/rooms/create', [RoomController::class, 'store'])->name('rooms.create');
Route::get('/rooms/{id}', [RoomController::class, 'show'])->name('rooms.show');
Route::put('/rooms/update/{id}', [RoomController::class, 'update'])->name('rooms.update');
Route::delete('rooms/{id}', [RoomController::class, 'destroy'])->name('rooms.destroy');

// ================User register ============

Route::post('/register', [AuthController::class, 'register'])->name('register');

// ===================Google Login===============

Route::get('/auth/google', [AuthController::class, 'redirectGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'GoogleCallback'])->name('google.callback');


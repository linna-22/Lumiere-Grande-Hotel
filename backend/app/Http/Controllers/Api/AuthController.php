<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    //

    public function register(Request $request){

    $validate = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users',
        'password' => 'required|string|min:6',

    ]);

    $user = User::create([
        'name' => $validate['name'],
        'email' => $validate['email'],
        'password' => Hash::make($validate['password']),
        'role' => 'customer',
        'status' => 'active'
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'status' => true,
        'message' => 'User register successfully',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user

    ], 201);

    
    }

    public function login(Request $request){

    

    }
}

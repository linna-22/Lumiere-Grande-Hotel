<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Facility;

class FacilityController extends Controller
{
    public function index(Request $request){

    $facility = Facility::select('id', 'name', 'icon')->get();

    return response()->json([

        'facilities' => $facility
    ], 200);
    
    }
}

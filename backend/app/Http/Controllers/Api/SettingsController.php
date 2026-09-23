<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    //

    public function getPublicInfo()
    {


        return response()->json([

            'status' => 'success',
            'data' => [
                'hotel_name' => Settings::getByKey('hotel_name', 'Lumora Grende Hotel'),
                'hotel_phone' => Settings::getByKey('hotel_phone', '+855 86247757'),
                'hotel_email' => Settings::getByKey('hotel_email', 'lumorahotel@gmail.com'),
                'hotel_addres' => Settings::getByKey('hotel_address', 'Toul Kork, PhnomPenh'),
                'hotel_logo_url' => Settings::getByKey('hotel_logo_url', null),
                'check_in_time' => Settings::getByKey('check_in_time', '14:00'),
                'check_out_time' => Settings::getByKey('check_out_time', '12:00'),
                'currency_code' => Settings::getByKey('currency_code', 'USD'),
            ]
        ]);
    }

    public function index()
    {

        $settings = Settings::all()->groupBy('group')->map(function ($items) {

            return $items->pluck('value', 'key');
        });

        return response()->json([

            'status' => 'success',
            'data' => $settings

        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string',
        ]);

        foreach ($request->input('settings') as $item) {
            $group = $item['group'] ?? 'general';
            Settings::setByKey($item['key'], $item['value'], $group);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel information updated successfully.'
        ]);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        // 1. Delete old logo from Cloudinary if public_id exists
        $oldPublicId = Settings::getByKey('hotel_logo_public_id');
        if ($oldPublicId) {
            Cloudinary::destroy($oldPublicId);
        }

        // 2. Upload new logo to Cloudinary in the 'hotel_branding' folder
        $uploadedFile = Cloudinary::upload($request->file('logo')->getRealPath(), [
            'folder' => 'hotel_branding',
            'transformation' => [
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ]
        ]);

        $fullUrl = $uploadedFile->getSecurePath(); 
        $publicId = $uploadedFile->getPublicId();  

        // 3. Save details to Settings database table
        Settings::setByKey('hotel_logo_public_id', $publicId, 'branding');
        Settings::setByKey('hotel_logo_url', $fullUrl, 'branding');

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel logo uploaded to Cloudinary successfully.',
            'logo_url' => $fullUrl
        ]);
    }
}

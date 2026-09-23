<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    //

    public function triggerBackup(): JsonResponse
    {
        try {
            // Increase PHP execution limit for larger database exports
            set_time_limit(300);

            $exitCode = Artisan::call('db:telegram-backup');

            if ($exitCode === 0) {
                return response()->json([
                    'status'  => 'success',
                    'message' => 'Database backup successfully created and uploaded to Telegram!'
                ]);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Backup process failed. Check your Laravel logs.'
            ], 500);

        } catch (\Exception $e) {
            Log::error('Backup Trigger Exception: ' . $e->getMessage());

            return response()->json([
                'status'  => 'error',
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}

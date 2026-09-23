<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBackup extends Command
{

    protected $signature = 'db:telegram-backup';
    protected $description = 'Export database, zip it, and send to Telegram channel';

    public function handle()
    {
        $dbName   = env('DB_DATABASE');$dbUser   = env('DB_USERNAME');
        $dbPass   = env('DB_PASSWORD');$dbHost   = env('DB_HOST', '127.0.0.1');
        $botToken = env('TELEGRAM_BOT_TOKEN');$chatId   = env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {$this->error('Telegram credentials missing in .env');
            return Command::FAILURE;
        }

        $timestamp   = now()->format('Y-m-d_H-i-s');$sqlFileName = "backup_{$dbName}_{$timestamp}.sql";
        $zipFileName = "backup_{$dbName}_{$timestamp}.zip";

        $storagePath = storage_path('app/backups');
        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }

        $sqlPath = "{$storagePath}/{$sqlFileName}";
        $zipPath = "{$storagePath}/{$zipFileName}";

        // 1. Export MySQL Dump
        $passParam   = !empty($dbPass) ? "-p\"{$dbPass}\"" : "";
        $dumpCommand = "mysqldump -h {$dbHost} -u {$dbUser} {$passParam} {$dbName} > \"{$sqlPath}\"";
        
        exec($dumpCommand, $output,$returnCode);

        if ($returnCode !== 0 || !file_exists($sqlPath)) {$this->error('Failed to export MySQL database dump.');
            return Command::FAILURE;
        }

        // 2. Compress SQL into ZIP
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
            $zip->addFile($sqlPath, $sqlFileName);$zip->close();
            unlink($sqlPath); // Delete raw .sql file
        } else {
            $this->error('Failed to create ZIP archive.');
            return Command::FAILURE;
        }

        // 3. Upload to Telegram
        $response = Http::timeout(180)
            ->attach('document', file_get_contents($zipPath),$zipFileName)
            ->post("https://api.telegram.org/bot{$botToken}/sendDocument", [
                'chat_id'    => $chatId,
                'caption'    => "📦 *Database Backup Completed*\n\n" .
                                "• *Database:* `{$dbName}`\n" .
                                "• *Date:* " . now()->toDateTimeString() . "\n" .
                                "• *File Size:* " . round(filesize($zipPath) / 1024 / 1024, 2) . " MB",
                'parse_mode' => 'Markdown',
            ]);

        // Cleanup local zip file
        unlink($zipPath);

        if ($response->successful()) {$this->info('Backup successfully sent to Telegram!');
            return Command::SUCCESS;
        }

        Log::error('Telegram Backup Failed', ['body' => $response->body()]);
        return Command::FAILURE;
    }
    // /**
    //  * The name and signature of the console command.
    //  *
    //  * @var string
    //  */
    // protected $signature = 'app:telegram-backup';

    // /**
    //  * The console command description.
    //  *
    //  * @var string
    //  */
    // protected $description = 'Command description';

    // /**
    //  * Execute the console command.
    //  */
    // public function handle()
    // {
    //     //
    // }
}

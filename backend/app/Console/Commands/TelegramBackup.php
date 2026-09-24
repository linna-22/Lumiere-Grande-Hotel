<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class TelegramBackup extends Command
{
    protected $signature = 'db:telegram-backup';

    protected $description = 'Export database, zip it, and send to Telegram channel';

    public function handle()
    {
        // =====================================================
        // DATABASE CONFIGURATION
        // =====================================================

        $dbName = env('DB_DATABASE');
        $dbUser = env('DB_USERNAME');
        $dbPass = env('DB_PASSWORD');
        $dbHost = env('DB_HOST', '127.0.0.1');
        $dbPort = env('DB_PORT', '3306');

        // =====================================================
        // TELEGRAM CONFIGURATION
        // =====================================================

        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID');

        if (!$botToken || !$chatId) {
            $this->error(
                'Telegram credentials missing in .env'
            );

            return Command::FAILURE;
        }

        // =====================================================
        // VALIDATE DATABASE CONFIGURATION
        // =====================================================

        if (!$dbName || !$dbUser) {
            $this->error(
                'Database credentials are missing in .env'
            );

            return Command::FAILURE;
        }

        // =====================================================
        // MYSQLDUMP PATH
        // =====================================================

        /*
         * For WampServer on your computer:
         *
         * C:\wamp64\bin\mysql\mysql9.1.0\bin\mysqldump.exe
         *
         * You can override this using MYSQLDUMP_PATH in .env.
         */

        $mysqldumpPath = env(
            'MYSQLDUMP_PATH',
            'C:\\wamp64\\bin\\mysql\\mysql9.1.0\\bin\\mysqldump.exe'
        );

        // Remove accidental surrounding quotes
        $mysqldumpPath = trim(
            $mysqldumpPath,
            "\"'"
        );

        // =====================================================
        // CHECK MYSQLDUMP
        // =====================================================

        if (!file_exists($mysqldumpPath)) {
            $this->error(
                "mysqldump.exe was not found at:\n{$mysqldumpPath}"
            );

            Log::error(
                'mysqldump.exe not found',
                [
                    'path' => $mysqldumpPath,
                ]
            );

            return Command::FAILURE;
        }

        // =====================================================
        // CREATE BACKUP DIRECTORY
        // =====================================================

        $timestamp = now()->format(
            'Y-m-d_H-i-s'
        );

        $sqlFileName =
            "backup_{$dbName}_{$timestamp}.sql";

        $zipFileName =
            "backup_{$dbName}_{$timestamp}.zip";

        $storagePath =
            storage_path('app/backups');

        if (!is_dir($storagePath)) {
            if (!mkdir(
                $storagePath,
                0755,
                true
            )) {
                $this->error(
                    'Failed to create backup directory.'
                );

                return Command::FAILURE;
            }
        }

        $sqlPath =
            $storagePath . DIRECTORY_SEPARATOR . $sqlFileName;

        $zipPath =
            $storagePath . DIRECTORY_SEPARATOR . $zipFileName;

        // =====================================================
        // 1. EXPORT MYSQL DATABASE
        // =====================================================

        $this->info(
            'Creating MySQL database dump...'
        );

        /*
         * Quote everything because this is executed
         * through the Windows command shell.
         */

        $command =
            '"' . $mysqldumpPath . '"' .
            ' --host="' . $dbHost . '"' .
            ' --port="' . $dbPort . '"' .
            ' --user="' . $dbUser . '"';

        /*
         * Add password only when one exists.
         */

        if ($dbPass !== null && $dbPass !== '') {
            $command .=
                ' --password="' .
                $dbPass .
                '"';
        }

        $command .=
            ' "' . $dbName . '"' .
            ' > "' . $sqlPath . '"';

        $output = [];
        $returnCode = 0;

        exec(
            $command,
            $output,
            $returnCode
        );

        // =====================================================
        // CHECK SQL EXPORT
        // =====================================================

        if (
            $returnCode !== 0 ||
            !file_exists($sqlPath) ||
            filesize($sqlPath) === 0
        ) {
            $this->error(
                'Failed to export MySQL database dump.'
            );

            Log::error(
                'MySQL database dump failed',
                [
                    'command' => $command,
                    'return_code' => $returnCode,
                    'output' => $output,
                    'sql_path' => $sqlPath,
                ]
            );

            // Remove incomplete SQL file
            if (file_exists($sqlPath)) {
                @unlink($sqlPath);
            }

            return Command::FAILURE;
        }

        $this->info(
            'MySQL database dump created successfully.'
        );

        // =====================================================
        // 2. CREATE ZIP FILE
        // =====================================================

        $this->info(
            'Compressing database backup...'
        );

        $zip = new ZipArchive();

        $zipResult = $zip->open(
            $zipPath,
            ZipArchive::CREATE |
            ZipArchive::OVERWRITE
        );

        if ($zipResult !== true) {
            $this->error(
                'Failed to create ZIP archive.'
            );

            Log::error(
                'ZIP creation failed',
                [
                    'zip_path' => $zipPath,
                    'zip_error' => $zipResult,
                ]
            );

            @unlink($sqlPath);

            return Command::FAILURE;
        }

        $zip->addFile(
            $sqlPath,
            $sqlFileName
        );

        $zip->close();

        // Delete raw SQL file
        @unlink($sqlPath);

        if (
            !file_exists($zipPath) ||
            filesize($zipPath) === 0
        ) {
            $this->error(
                'ZIP file was not created correctly.'
            );

            return Command::FAILURE;
        }

        $this->info(
            'Backup ZIP created successfully.'
        );

        // =====================================================
        // 3. UPLOAD TO TELEGRAM
        // =====================================================

        $this->info(
            'Uploading backup to Telegram...'
        );

        try {
            $fileSize =
                round(
                    filesize($zipPath) / 1024 / 1024,
                    2
                );

            $caption =
                "📦 *Database Backup Completed*\n\n" .
                "• *Database:* `{$dbName}`\n" .
                "• *Date:* " .
                now()->toDateTimeString() .
                "\n" .
                "• *File Size:* " .
                $fileSize .
                " MB";

            $response = Http::timeout(180)
                ->attach(
                    'document',
                    file_get_contents($zipPath),
                    $zipFileName
                )
                ->post(
                    "https://api.telegram.org/bot{$botToken}/sendDocument",
                    [
                        'chat_id' => $chatId,
                        'caption' => $caption,
                        'parse_mode' => 'Markdown',
                    ]
                );

        } catch (\Throwable $e) {
            Log::error(
                'Telegram Backup Exception',
                [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]
            );

            $this->error(
                'Failed to upload backup to Telegram.'
            );

            @unlink($zipPath);

            return Command::FAILURE;
        }

        // =====================================================
        // CLEANUP LOCAL ZIP
        // =====================================================

        @unlink($zipPath);

        // =====================================================
        // CHECK TELEGRAM RESPONSE
        // =====================================================

        if ($response->successful()) {
            $this->info(
                'Backup successfully sent to Telegram!'
            );

            return Command::SUCCESS;
        }

        Log::error(
            'Telegram Backup Failed',
            [
                'status' => $response->status(),
                'body' => $response->body(),
            ]
        );

        $this->error(
            'Telegram upload failed.'
        );

        return Command::FAILURE;
    }
}
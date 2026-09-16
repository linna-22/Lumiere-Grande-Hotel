<?php

namespace App\Services;

use Exception;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;
use KHQR\Models\MerchantInfo;

class KhqrService
{
    protected string $accountId;
    protected string $merchantName;
    protected string $merchantCity;
    protected ?string $apiToken;

    public function __construct()
    {
        $this->accountId    = config('services.bakong.account_id', '');
        $this->merchantName = config('services.bakong.merchant_name', 'Lim KethyaRavy');
        $this->merchantCity = config('services.bakong.merchant_city', 'Phnom Penh');
        $this->apiToken     = config('services.bakong.api_token');
    }

    /**
     * Generate a dynamic KHQR with a fixed amount.
     */
    public function generateQr(string $billNumber, float $amount, string $currency = 'USD'): array
    {
        try {
            $currencyType = strtoupper($currency) === 'KHR'
                ? KHQRData::CURRENCY_KHR
                : KHQRData::CURRENCY_USD;

            // Format amount float precision
            $formattedAmount = round($amount, 2);

            // Check if account is a Merchant Account (@bkmc, @abam, @merchant)
            $isMerchant = str_contains($this->accountId, '@bkmc') || str_contains($this->accountId, '@abam');

            if ($isMerchant) {
                $merchantInfo = new MerchantInfo(
                    bakongAccountID: $this->accountId,
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    merchantID: $this->accountId,
                    acquiringBank: 'Bakong',
                    currency: $currencyType,
                    amount: $formattedAmount,
                    billNumber: $billNumber,
                    mobileNumber: ''
                );
            } else {
                // Fully named arguments for IndividualInfo
                $individualInfo = new IndividualInfo(
                    bakongAccountID: $this->accountId,
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    currency: $currencyType,
                    amount: $formattedAmount,
                    billNumber: $billNumber,
                    storeLabel: null
                );
            }

            // Extract payload from SDK response
            $qrData = $response->data['qr'] ?? null;
            $md5    = $response->data['md5'] ?? null;

            if (!$qrData || !$md5) {
                return [
                    'success' => false,
                    'error'   => 'SDK returned invalid or empty QR payload.'
                ];
            }

            return [
                'success'  => true,
                'qr_code'  => $qrData,
                'md5'      => $md5,
                'deeplink' => "https://bakong.page.link/pay?qr=" . urlencode($qrData),
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment status against NBC Bakong API.
     */
    public function verifyTransaction(string $md5Hash): array
    {
        if (!$this->apiToken) {
            return [
                'success' => false,
                'paid' => false,
                'status' => 'PENDING',
                'message' => 'Bakong API Token is missing in configuration.',
            ];
        }

        try {
            $bakongKhqr = new BakongKHQR(
                $this->apiToken
            );

            $status = $response->data['status'] ?? 'PENDING';
            $isPaid = in_array($status, ['SUCCESS', '0', 0], true);

            return [
                'success' => true,
                'paid' => $isPaid,
                'status' => $isPaid
                    ? 'SUCCESS'
                    : 'PENDING',
                'raw' => $response->data ?? [],
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'paid' => false,
                'status' => 'PENDING',
                'error' => $e->getMessage(),
            ];
        }
    }
}
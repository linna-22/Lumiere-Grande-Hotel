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
        $this->accountId = config('services.bakong.account_id');
        $this->merchantName = config(
            'services.bakong.merchant_name',
            'Kethyaravy Lim'
        );
        $this->merchantCity = config(
            'services.bakong.merchant_city',
            'Phnom Penh'
        );
        $this->apiToken = config('services.bakong.api_token');
    }

    /**
     * Generate a dynamic KHQR with a fixed amount.
     */
    public function generateQr(
        string $billNumber,
        float $amount,
        string $currency = 'USD'
    ): array {
        try {
            $currencyType = strtoupper($currency) === 'USD'
                ? KHQRData::CURRENCY_USD
                : KHQRData::CURRENCY_KHR;

            /*
             * Dynamic KHQR requires an expiration timestamp.
             *
             * 5 minutes from now.
             * Bakong expects milliseconds.
             */
            $expirationTimestamp = (string) (
                floor(microtime(true) * 1000)
                + (5 * 60 * 1000)
            );

            /*
             * Make sure the bill number is a clean invoice reference.
             */
            $billNumber = trim($billNumber);

            /*
             * Merchant account
             */
            if (
                str_contains($this->accountId, '@bkmc') ||
                str_contains($this->accountId, '@abam')
            ) {
                $merchantInfo = new MerchantInfo(
                    bakongAccountID: $this->accountId,
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    merchantID: $this->accountId,
                    acquiringBank: 'Bakong',
                    currency: $currencyType,
                    amount: $amount,
                    billNumber: $billNumber,
                    expirationTimestamp: $expirationTimestamp,
                    merchantCategoryCode: '5999'
                );

                $response = BakongKHQR::generateMerchant(
                    $merchantInfo
                );
            } else {
                /*
                 * Individual Bakong account
                 */
                $individualInfo = new IndividualInfo(
                    bakongAccountID: $this->accountId,
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    currency: $currencyType,
                    amount: $amount,
                    billNumber: $billNumber,
                    expirationTimestamp: $expirationTimestamp,
                    merchantCategoryCode: '5999'
                );

                $response = BakongKHQR::generateIndividual(
                    $individualInfo
                );
            }

            /*
             * Check SDK response.
             */
            if (
                !isset($response->data) ||
                !isset($response->data['qr'])
            ) {
                return [
                    'success' => false,
                    'error' => $response->status['message']
                        ?? 'Failed to generate KHQR.'
                ];
            }

            $qrData = $response->data['qr'];
            $md5 = $response->data['md5'] ?? null;

            /*
             * Use Bakong SDK to generate the deep link.
             */
            $deepLinkResponse = BakongKHQR::generateDeepLink(
                $qrData,
                null
            );

            $deeplink = null;

            if (
                isset($deepLinkResponse->data) &&
                isset($deepLinkResponse->data->shortLink)
            ) {
                $deeplink = $deepLinkResponse->data->shortLink;
            }

            return [
                'success' => true,
                'qr_code' => $qrData,
                'md5' => $md5,
                'deeplink' => $deeplink,
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check whether a KHQR payment has been completed.
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

            $response = $bakongKhqr->checkTransactionByMD5(
                $md5Hash
            );

            $status = $response->data['status'] ?? null;

            $isPaid = in_array(
                $status,
                ['SUCCESS', '0', 0],
                true
            );

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
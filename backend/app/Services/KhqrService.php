<?php 

namespace App\Services;

use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;
use KHQR\Models\MerchantInfo;
use Exception;

class KhqrService 
{
    protected string $accountId;
    protected string $merchantName;
    protected string $merchantCity;
    protected ?string $apiToken;

    public function __construct()
    {
        $this->accountId    = config('services.bakong.account_id');
        $this->merchantName = config('services.bakong.merchant_name', 'Kethyaravy Lim');
        $this->merchantCity = config('services.bakong.merchant_city', 'Phnom Penh');
        $this->apiToken     = config('services.bakong.api_token');
    }

    /**
     * Generate an EMVCo-compliant KHQR string & MD5 hash.
     */
    public function generateQr(string $billNumber, float $amount, string $currency = 'USD'): array 
    {
        try {
            $currencyType = strtoupper($currency) === 'USD' 
                ? KHQRData::CURRENCY_USD 
                : KHQRData::CURRENCY_KHR;

            // Handle Merchant vs Individual accounts automatically based on suffix
            if (str_contains($this->accountId, '@bkmc') || str_contains($this->accountId, '@abam')) {
                $merchantInfo = new MerchantInfo(
                    bakongAccountID: $this->accountId,
                    merchantID: $this->accountId,
                    acquiringBank: 'Bakong',
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    currency: $currencyType,
                    amount: $amount,
                    billNumber: $billNumber
                );
                $response = BakongKHQR::generateMerchant($merchantInfo);
            } else {
                // Individual Account (@bkrt / @aba / etc.)
                $individualInfo = new IndividualInfo(
                    bakongAccountID: $this->accountId,
                    merchantName: $this->merchantName,
                    merchantCity: $this->merchantCity,
                    currency: $currencyType,
                    amount: $amount,
                    billNumber: $billNumber
                );
                $response = BakongKHQR::generateIndividual($individualInfo);
            }

            // Extract QR String and MD5 Hash
            $qrData = $response->data['qr'] ?? null;
            $md5    = $response->data['md5'] ?? null;

            return [
                'success'  => true,
                'qr_code'  => $qrData,
                'md5'      => $md5,
                'deeplink' => $qrData ? "https://bakong.page.link/pay?qr=" . urlencode($qrData) : null,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error'   => $e->getMessage()
            ];
        }
    }

   
    public function verifyTransaction(string $md5Hash): array
    {
        if (!$this->apiToken) {
            return [
                'success' => false,
                'paid'    => false,
                'status'  => 'PENDING',
                'message' => 'Bakong API Token is missing in configuration.'
            ];
        }

        try {
            $bakongKhqr = new BakongKHQR($this->apiToken);
            $response   = $bakongKhqr->checkTransactionByMD5($md5Hash);

            // NBC Bakong API returns status code 0 or 'SUCCESS' for completed transfers
            $status = $response->data['status'] ?? 'PENDING';
            $isPaid = in_array($status, ['SUCCESS', '0', 0], true);

            return [
                'success' => true,
                'paid'    => $isPaid,
                'status'  => $isPaid ? 'SUCCESS' : 'PENDING',
                'raw'     => $response->data ?? []
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'paid'    => false,
                'status'  => 'PENDING',
                'error'   => $e->getMessage()
            ];
        }
    }
}
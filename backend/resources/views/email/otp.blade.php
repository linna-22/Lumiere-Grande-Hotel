<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your OTP Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; text-align: center;"> Please Vertify Your verification code</h2>
        <p style="color: #666666; font-size: 16px;"> Using Your verification code below</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background: #EEF2FF; padding: 10px 20px; border-radius: 6px; border: 1px dashed #4F46E5;">
                {{ $otpCode }}
            </span>
        </div>

        <p style="color: #999999; font-size: 14px; text-align: center;">
            The verification code expired on 
            <span id="timeCount">3:00</span>
        </p>
    </div>
</body>


</html>
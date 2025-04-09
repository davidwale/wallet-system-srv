export const verificationEmailTemplate = (otp: number) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px;
            background-color: #12725B;
            color: #fff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            padding: 20px;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #12725B;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>Verify Your Account</h2>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Thanks for signing up! Please use the OTP below to verify your email address:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Credpal. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

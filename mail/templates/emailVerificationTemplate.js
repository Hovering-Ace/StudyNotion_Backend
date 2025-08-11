function EmailVerificationOtpTemplate({
  otp,
  validFor = '10 minutes',
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification - OTP</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f4f8;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        text-align: center;
      }
      .otp {
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 4px;
        margin: 20px 0;
        color: #2d3748;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Email Verification</h2>
      <p>Welcome to StudyNotion,</p>
      <p>Use the following One-Time Password (OTP) to verify your email with <strong> StudyNotion</strong>:</p>

      <div class="otp">${otp}</div>

      <p>This OTP is valid for <strong>${validFor}</strong>. Please do not share it with anyone.</p>

      <p>If you did not request this, you can safely ignore this email.</p>

      <p>Thanks,<br>The StudyNotion Team</p>

      <div class="footer">
        © 2025 StudyNotion. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = EmailVerificationOtpTemplate;

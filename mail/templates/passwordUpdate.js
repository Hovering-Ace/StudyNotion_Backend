function PasswordUpdatedTemplate({
  name,
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Updated</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f7fa;
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
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #777;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Changed Successfully</h2>
      <p>Hi ${name},</p>

      <p>This is to confirm that your password for your <strong>StudyNotion</strong> account was successfully updated.</p>

      <p>If you did not perform this action, please reset your password immediately or contact our support team.</p>

      <p>If you have any concerns, feel free to reach out at <a href="mailto:support@studynotion.in">support@studynotion.in</a>.</p>

      <p>Thanks,<br>The StudyNotion Team</p>

      <div class="footer">
        © 2025 StudyNotion. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = PasswordUpdate;

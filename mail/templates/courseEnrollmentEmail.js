function CourseEnrollmentEmail(
  name,
  courseName,
) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Course Enrollment Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f9fc;
        color: #333;
        padding: 20px;
      }
      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .button {
        background-color: #0066ff;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 6px;
        display: inline-block;
        margin-top: 20px;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>🎉 Welcome to the Course!</h2>
      <p>Hi ${name},</p>

      <p>We're excited to confirm your enrollment in the course:</p>

      <h3>${courseName}</h3>
     
      <p>If you have any questions, feel free to reach out to our support team.</p>

      <p>Happy learning!<br>The StudyNotion Team</p>

      <div class="footer">
        © 2025  StudyNotion . All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = CourseEnrollmentEmail;

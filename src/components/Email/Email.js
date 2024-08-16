function generateEmailContent(user) {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        .email-header {
            background: #e50914;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 4px solid #b81d24;
        }
        .email-body {
            padding: 20px;
            text-align: center;
        }
        .email-body h1 {
            margin: 0 0 10px;
            font-size: 24px;
        }
        .email-body p {
            margin: 0 0 20px;
            font-size: 16px;
            line-height: 1.5;
        }
        .email-body a {
            display: inline-block;
            font-size: 16px;
            color: #ffffff;
            background-color: #e50914;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
        }
        .email-footer {
            background: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Login Alert</h1>
        </div>
        <div class="email-body">
            <h1>We Noticed a Login</h1>
            <p>Hello, ${user.name}</p>
            <p>We detected a login to your account from a new device or browser. If this was you, no action is required. If you did not log in, please secure your account immediately.</p>
            <p>If you have any concerns or need assistance, please contact our support team.</p>
            <a href="https://support.google.com/contacts/?hl=en#topic=9160153">Contact Support</a>
        </div>
        <div class="email-footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

  `;
}

module.exports = { generateEmailContent };

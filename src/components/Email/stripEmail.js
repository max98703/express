function generateStripContent(user, intent){

    return `

    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f0f2f5;
      color: #333;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #ddd;
      max-width: 600px;
      margin: 20px auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center; /* Centered content */
    }
    .header {
      background-color: #4CAF50; /* Custom background color */
      color: #ffffff;
      padding: 15px;
      border-radius: 8px 8px 0 0;
    }
    .header img {
      width: 150px;
      height: auto;
      border-radius: 8px;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      margin: 0;
      font-size: 26px; /* Increased font size */
      color: #333;
    }
    .content p {
      margin: 10px 0;
      font-size: 16px; /* Consistent font size */
      color: #555;
    }
    .content a {
      color: #1a73e8;
      text-decoration: none;
      font-weight: bold; /* Added bold styling to the link */
    }
    .footer {
      text-align: center;
      font-size: 14px; /* Reduced font size for the footer */
      color: #777;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFHVxZMKfYxX6i4wIyCSuxb-c96ViqtIcpNA&s" alt="Company Logo">
    </div>
    <div class="content">
      <h2>Dear ${user.name},</h2>
      <p>Thank you for your payment. Your transaction was successful!</p>
      <p><strong>Transaction ID:</strong> ${intent.id}</p>
      <p><strong>Balance Transaction:</strong> ${intent.balance_transaction}</p>
      <p>You can view your receipt here: <a href="${intent.receipt_url}">Receipt Link</a></p>
    </div>
    <div class="footer">
      <p>We appreciate your business.</p>
      <p>Best regards,</p>
      <p>Your Company</p>
    </div>
  </div>
</body>
</html>

    `
}

module.exports = {generateStripContent }
function generateEmailContent(user) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333;">
      <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px;">
          <div style="background: #e50914; color: #ffffff; padding: 20px; text-align: center; border-bottom: 4px solid #b81d24;">
              <h1 style="margin: 0; font-size: 24px;">Your Account</h1>
          </div>
          <div style="padding: 20px; text-align: left;">
              <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px;">Hi ${user.name},</p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5;">
                  A new device signed in to your Omdb account, <a href="mailto:${user.email}" style="color: #e50914; text-decoration: none;">${user.email}</a>.
              </p>
              <div style="background-color: #f5f5f5; padding: 15px; border: 1px solid #dddddd; margin-top: 20px;">
                  <h2 style="font-size: 18px; margin: 0 0 10px 0;">The Details</h2>
                  <p style="font-size: 16px; margin: 5px 0;"><strong>Device:</strong> Web browser</p>
                  <p style="font-size: 16px; margin: 5px 0;"><strong>Location:</strong> ${user.geo.addressRegion}, ${user.geo.addressCountry}<br><span style="color: #888888;">(This location may not be exact.)</span></p>
                  <p style="font-size: 16px; margin: 5px 0;"><strong>Date:</strong> ${user.date}, ${user.geo.timeZone}</p>
              </div>
              <p style="margin-top: 20px; font-size: 16px;">If this was you or someone in your household, enjoy watching! Have you seen this one? <a href="http://localhost:3000" style="color: #e50914; text-decoration: none;">Fast X</a>.</p>
              <p style="font-size: 16px; margin-top: 20px;">If it was someone else, please remember that we only allow the people in your household to use your account.</p>
              <p style="font-size: 16px;">If you don’t know who it was, we recommend that you <a href="http://localhost:3000/password-reset" style="color: #e50914; text-decoration: none;">change your password</a> immediately to keep your account secure.</p>
          </div>
          <div style="background: #f4f4f4; text-align: center; padding: 10px; font-size: 14px; color: #888;">
              <p style="margin: 0;">&copy; 2024 Omdb. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
    `;
  }
  
  module.exports = { generateEmailContent };
  
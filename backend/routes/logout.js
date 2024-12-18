/* eslint no-undef: "off" */
const jwt = require("jsonwebtoken");
const express = require("express");
const { deleteTokens } = require("../utils/tokens.utils");
const UserLoginRepository = require("../db/repository/user-repository");
const { hashPassword, comparePasswords } = require("../services/service");
const { transporter } = require("../db/db");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

class LogoutRouter {
  constructor() {
    this.router = express.Router();
    this.userLoginRepository = new UserLoginRepository(); // Initialize the repository
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Logout route
    this.router.post("/logout", this.logout.bind(this), deleteTokens);
    this.router.post("/logout/alldevice", this.logoutAll.bind(this));
    this.router.post("/authenticateToken", this.authenticateToken.bind(this));
    this.router.post("/2fa/enable", this.enableTwoFactor.bind(this));
    this.router.post("/2fa/verify", this.verifyTwoFactor.bind(this));
    this.router.post("/2fa/disable", this.disableTwoFactor.bind(this));

    // Reset Password route
    this.router.post("/resetPassword", this.resetPassword.bind(this));
  }
  

   // Disable 2FA
   async disableTwoFactor(req, res) {
    try {
      // Fetch user from the database
      const user = await this.userLoginRepository.findById(req.user.user_id);
      if (!user) return res.status(404).json({ message: "User not found." });

      // Update 2FA fields
      user.twoFactorSecret = null; // Set the secret to null
      user.twoFactorEnabled = 0; // Set 2FA enabled to 0 (disabled)
      await user.save();

      res.status(200).json({ message: "Two-factor authentication has been disabled." });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "An error occurred while disabling 2FA." });
    }
  }


  async enableTwoFactor(req, res) {
    try {
      // Fetch user from the database
      const user = await this.userLoginRepository.findById(req.user.user_id);
      if (!user) return res.status(404).json({ message: "User not found." });
  
      // Check if 2FA is already enabled
      if (user.twoFactorEnabled) {
        return res.status(400).json({
          message: "Two-factor authentication is already enabled for this user.",
        });
      }
  
      // Check if a secret already exists
      if (user.twoFactorSecret) {
        // If a secret exists but 2FA isn't enabled yet, resend the QR code
        const qrCodeDataURL = await QRCode.toDataURL(
          speakeasy.otpauthURL({
            secret: user.twoFactorSecret,
            label: `MyApp (${req.user.email})`,
            encoding: "base32",
          })
        );
  
        return res.status(200).json({
          message:
            "Scan this QR code with your authenticator app. Enter the OTP to enable 2FA.",
          qrCode: qrCodeDataURL,
        });
      }
  
      // Generate a random 1-10 digit number
      const randomDigits = Math.floor(
        Math.random() * 10 ** Math.floor(Math.random() * 10 + 1)
      );
  
      // Combine user email and random digits for the 2FA secret
      const uniqueKey = `${req.user.email}-${randomDigits}`;
  
      // Generate a new 2FA secret with the unique key
      const secret = speakeasy.generateSecret({ name: `MyApp (${uniqueKey})` });
  
      // Save the secret but do not enable 2FA yet
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = false;
      await user.save();
  
      // Generate a QR code for Google Authenticator
      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
  
      res.status(200).json({
        message:
          "Scan this QR code with your authenticator app. Enter the OTP to enable 2FA.",
        qrCode: qrCodeDataURL,
      });
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      res
        .status(500)
        .json({ message: "An error occurred while enabling 2FA." });
    }
  }
  

  async verifyTwoFactor(req, res) {
    const { id, otp } = req.body;

    try {
      // Fetch user from the database
      const user = await this.userLoginRepository.findById(id);
      if (!user) return res.status(404).json({ message: "User not found." });
      
      // Verify the OTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 2, // Allow a small time window
      });

      if (!isValid) return res.status(400).json({ message: "Invalid OTP." });

      // Enable 2FA for the user
      user.twoFactorEnabled = true;
      await user.save();

      res.status(200).json({ message: "2FA enabled successfully." });
    } catch (error) {
      console.log("Error verifying 2FA:", error);
      res
        .status(500)
        .json({ message: "An error occurred while verifying 2FA." });
    }
  }
  // Verify token validity
  async authenticateToken(req, res) {
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ valid: false, message: "Token is required" });

    try {
      const decoded = jwt.verify(token, "d471145050e50e93b37eewfrweretfr");
      const user = await this.userLoginRepository.findById(decoded.user_id);

      if (!user || decoded.token_version !== user.token_version) {
        return res.status(401).json({ valid: false, message: "Invalid token" });
      }

      res.json({ valid: true });
    } catch (err) {
      const message =
        err instanceof jwt.TokenExpiredError
          ? "Token has expired"
          : "Internal server error";
      res
        .status(err instanceof jwt.TokenExpiredError ? 401 : 500)
        .json({ valid: false, message });
    }
  }

  // Logout from all devices
  async logoutAll(req, res) {
    try {
      const { user_id } = req.user;
      const user = await this.userLoginRepository.findById(user_id);

      if (!user) return res.status(404).json({ message: "User not found." });

      await this.userLoginRepository.update(user_id, {
        token_version: user.token_version + 1,
      });
      res
        .status(200)
        .json({ message: "Successfully logged out from all devices." });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "An error occurred during logout." });
    }
  }

  // Logout process
  logout(req, res, next) {
    req.auth = { user_id: req.user.user_id };
    next();
  }

  // Reset password
  async resetPassword(req, res) {
    const { id, oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required." });
    }

    try {
      const user = await this.userLoginRepository.findById(id);
      if (!user) return res.status(404).json({ message: "User not found." });

      const isPasswordCorrect = await comparePasswords(
        oldPassword,
        user.password
      );
      if (!isPasswordCorrect)
        return res.status(401).json({ message: "Old password is incorrect." });

      const hashedPassword = await hashPassword(newPassword);
      await this.userLoginRepository.update(user.id, {
        password: hashedPassword,
      });

      res.status(200).json({ message: "Password reset successfully." });

      process.nextTick(async () => {
        try {
          await this.sendResetNotification(user.email, user.name);
        } catch (error) {
          console.error("Error sending reset email:", error);
        }
      });
    } catch (error) {
      console.error("Reset error:", error);
      res
        .status(500)
        .json({ message: "An error occurred while resetting the password." });
    }
  }

  async sendResetNotification(email, name) {
    try {
      const mailOptions = {
        from: "maxTech12@gmail.com", // Your email address
        to: email, // The user's email address
        subject: "Password Reset Confirmation",
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation</title>
        <style>
          /* Global Styles */
          body.custom-body {
            background-color: #f3f4f6; /* Background similar to Tailwind's bg-gray-100 */
            color: #1f2937; /* Text color similar to Tailwind's text-gray-800 */
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }

          /* Main Container */
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          /* Header Section (Logo and Title) */
          .header {
            text-align: center;
            background-color: #1f2937; /* Tailwind's bg-gray-900 */
            padding: 30px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
          }

          .logo {
            width: 60px;
            margin-bottom: 20px;
          }

          .title {
            color: #ffffff; /* Text color similar to Tailwind's text-white */
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .sub-title {
            color: #e5e7eb; /* Tailwind's text-gray-200 */
            font-size: 14px;
          }

          /* Body Section */
          .body-content {
            background-color: #e5e7eb; /* Tailwind's bg-gray-200 */
            padding: 30px;
          }

          .confirmation-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          }

          .message {
            margin-bottom: 10px;
            font-size: 14px;
          }

          .cta-button-container {
            text-align: center;
            margin-top: 20px;
          }

          .cta-button {
            background-color: #3b82f6; /* Tailwind's bg-blue-500 */
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 500;
          }

          .cta-button:hover {
            background-color: #2563eb; /* Tailwind's bg-blue-400 on hover */
          }

          .thanks-message {
            margin-top: 30px;
          }

          .signature {
            margin-top: 10px;
            font-size: 14px;
          }

          /* Footer Section */
          .footer {
            background-color: #f3f4f6; /* Tailwind's bg-gray-100 */
            text-align: center;
            padding: 20px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            font-size: 12px;
          }
        </style>
      </head>
      <body class="custom-body">

        <!-- Main Container -->
        <div class="container">

          <!-- Header Section (Logo and Title) -->
          <div class="header">
            <img class="logo" src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Logo">
            <h1 class="title">Your Password has been Changed</h1>
            <p class="sub-title">Please login to your email account again.</p>
          </div>

          <!-- Body Section with Background Color -->
          <div class="body-content">
            <h2 class="confirmation-title">Password Change Confirmation</h2>
            <p class="message">Dear ${name},</p>
            <p class="message">This is to confirm that the password for your account has been successfully changed. Your account is now secured with the new password that you have set.</p>
            <p class="message">If you did not change your password, please contact us immediately to report any unauthorized access to your account.</p>
            <p class="message">If you have any issues or concerns regarding your account, please do not hesitate to contact our customer support team for further assistance.</p>

            <!-- Call to Action Button -->
            <div class="cta-button-container">
              <a href="#" class="cta-button">Go to My Account</a>
            </div>

            <p class="thanks-message">Thank you for using our service.</p>
            <p class="signature">Best regards,<br>[Your Name]</p>
          </div>

          <!-- Footer Section -->
          <div class="footer">
            &copy; 2000 MaxTech. All rights reserved.
          </div>
        </div>

        </body>
        </html>

      `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email.");
    }
  }
}

module.exports = new LogoutRouter().router;

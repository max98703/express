/* eslint no-undef: "off" */

const express = require("express");
const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");
const {
  generateToken,
  comparePasswords,
  sendResponse,
  sendOtpEmail,
} = require("../services/service");
const authenticateUser = require("../middleware/authenticateUser");
const UserLoginRepository = require("../db/repository/user-repository");
var { generateTokens, sendToken } = require("../utils/tokens.utils");
const rateLimitMiddleware  = require("../middleware/ratelimit"); 

class AuthRouter {
  constructor() {
    this.router = express.Router();
    // this.secret = process.env.SECRET_KEY || "some other secret as default";
    this.userRepository = new UserLoginRepository();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/login",
      rateLimitMiddleware,
      this.login.bind(this),
      generateTokens,
      sendToken
    );
    this.router.post(
      "/reset-password",
      authenticateUser,
      this.resetPassword.bind(this)
    );
    this.router.post("/verify-otp", rateLimitMiddleware,this.verifyOtp.bind(this), generateTokens,
    sendToken);
    this.router.post("/checkTokenValidity", this.checkTokenValidity.bind(this));
    this.router.post("/resend-otp", this.resendOtp.bind(this));
  }
  

  async resendOtp(req, res) {
    const { userId } = req.body;
  
    try {
      // Fetch user by ID
      const user = await this.userRepository.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Generate a new OTP
      const otp = await this.generateOtp(); // Generate 6-digit OTP
      const otpCreatedAt = new Date(); // Timestamp for OTP creation
  
      // Update OTP and its timestamp in the database
      await this.userRepository.update(user.id, { otp, otp_created_at: otpCreatedAt });
  
      // Send the new OTP to the user's email
      process.nextTick(async () => {
        try {
          await sendOtpEmail(user.email, otp);
        } catch (error) {
          console.log("Error sending email:", error);
        }
      });
  
      return res.status(200).json({
        success: true,
        message: "OTP has been resent to your email.",
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async verifyOtp(req,res,next){
    const { userId, otp } = req.body;
  
    try {
      // Fetch the user and the stored OTP
      const user = await this.userRepository.findById(userId);
  
      if (!user || !user.otp) {
        return res.status(400).json({ success: false, message: 'OTP not found for user.' });
      }

      if (typeof user.otp_created_at === 'string') {
        // If it's a string, convert it to a Date object
        otpCreatedAt = new Date(user.otp_created_at);
      } else if (user.otp_created_at instanceof Date) {
        // If it's already a Date object, use it directly
        otpCreatedAt = user.otp_created_at;
      } else {
        // If it's neither a string nor a Date object, log an error
        console.error("Invalid otp_created_at format");
        return res.status(400).json({ success: false, message: "Invalid OTP creation time format." });
      }
     
      const otpExpirationTime = otpCreatedAt.getTime() + 1 * 60 * 1000; // 1 minute = 60000 milliseconds
      console.log(otpExpirationTime);
      const currentTime = new Date().getTime();
      console.log(currentTime);
      // Check if the OTP has expired
      if (currentTime > otpExpirationTime) {
        return res.status(400).json({ success: false, message: 'OTP has expired.' });
      }
  
      // Verify the OTP
      if (otp !== user.otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
      }
      
      const token = user?.token || generateToken();
  
      const authData = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        token,
        googleLogin: user.googleLogin || 0,
        image: user.logo || picture,
        phoneNumber: user.phoneNumber || null,
        role: user.admin || null,
        token_version: user.token_version,
        twoFactorEnabled: user.twoFactorEnabled
      };
      
      req.auth = authData;

      next();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ success: false, message: 'Error verifying OTP.' });
    }
  }

  async login(req, res, next) {
    const { email, password, picture, id, name } = req.body;
  
    try {
      // Fetch the user by email or initialize variables
      let user = await this.userRepository.getUserByEmail(email);
      const token = user?.token || generateToken();
  
      if (id && !user) {
        // Insert new Google user if they don't exist
        await this.userRepository.insertUser({
          email,
          name,
          picture,
          googleLogin: 1,
          token
        });
        user = await this.userRepository.getUserByEmail(email); // Fetch newly inserted user
      }
  
      // Handle normal login
      if (!id && (!user || !(await comparePasswords(password, user.password)))) {
        return sendResponse(res, 401, false, "Invalid email or password");
      }
  
      // Prepare user data for the session
      const authData = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        token,
        googleLogin: user.googleLogin || 0,
        image: user.logo || picture,
        phoneNumber: user.phoneNumber || null,
        role: user.admin || null,
        token_version: user.token_version,
        twoFactorEnabled: user.twoFactorEnabled
      };
  
      // Handle 2FA if enabled
      if (!id && authData.twoFactorEnabled) {
        await this.handleTwoFactorAuth(user);
        return res.status(200).json({ message: "2FA enabled, please enter the OTP", redirectToOtp: true ,user:{email:authData.email,id:authData.user_id}});
      }
  
      // Attach user authentication data to the request
      req.auth = authData;
  
      // Proceed to the next middleware
      next();
    } catch (error) {
      console.error("Error during login:", error);
      return sendResponse(res, 500, false, "Internal Server Error");
    }
  }
  
  // Helper function to handle 2FA logic
  async handleTwoFactorAuth(user) {
    const otp = await this.generateOtp(); // Generate a 6-digit OTP
    const otpCreatedAt = new Date(); // Current timestamp for OTP creation
  
    // Update OTP and its timestamp in the database
    await this.userRepository.update(user.id, { otp, otp_created_at: otpCreatedAt });
  
    // Send OTP to user's email
    process.nextTick(async () => {
      try {
        await sendOtpEmail(user.email, otp);
      } catch (error) {
        console.log("Error sending email:", error);
      }
    });
  }
  
  async generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-digit OTP
  }



  async resetPassword(req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.user;

    if (!id) return sendResponse(res, 400, false, "User ID is required.");

    try {
      const user = await this.userRepository.getUserById(id);
      if (!user) return sendResponse(res, 404, false, "User not found.");
      if (!(await comparePasswords(currentPassword, user.password)))
        return sendResponse(res, 401, false, "Invalid current password.");
      if (newPassword !== confirmPassword)
        return sendResponse(
          res,
          400,
          false,
          "New password and confirm password do not match."
        );

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.updateUser({ id }, hashedPassword);

      return sendResponse(res, 200, true, "Password reset successful.");
    } catch (error) {
      console.error("Error during password reset:", error);
      return sendResponse(res, 500, false, "Internal Server Error");
    }
  }

  async checkTokenValidity(req, res) {
    const { token } = req.body;
    try {
      const user = await this.userRepository.getUserByEmail(token); // Adjust if token is not an email
      return sendResponse(
        res,
        user ? 200 : 401,
        !!user,
        user ? undefined : "Invalid token"
      );
    } catch (error) {
      console.error("Error during token validation:", error);
      return sendResponse(res, 500, false, "Internal Server Error");
    }
  }
}

module.exports = new AuthRouter().router;

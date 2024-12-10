/* eslint no-undef: "off" */

const express = require("express");
const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");
const {
  generateToken,
  comparePasswords,
  sendResponse,
} = require("../services/service");
const authenticateUser = require("../middleware/authenticateUser");
const UserLoginRepository = require("../db/repository/user-repository");
var { generateTokens, sendToken } = require("../utils/tokens.utils");
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
      this.login.bind(this),
      generateTokens,
      sendToken
    );
    this.router.post(
      "/reset-password",
      authenticateUser,
      this.resetPassword.bind(this)
    );
    this.router.post("/checkTokenValidity", this.checkTokenValidity.bind(this));
  }

  async login(req, res, next) {
    const { email, password, picture,id } = req.body;
  
    try {
      // Fetch the user by email
      const user = await this.userRepository.getUserByEmail(email);
      const token = user?.token || generateToken();
  
      if (id) {
        // Handle Google login
        if (!user) {
          // Insert new Google user if they don't exist
          await this.userRepository.insertUser(
            {
              email,
              name: req.body.name,
              picture,
              googleLogin: 1,
              token:token
            }
          );
        }
        // Fetch the inserted or existing Google user details
        const googleUser = user || (await this.userRepository.getUserByEmail(email));
  
        req.auth = {
          user_id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          token,
          googleLogin: googleUser.googleLogin,
          image: googleUser.logo || picture,
          phoneNumber: googleUser.phoneNumber || null,
          role: googleUser.admin || null,
        };
      } else {
        // Handle normal login
        if (!user || !(await comparePasswords(password, user.password))) {
          return sendResponse(res, 401, false, "Invalid credentials");
        }
  
        req.auth = {
          user_id: user.id,
          name: user.name,
          email: user.email,
          token,
          googleLogin: user.googleLogin,
          image: user.logo,
          phoneNumber: user.phoneNumber || null,
          role: user.admin || null,
        };
      }
  
      // Proceed to the next middleware with the authentication object
      next();
    } catch (error) {
      console.error("Error during login:", error);
      return sendResponse(res, 500, false, "Internal Server Error");
    }
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

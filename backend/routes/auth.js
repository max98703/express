/* eslint no-undef: "off" */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateToken, comparePasswords, sendLoginEmail, publishLoginSuccessNotification, sendResponse, eventLog } = require("../services/service");
const authenticateUser = require("../middleware/authenticateUser");
const UserRepository = require("../db/repository/user-repository");
const {APIError} = require("../utils/app-errors");

class AuthRouter {
  constructor() {
    this.router = express.Router();
    this.secret = process.env.SECRET_KEY || "some other secret as default";
    this.userRepository = new UserRepository(); 
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/login", this.login.bind(this));
    this.router.post("/reset-password", authenticateUser, this.resetPassword.bind(this));
    this.router.post("/checkTokenValidity", this.checkTokenValidity.bind(this));
  }

  async login(req, res) {
    const { email, password, id, picture, googleLogin } = req.body;
    const user = id ? await this.userRepository.getUserByGoogleId(id) : await this.userRepository.getUserByEmail(email);
    const token = user?.token || generateToken();

    try {
      if (id) {
        await (user
          ? this.userRepository.updateUser(req.body, token)
          : this.userRepository.insertUser({ ...req.body, googleLogin: 1 }, token));
      } else {
        if (!user || !(await comparePasswords(password, user.password))) {
          return sendResponse(res, 401, false, "Invalid credentials");
        }
      }

      const payload = {
        id: user?.id || id,
        name: user?.name || req.body.name,
        email,
        token,
        googleLogin: user?.googleLogin || googleLogin,
        logo: user?.logo || picture,
        phoneNumber: user?.phoneNumber || null,
        admin: user?.admin || null,
      };

      req.session.token = await jwt.sign(payload, this.secret, { expiresIn: 36000 });

      process.nextTick(async () => {
        try {
          await publishLoginSuccessNotification(payload);
          await sendLoginEmail(payload);
          await eventLog(req, payload);
        } catch (error) {
          throw new APIError("Something went wrong during post-login actions.", error);
        }
      });

      return sendResponse(res, 200, true, "Login successful and email sent", req.session.token);
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
      if (!(await comparePasswords(currentPassword, user.password))) return sendResponse(res, 401, false, "Invalid current password.");
      if (newPassword !== confirmPassword) return sendResponse(res, 400, false, "New password and confirm password do not match.");

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
      return sendResponse(res, user ? 200 : 401, !!user, user ? undefined : "Invalid token");
    } catch (error) {
      console.error("Error during token validation:", error);
      return sendResponse(res, 500, false, "Internal Server Error");
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = new AuthRouter().getRouter();

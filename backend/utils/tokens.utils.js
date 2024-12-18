/* eslint no-undef: "off" */

const jwt = require("jsonwebtoken");
const customId = require("custom-id");
const User_LoginRepository = require("../db/repository/UserLoginRepository");
const { sendLoginEmail, sendResponse } = require("../services/service");

class LoginService {
  constructor(req) {
    this.req = req;
    this.ip = this.getIpAddress();
    this.device = req.headers["user-agent"];
    this.user_id = req.auth.user_id;
    this.User_LoginRepository = new User_LoginRepository();
  }

  getIpAddress() {
    return (
      (this.req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
      this.req.connection.remoteAddress ||
      this.req.socket.remoteAddress ||
      this.req.connection.socket.remoteAddress
    );
  }

  async generateTokenId() {
    return customId({
      user_id: this.user_id,
      date: Date.now(),
      randomLength: 4,
    });
  }

  async generateTokenSecret() {
    return customId({
      token_secret: this.ip,
      date: Date.now(),
      randomLength: 8,
    });
  }

  async deletePreviousTokens() {
    const user_logins = await this.User_LoginRepository.findAll({
      where: { user_id: this.user_id, token_deleted: false, ip_address: this.ip, device: this.device },
    });

    await Promise.all(user_logins.map(login => {
      login.token_deleted = true;
      return login.save();
    }));
  }

  async createUserLogin(token_id, token_secret) {
    await this.User_LoginRepository.create({
      user_id: this.user_id,
      token_id,
      token_secret,
      ip_address: this.ip,
      device: this.device,
    });
  }

  async generateAccessToken(token_id) {
    const JWT_SECRET = "d471145050e50e93b37eewfrweretfr";  
  
    return jwt.sign(
      { ...this.req.auth, token_id },  
      JWT_SECRET,  
      { expiresIn: '1d' }  
    );
  }
  async deleteToken() {
    const latestLogin = await this.User_LoginRepository.findOne({
      where: { user_id: this.user_id, token_deleted: false, ip_address: this.ip, device: this.device },
      order: [["logged_in_at", "DESC"]],
    });

    if (latestLogin) {
      latestLogin.logged_out_at = new Date();
      latestLogin.logged_out = true;
      await latestLogin.save();
    }
  }
}

module.exports = {
  generateTokens: async (req, res, next) => {
    try {
      const loginService = new LoginService(req);

      const [token_id, token_secret] = await Promise.all([
        loginService.generateTokenId(),
        loginService.generateTokenSecret(),
      ]);

      await loginService.deletePreviousTokens();
      await loginService.createUserLogin(token_id, token_secret);

      req.token = await loginService.generateAccessToken(token_id);

      return next();
    } catch (error) {
      console.error("Error in token generation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  sendToken: (req, res) => {
    process.nextTick(async () => {
      try {
        await sendLoginEmail(req.auth);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });

    return sendResponse(res, 200, true, "You are logged in", req.token);
  },
  authenticate: (req, res) => {
    process.nextTick(async () => {
      try {
        await sendLoginEmail(req.auth);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });

    return sendResponse(res, 200, true, "You are logged in", req.token);
  },

  deleteTokens: async (req, res) => {
    try {
      const loginService = new LoginService(req);
      await loginService.deleteToken();
      return sendResponse(res, 200, true, "You are logged out");
    } catch (error) {
      console.error("Error in token deletion:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

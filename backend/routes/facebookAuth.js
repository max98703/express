const express = require("express");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const axios = require("axios");
const UserLoginRepository = require("../db/repository/user-repository");
var { generateTokens, authenticate } = require("../utils/tokens.utils");

const {
  generateToken,
} = require("../services/service");

class FacebookAuthController {
  constructor() {
    this.router = express.Router();
    this.userLoginRepository = new UserLoginRepository();

    this.initPassport(); // Initialize Passport strategy
    this.initMiddleware(); // Initialize middleware
    this.initRoutes(); // Initialize routes
  }

  // Middleware for Passport
  initMiddleware() {
    this.router.use(passport.initialize());
    this.router.use(passport.session());
  }

  // Initialize Passport strategy
  initPassport() {
    passport.use(
      new FacebookStrategy(
        {
          clientID: "1082538672269893", // Your Facebook App ID
          clientSecret: "534fea7996a731df868b13669ca45d31", // Your Facebook App Secret
          callbackURL: "http://localhost:5050/auth/facebook/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            return done(null, { accessToken, profile });
          } catch (error) {
            console.error("Error in Facebook Strategy:", error);
            return done(error, false);
          }
        }
      )
    );

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((obj, done) => {
      done(null, obj);
    });
  }

  // Initialize routes
  initRoutes() {
    this.router.get(
      "/auth/facebook",
      passport.authenticate("facebook", { scope: ["email", "public_profile"] })
    );

    this.router.get(
      "/auth/facebook/callback",
      passport.authenticate("facebook", { failureRedirect: 'http://localhost:3000/admin' }),
      this.facebookCallback.bind(this),
      generateTokens,
      authenticate,
    );
  }

  // Facebook Callback Handler
  async facebookCallback(req, res, next) {
    try {
      const { accessToken } = req.user;

      // Fetch additional user details from Facebook Graph API
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
      );
      const userData = response.data;

      // Fetch the user by email
      const user = await this.userLoginRepository.getUserByEmail(userData.email);

      const token = user?.token || generateToken();

      // If user doesn't exist, insert new user
      if (!user) {
        await this.userLoginRepository.insertUser({
          email: userData.email,
          name: userData.name,
          logo: userData.picture.data.url, // Accessing profile picture
          token: token
        });
      }

      // If user exists or just inserted, assign necessary data
      const facebookUser = user || await this.userLoginRepository.getUserByEmail(userData.email);

      req.auth = {
        user_id: facebookUser.id,
        name: facebookUser.name,
        email: facebookUser.email,
        token: token,
        facebookLogin: true,
        image: facebookUser.logo,
        phoneNumber: facebookUser.phoneNumber || null,
        role: facebookUser.role,
      };

      // Proceed to the next middleware with the authentication object
      next();


    } catch (error) {
      console.error("Error fetching user info from Facebook:", error);

      // Redirect to admin page in case of failure
      return res.redirect("/admin?error=facebook_auth_failed");
    }
  }
}

const facebookAuthController = new FacebookAuthController();
module.exports = facebookAuthController.router;

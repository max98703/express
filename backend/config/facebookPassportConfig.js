const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const axios = require('axios');

passport.use(new FacebookStrategy({
  clientID: '1082538672269893',
  clientSecret: '534fea7996a731df868b13669ca45d31',
  callbackURL: 'http://localhost:5000/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Access Token:", accessToken);
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const user = response.data;
    return done(null, user);
  } catch (error) {
    console.error("Error fetching user info from Facebook:", error);
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;

/* eslint no-undef: "off" */

const jwt = require('jsonwebtoken');
const UserLoginRepository = require('../db/repository/user-repository');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    console.log(token);
    // Verify the token
    const decoded = jwt.verify(token, "d471145050e50e93b37eewfrweretfr");

    // Fetch user from database
    const userLoginRepository = new UserLoginRepository();
    const user = await userLoginRepository.findById(decoded.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the token version matches
    if (decoded.token_version !== user.token_version) {
      return res.status(403).json({ message: 'Invalid token. Please log in again.' });
    }

    // Attach user information to the request
    req.user = decoded;
    next();
  } catch (err) {
    
     // Destroy session if token expired or invalid
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    // Check if the error is a TokenExpiredError
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }

    console.error('Error verifying token:', err);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;

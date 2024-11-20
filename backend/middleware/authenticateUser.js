/* eslint no-undef: "off" */

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
 
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, "d471145050e50e93b37eewfrweretfr" , (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;

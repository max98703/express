const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
        next(); 
    } else {
        res.status(403).json({ message: 'Origin not allowed by CORS' }); 
    }
}


module.exports = credentials;

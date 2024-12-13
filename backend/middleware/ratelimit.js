const rateLimit = require("express-rate-limit");

// Rate limit middleware: Block requests after 3 failed attempts within 1 minute.
const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 3, // Limit to 3 requests per IP per 1 minute
  message: {
    success: false,
    message: "You have exceeded your 3 attempts per minute limit. Please try again after 1 minute.",
  },
  headers: true,
});

module.exports = rateLimitMiddleware;

// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// moderate rate limiter for auth sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // limit each IP to 6 requests per windowMs
  message: "Too many requests from this IP, try again later.",
});

module.exports = { authLimiter };

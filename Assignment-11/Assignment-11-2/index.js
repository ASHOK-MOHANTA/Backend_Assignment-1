// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const { sendResetEmail } = require("./utils/email");
const { authLimiter } = require("./middleware/rateLimiter");

const app = express();
app.use(bodyParser.json());

// Connect to Mongo
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => console.log("Mongo connected"))
  .catch(err => { console.error(err); process.exit(1); });

/**
 * Helper: create JWT token (access token)
 */
function createJWT(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

/* -------------------------
   Signup
   POST /signup
   Accepts: { name, email, password }
---------------------------*/
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    // Ensure email uniqueness
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   Login
   POST /login
   Accepts: { email, password }
   Returns: { token }
---------------------------*/
app.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = createJWT(user);
    res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   Forgot Password
   POST /forgot-password
   Accepts: { email }
   Behavior: Always returns success message (no email enumeration)
---------------------------*/
app.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });

    // Find user (if any)
    const user = await User.findOne({ email });

    // Always respond with same message to avoid revealing if email exists
    const genericResponse = { message: "If an account with that email exists, a password reset link has been sent." };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate a secure token, store only hashed version in DB
    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Construct reset URL (frontend should have a route to accept token & new password)
    const clientUrl = process.env.CLIENT_RESET_URL || `http://localhost:${process.env.PORT || 3000}/reset-password`;
    const resetUrl = `${clientUrl}/${token}`;

    // send email (handle errors but do not reveal to client)
    try {
      await sendResetEmail({ to: user.email, resetUrl });
    } catch (emailErr) {
      console.error("Error sending reset email:", emailErr);
      // we do not return error to client — still generic response
    }

    res.json(genericResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   Reset Password
   POST /reset-password/:token
   Accepts: { password }
---------------------------*/
app.post("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Missing token or password" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // set new password (pre save hook will hash)
    user.password = password;
    // Invalidate reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Optionally: Issue a fresh JWT so user is logged in after reset
    const jwtToken = createJWT(user);
    res.json({ message: "Password reset successful", token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
  Simple protected route example
---------------------------*/
app.get("/protected", async (req, res) => {
  // expect Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Protected data", user: payload });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

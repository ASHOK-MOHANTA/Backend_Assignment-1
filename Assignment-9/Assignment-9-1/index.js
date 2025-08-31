const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authmiddleware");

app.use("/api/auth", authRoutes);

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to the protected route!", user: req.user });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  app.listen(5000, () => console.log("Server running on http://localhost:5000"));
})
.catch(err => console.error("MongoDB connection error:", err));

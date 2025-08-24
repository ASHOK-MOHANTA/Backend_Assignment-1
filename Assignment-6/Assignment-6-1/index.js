const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoutes");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/user-address", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1); // Exit process if DB not connected
  }
};

connectDB();

// Routes
app.use("/api", userRoute);

// Health check route
app.get("/", (req, res) => {
  res.send("User & Address Management API is running ");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

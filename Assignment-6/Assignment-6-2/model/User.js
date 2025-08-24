const mongoose = require("mongoose");
const validator = require("validator");

// Profile Schema
const profileSchema = new mongoose.Schema({
  profileName: {
    type: String,
    enum: ["fb", "twitter", "github", "instagram"],
    required: [true, "Profile name is required"],
  },
  url: {
    type: String,
    required: [true, "Profile URL is required"],
    validate: {
      validator: (v) => validator.isURL(v),
      message: "Invalid URL format",
    },
  },
});

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    profiles: [profileSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

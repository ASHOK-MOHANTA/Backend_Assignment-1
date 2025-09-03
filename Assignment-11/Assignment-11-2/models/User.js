// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // reset token fields:
  resetPasswordToken: String, // hashed token
  resetPasswordExpires: Date,
}, { timestamps: true });

// hash password before save if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// instance method to compare password
userSchema.methods.comparePassword = function (candidate) {
  const bcrypt = require("bcrypt");
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

// Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" },
  pincode: { type: String, required: true }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String},  
  email: {
    type: String,                          
    required: true,                         
    // unique: true,                          
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
  },
  age: { type: Number, min: 1 },
  addresses: [addressSchema]             
});

const User = mongoose.model("User", userSchema);
module.exports = User;

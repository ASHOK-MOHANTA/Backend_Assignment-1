const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema({
      houseNo: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String },
      teshil: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: Number, required: true },
      mobileNumber: { type: Number, required: true }
})

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number, min: 20, max: 90 }, // age is validated betwwen 20-90
  gender: { type: String, enum: ["male", "female"] },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: "pass123" },
  address: [addressSchema], //nested schema
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;


      
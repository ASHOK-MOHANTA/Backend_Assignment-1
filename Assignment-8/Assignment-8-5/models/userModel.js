import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);

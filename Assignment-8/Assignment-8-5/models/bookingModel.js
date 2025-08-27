import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  movieId: String,
  bookingDate: { type: Date, default: Date.now },
  seats: Number,
  status: { type: String, enum: ["Booked", "Cancelled"], default: "Booked" },
});

export default mongoose.model("Booking", bookingSchema);

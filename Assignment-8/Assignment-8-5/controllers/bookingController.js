import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import Movie from "../models/movieModel.js";

export const createBooking = async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    const user = await User.findById(userId);
    const movie = await Movie.findById(movieId);

    if (!user || !movie) {
      return res.status(400).json({ success: false, message: "Invalid User or Movie" });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

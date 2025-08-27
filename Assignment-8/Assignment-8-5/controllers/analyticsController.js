import Booking from "../models/bookingModel.js";

// 1. Total bookings & seats per movie
export const movieBookings = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $group: {
          _id: "$movieId",
          totalBookings: { $sum: 1 },
          totalSeats: { $sum: "$seats" },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. User booking history with movie titles
export const userBookings = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userName: "$user.name",
          movieTitle: "$movie.title",
          seats: 1,
          status: 1,
          bookingDate: 1,
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Top users (more than 2 bookings)
export const topUsers = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $group: { _id: "$userId", totalBookings: { $sum: 1 } } },
      { $match: { totalBookings: { $gt: 2 } } },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Genre-wise bookings (seats per genre)
export const genreWiseBookings = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $group: {
          _id: "$movie.genre",
          totalSeats: { $sum: "$seats" },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Active bookings with details
export const activeBookings = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { status: "Booked" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $project: {
          userName: "$user.name",
          movieTitle: "$movie.title",
          seats: 1,
          bookingDate: 1,
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import express from "express";
import {
  movieBookings,
  userBookings,
  topUsers,
  genreWiseBookings,
  activeBookings,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/movie-bookings", movieBookings);
router.get("/user-bookings", userBookings);
router.get("/top-users", topUsers);
router.get("/genre-wise-bookings", genreWiseBookings);
router.get("/active-bookings", activeBookings);

export default router;

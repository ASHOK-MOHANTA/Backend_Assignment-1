const express = require("express");
const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
  addTrip,
  updateTrip,
  deleteTrip,
  getVehiclesLongTrips,
  getVehiclesFromCities,
  getVehiclesAfterDate,
  getCarOrTruck,
  getTotalDistance
} = require("../controllers/vechilesCntroller");

const router = express.Router();

// Vehicle CRUD
router.post("/", createVehicle);
router.get("/", getVehicles);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

// Trip operations
router.post("/:id/trips", addTrip);
router.put("/:id/trips/:tripId", updateTrip);
router.delete("/:id/trips/:tripId", deleteTrip);

// Queries beyond CRUD
router.get("/query/long-trips", getVehiclesLongTrips);
router.get("/query/from-cities", getVehiclesFromCities);
router.get("/query/after-date", getVehiclesAfterDate);
router.get("/query/car-truck", getCarOrTruck);

// Bonus: total distance
router.get("/:id/total-distance", getTotalDistance);

module.exports = router;

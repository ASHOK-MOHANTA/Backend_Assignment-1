const Vehicle = require("../models/vechiles");

// A. Vehicle CRUD
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (error) {
    next(error);
  }
};

// B. Trip Operations
exports.addTrip = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.trips.push(req.body);
    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const { id, tripId } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const trip = vehicle.trips.id(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    Object.assign(trip, req.body);
    await vehicle.save();

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const { id, tripId } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    vehicle.trips.id(tripId).deleteOne();
    await vehicle.save();

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// Queries Beyond CRUD
exports.getVehiclesLongTrips = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ "trips.distance": { $gte: 200 } });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.getVehiclesFromCities = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({
      "trips.startLocation": { $in: ["Delhi", "Mumbai", "Bangalore"] }
    });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.getVehiclesAfterDate = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({
      "trips.startTime": { $gte: new Date("2024-01-01") }
    });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

exports.getCarOrTruck = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ type: { $in: ["car", "truck"] } });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// Bonus: total distance
exports.getTotalDistance = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.status(200).json({ totalDistance: vehicle.totalDistance() });
  } catch (error) {
    next(error);
  }
};

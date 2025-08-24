const mongoose = require("mongoose");

// Trip Subdocument Schema
const tripSchema = new mongoose.Schema({
  startLocation: { type: String, required: [true, "Start location is required"] },
  endLocation: { type: String, required: [true, "End location is required"] },
  distance: { 
    type: Number, 
    required: [true, "Distance is required"], 
    min: [1, "Distance must be greater than 0"] 
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ["car", "truck", "bike"], required: true },
  model: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  trips: [tripSchema]
});

// Custom Instance Method
vehicleSchema.methods.totalDistance = function () {
  return this.trips.reduce((sum, trip) => sum + trip.distance, 0);
};

module.exports = mongoose.model("Vehicle", vehicleSchema);

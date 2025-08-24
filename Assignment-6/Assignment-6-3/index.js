const express = require("express");
const connectDB = require("./config/db");
const vehicleRoutes = require("./routes/vechilesRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/vehicles", vehicleRoutes);

// Error Handler
app.use(errorHandler);

// DB + Server
connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const libraryRoutes = require("./routes/library.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/", libraryRoutes);

// Health
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Start
connectDB().then(() => {
  app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
});

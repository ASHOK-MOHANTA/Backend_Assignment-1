const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/api/users", userRoutes);


app.use(errorHandler);


connectDB();
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

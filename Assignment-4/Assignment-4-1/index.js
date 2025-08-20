const express = require("express");
const todoRoutes = require("./routes/todoRoutes");

const app = express();
app.use(express.json());

// routes
app.use("/todos", todoRoutes);

// 404 handling
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

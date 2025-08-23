const express = require("express");
const { createTask, getTasks, updateTask, deleteTasks } = require("../controllers/task.controller");
const validateTask = require("../middleware/task.middleware");

const router = express.Router();

router.post("/tasks", validateTask, createTask);
router.get("/tasks", getTasks);
router.patch("/tasks/:id", validateTask, updateTask);
router.delete("/tasks", deleteTasks);

module.exports = router;

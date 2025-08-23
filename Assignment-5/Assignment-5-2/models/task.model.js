const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], required: true },
  isCompleted: { type: Boolean, default: false },
  completionDate: { type: Date },
  dueDate: { type: Date },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

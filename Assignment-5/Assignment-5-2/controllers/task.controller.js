const Task = require("../models/task.model");

// ✅ Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ message: "❌ Title must be unique" });
    }

    const task = new Task({ title, description, priority, dueDate });
    await task.save();

    res.status(201).json({ message: "✅ Task Created", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Tasks (with optional filters)
const getTasks = async (req, res) => {
  try {
    const { priority, isCompleted } = req.query;
    let filter = {};

    if (priority) filter.priority = priority;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === "true";

    const tasks = await Task.find(filter);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    if (updates.isCompleted === true) {
      updates.completionDate = new Date();
    }

    const task = await Task.findByIdAndUpdate(id, updates, { new: true });

    if (!task) return res.status(404).json({ message: "❌ Task Not Found" });

    res.status(200).json({ message: "✅ Task Updated", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Tasks by Priority
const deleteTasks = async (req, res) => {
  try {
    const { priority } = req.query;
    if (!priority) {
      return res.status(400).json({ message: "❌ Priority required for deletion" });
    }

    const result = await Task.deleteMany({ priority });
    res.status(200).json({ message: "✅ Tasks Deleted", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTasks };

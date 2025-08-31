const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//  Create a Note
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = new Note({
      title,
      content,
      createdBy: req.user.id
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Error creating note", error: err.message });
  }
});

// Get all notes (only by logged-in user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.user.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes", error: err.message });
  }
});

// Update Note
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Error updating note", error: err.message });
  }
});

// Delete Note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found or not authorized" });

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note", error: err.message });
  }
});

module.exports = router;

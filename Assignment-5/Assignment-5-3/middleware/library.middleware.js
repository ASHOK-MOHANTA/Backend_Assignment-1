const LibraryItem = require("../models/library.model");

// Rs. 10 per overdue day
const FEE_PER_DAY = 10;

// ---- Validation for adding books ----
const validateCreateBook = (req, res, next) => {
  const { title, author } = req.body || {};
  if (!title || !author) {
    return res.status(400).json({ message: "Incomplete Data", missing: ["title", "author"] });
  }
  // Force defaults via logic (not schema enums)
  req.body.status = "available";
  req.body.borrowerName = null;
  req.body.borrowDate = null;
  req.body.dueDate = null;
  req.body.returnDate = null;
  req.body.overdueFees = 0;
  next();
};

// ---- Borrowing limit: max 3 active borrowed by same user ----
const enforceBorrowLimit = async (req, res, next) => {
  try {
    const { borrowerName } = req.body || {};
    if (!borrowerName) {
      return res.status(400).json({ message: "Incomplete Data", missing: ["borrowerName"] });
    }

    const activeCount = await LibraryItem.countDocuments({
      status: "borrowed",
      borrowerName
    });

    if (activeCount >= 3) {
      return res.status(409).json({
        message: "Borrowing limit exceeded. A user can borrow at most 3 books."
      });
    }

    next();
  } catch (err) {
    console.error("Borrow limit middleware error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---- Guard delete: cannot delete if currently borrowed ----
const guardDeleteIfBorrowed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await LibraryItem.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.status === "borrowed") {
      return res.status(409).json({
        message: "Cannot delete a borrowed book. Return it first."
      });
    }

    // attach for controller use if needed
    req.foundBook = book;
    next();
  } catch (err) {
    console.error("Guard delete error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---- Helper to compute overdue fees (used in controller) ----
const computeOverdueFees = (dueDate, returnedAt = new Date()) => {
  if (!dueDate) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((returnedAt - new Date(dueDate)) / msPerDay);
  return diff > 0 ? diff * FEE_PER_DAY : 0;
};

module.exports = {
  validateCreateBook,
  enforceBorrowLimit,
  guardDeleteIfBorrowed,
  computeOverdueFees
};

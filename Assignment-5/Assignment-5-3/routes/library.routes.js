const express = require("express");
const {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  deleteBook
} = require("../controllers/library.controller");

const {
  validateCreateBook,
  enforceBorrowLimit,
  guardDeleteIfBorrowed
} = require("../middleware/library.middleware");

const router = express.Router();

// Add a new book
router.post("/library/books", validateCreateBook, addBook);

// Retrieve all books (optional filters: ?status=&title=)
router.get("/library/books", getBooks);

// Borrow a book
router.patch("/library/borrow/:id", enforceBorrowLimit, borrowBook);

// Return a book
router.patch("/library/return/:id", returnBook);

// Delete a book (only if not borrowed)
router.delete("/library/books/:id", guardDeleteIfBorrowed, deleteBook);

module.exports = router;

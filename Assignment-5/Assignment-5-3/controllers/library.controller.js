const LibraryItem = require("../models/library.model");
const { computeOverdueFees } = require("../middleware/library.middleware");

// POST /library/books
const addBook = async (req, res) => {
  try {
    const book = await LibraryItem.create(req.body);
    return res.status(201).json({ message: "Book added", data: book });
  } catch (err) {
    console.error("Add book error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /library/books?status=...&title=...
const getBooks = async (req, res) => {
  try {
    const { status, title } = req.query || {};
    const filter = {};
    if (status) filter.status = status;
    if (title) filter.title = { $regex: title, $options: "i" };

    const books = await LibraryItem.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ count: books.length, data: books });
  } catch (err) {
    console.error("Get books error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /library/borrow/:id
const borrowBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { borrowerName } = req.body;

    const book = await LibraryItem.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.status !== "available") {
      return res.status(409).json({ message: `Book is not available (current status: ${book.status})` });
    }

    const now = new Date();
    const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days

    book.status = "borrowed";
    book.borrowerName = borrowerName;
    book.borrowDate = now;
    book.dueDate = due;
    book.returnDate = null; // clear previous if any

    await book.save();

    return res.status(200).json({
      message: "Book borrowed",
      data: {
        _id: book._id,
        title: book.title,
        borrowerName: book.borrowerName,
        borrowDate: book.borrowDate,
        dueDate: book.dueDate,
        status: book.status
      }
    });
  } catch (err) {
    console.error("Borrow book error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /library/return/:id
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await LibraryItem.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.status !== "borrowed") {
      return res.status(409).json({ message: `Cannot return: book status is ${book.status}` });
    }

    const returnedAt = new Date();
    const fee = computeOverdueFees(book.dueDate, returnedAt);

    book.status = "available";
    book.returnDate = returnedAt;
    book.overdueFees = fee; // store last computed fee (not cumulative)
    book.borrowerName = null;
    book.borrowDate = null;
    book.dueDate = null;

    await book.save();

    return res.status(200).json({
      message: "Book returned",
      data: {
        _id: book._id,
        title: book.title,
        returnDate: book.returnDate,
        overdueFees: book.overdueFees,
        status: book.status
      }
    });
  } catch (err) {
    console.error("Return book error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /library/books/:id
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // guardDeleteIfBorrowed middleware ensures not borrowed
    const deleted = await LibraryItem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });

    return res.status(200).json({ message: "Book deleted", data: deleted });
  } catch (err) {
    console.error("Delete book error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addBook,
  getBooks,
  borrowBook,
  returnBook,
  deleteBook
};

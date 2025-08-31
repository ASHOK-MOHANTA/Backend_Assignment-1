const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    author: { type: String, required: true },

    // business logic will ensure these string statuses
    status: { type: String, default: "available" }, // "available" | "borrowed" | "reserved"

    borrowerName: { type: String, default: null },
    borrowDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    overdueFees: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const LibraryItem = mongoose.model("LibraryItem", librarySchema);
module.exports = LibraryItem;

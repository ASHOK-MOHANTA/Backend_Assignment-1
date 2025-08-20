const express = require("express");
const {
  getTodos,
  searchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoControllers");

const router = express.Router();

router.get("/", getTodos);
router.get("/search", searchTodos);
router.post("/", addTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;

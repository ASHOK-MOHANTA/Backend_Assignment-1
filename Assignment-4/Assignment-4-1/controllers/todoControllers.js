const { readDB, writeDB } = require("../model/todomodel");

// Get all todos
function getTodos(req, res) {
  const todos = readDB();
  res.json(todos);
}

// Search todos (partial search, case-insensitive)
function searchTodos(req, res) {
  const q = req.query.q?.toLowerCase() || "";
  const todos = readDB();
  const results = todos.filter(todo => todo.title.toLowerCase().includes(q));
  res.json(results);
}

// Add todo
function addTodo(req, res) {
  const { title, completed = false } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const todos = readDB();
  const newTodo = { id: Date.now(), title, completed };
  todos.push(newTodo);
  writeDB(todos);

  res.status(201).json(newTodo);
}

// Update todo by id
function updateTodo(req, res) {
  const { id } = req.params;
  const { title, completed } = req.body;

  const todos = readDB();
  const todo = todos.find(t => t.id == id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;

  writeDB(todos);
  res.json(todo);
}

// Delete todo by id
function deleteTodo(req, res) {
  const { id } = req.params;
  let todos = readDB();
  const index = todos.findIndex(t => t.id == id);

  if (index === -1) return res.status(404).json({ error: "Todo not found" });

  const deleted = todos.splice(index, 1);
  writeDB(todos);

  res.json(deleted[0]);
}

module.exports = {
  getTodos,
  searchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
};

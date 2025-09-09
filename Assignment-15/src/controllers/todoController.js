const Todo = require('../models/todo');
const { success } = require('../utils/response');

async function getTodos(req, res, next) {
  try {
    const todos = await Todo.find({ user: req.user.id });
    return success(res, todos, 'Fetched todos');
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos };

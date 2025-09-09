const express = require('express');
const router = express.Router();
const { getTodos } = require('../controllers/todoController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getTodos);

module.exports = router;

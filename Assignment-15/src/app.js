const express = require('express');
const app = express();
const todoRoutes = require('./routes/todoRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);


app.get('/health', (req, res) => res.json({ status: 'ok' }));


app.use(errorHandler);

module.exports = app;

function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const payload = { success: false, message };
  if (process.env.NODE_ENV !== 'production') {
    payload.error = err.stack;
  }

  res.status(status).json(payload);
}

module.exports = errorHandler;

function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function fail(res, message = 'Error', status = 400, data = null) {
  return res.status(status).json({ success: false, data, message });
}

module.exports = { success, fail };

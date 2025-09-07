exports.requireRole = (...allowedRoles) => (req, res, next) => {
  // req.user should be set by verifyToken
  const userRoles = req.user?.roles || [];
  const hasRole = userRoles.some(role => allowedRoles.includes(role));
  if (!hasRole) return res.status(403).json({ message: 'Forbidden. Insufficient role.' });
  next();
};

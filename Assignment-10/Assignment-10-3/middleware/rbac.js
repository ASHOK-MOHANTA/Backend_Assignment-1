export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
};

// require subscription tier: premium or pro (for premium content)
export const requireSubscription = (...plansAllowed) => {
  return (req, res, next) => {
    // treat expired or inactive as free
    const active = req.user.subscriptionActive;
    const plan = active && req.user.subscriptionPlan ? req.user.subscriptionPlan : 'free';
    if (!plansAllowed.includes(plan)) return res.status(403).json({ error: 'Subscription plan insufficient' });
    next();
  };
};

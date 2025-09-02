import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /subscribe
 * body: { plan: 'premium'|'pro' }
 * User purchases subscription. Sets subscriptionActive true and expiresAt = now + 30 days
 */
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['premium', 'pro'].includes(plan)) return res.status(400).json({ error: 'Invalid plan. Allowed: premium, pro' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    user.subscriptionPlan = plan;
    user.subscriptionActive = true;
    user.subscriptionExpiresAt = expiresAt;

    await user.save();

    res.json({ message: 'Subscribed', subscriptionPlan: plan, subscriptionExpiresAt: expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Subscribe failed' });
  }
});

/**
 * GET /subscription-status
 */
router.get('/subscription-status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If subscriptionActive but expired, treat as expired (cron should also handle)
    let active = Boolean(user.subscriptionActive);
    if (active && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
      active = false;
    }

    res.json({
      subscriptionPlan: active ? user.subscriptionPlan : 'free',
      subscriptionActive: active,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

/**
 * PATCH /renew
 * body: { plan } (optional - renew same plan or change)
 */
router.patch('/renew', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If user had active subscription and plan not changed, extend by 30 days from existing expiry if still active, else from now
    const newPlan = plan && ['premium', 'pro'].includes(plan) ? plan : user.subscriptionPlan;
    if (!['premium', 'pro'].includes(newPlan)) return res.status(400).json({ error: 'Invalid plan to renew' });

    const now = new Date();
    const base = (user.subscriptionActive && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > now) ? new Date(user.subscriptionExpiresAt) : now;
    const expiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.subscriptionPlan = newPlan;
    user.subscriptionActive = true;
    user.subscriptionExpiresAt = expiresAt;

    await user.save();
    res.json({ message: 'Subscription renewed', subscriptionPlan: newPlan, subscriptionExpiresAt: expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Renew failed' });
  }
});

/**
 * POST /cancel-subscription
 */
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.subscriptionPlan = 'free';
    user.subscriptionActive = false;
    user.subscriptionExpiresAt = null;
    await user.save();

    res.json({ message: 'Subscription cancelled. Downgraded to free.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancel failed' });
  }
});

export default router;

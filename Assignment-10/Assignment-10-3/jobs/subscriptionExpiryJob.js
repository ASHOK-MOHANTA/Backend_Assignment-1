import cron from 'node-cron';
import User from '../models/User.js';

/**
 * Runs periodically to auto-downgrade expired subscriptions.
 * Default schedule: every 30 minutes (configured in .env CRON_EXPIRE_CHECK) or fallback hourly.
 */
export const startExpiryJob = (cronExpr) => {
  const expr = cronExpr || '0 * * * *'; // default every hour
  console.log('⏱️ Starting subscription expiry job with cron:', expr);

  cron.schedule(expr, async () => {
    try {
      const now = new Date();
      const expiredUsers = await User.find({ subscriptionActive: true, subscriptionExpiresAt: { $lte: now } });
      if (!expiredUsers.length) return;

      const ops = expiredUsers.map(u => {
        u.subscriptionPlan = 'free';
        u.subscriptionActive = false;
        u.subscriptionExpiresAt = null;
        return u.save();
      });
      await Promise.all(ops);
      console.log(`🔁 Auto-downgraded ${expiredUsers.length} user(s) due to subscription expiry.`);
    } catch (err) {
      console.error('Expiry job failed', err);
    }
  });
};

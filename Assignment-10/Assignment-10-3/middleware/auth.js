import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/BlacklistedToken.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Missing Bearer token' });

    const token = match[1];

    // Check blacklist for access token
    const black = await BlacklistedToken.findOne({ token, type: 'access' });
    if (black) return res.status(401).json({ error: 'Token blacklisted' });

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ error: 'User not found' });

    // attach minimal user info
    req.user = { id: user._id.toString(), role: user.role, subscriptionPlan: user.subscriptionPlan, subscriptionActive: user.subscriptionActive, subscriptionExpiresAt: user.subscriptionExpiresAt };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Auth failed' });
  }
};

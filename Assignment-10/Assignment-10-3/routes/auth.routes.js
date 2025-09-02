import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import BlacklistedToken from '../models/BlacklistedToken.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * POST /auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'username, email, password required' });

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ error: 'User/email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      subscriptionPlan: 'free',
      subscriptionActive: false,
      subscriptionExpiresAt: null
    });

    res.status(201).json({ message: 'User created', user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

/**
 * POST /auth/login
 * returns accessToken and refreshToken
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { sub: user._id.toString(), role: user.role };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ sub: user._id.toString() });

    // Save refresh token and expiry on user (simple rotation)
    const decodedRefresh = jwt.decode(refreshToken);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(decodedRefresh.exp * 1000);
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan, subscriptionActive: user.subscriptionActive, subscriptionExpiresAt: user.subscriptionExpiresAt }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/logout
 * body: { accessToken, refreshToken }
 * Blacklist both tokens and clear saved refreshToken on user
 */
router.post('/logout', async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;
    if (!accessToken && !refreshToken) return res.status(400).json({ error: 'accessToken or refreshToken required' });

    const ops = [];

    if (accessToken) {
      // try decode to get expiry
      try {
        const dec = jwt.decode(accessToken);
        const exp = dec?.exp ? new Date(dec.exp * 1000) : undefined;
        ops.push(BlacklistedToken.create({ token: accessToken, type: 'access', expiresAt: exp }));
      } catch (e) {
        // still blacklist even if decode fails
        ops.push(BlacklistedToken.create({ token: accessToken, type: 'access' }));
      }
    }

    if (refreshToken) {
      try {
        const dec = jwt.decode(refreshToken);
        const exp = dec?.exp ? new Date(dec.exp * 1000) : undefined;
        ops.push(BlacklistedToken.create({ token: refreshToken, type: 'refresh', expiresAt: exp }));

        // if refresh token valid, remove from user's saved refreshToken
        let decoded;
        try {
          decoded = verifyRefreshToken(refreshToken);
          const userId = decoded.sub;
          const user = await User.findById(userId);
          if (user && user.refreshToken === refreshToken) {
            user.refreshToken = null;
            user.refreshTokenExpiresAt = null;
            await user.save();
          }
        } catch (_) {
          // ignore invalid refresh token decode
        }
      } catch (e) {
        ops.push(BlacklistedToken.create({ token: refreshToken, type: 'refresh' }));
      }
    }

    await Promise.all(ops);
    res.json({ message: 'Logged out (tokens blacklisted)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * POST /auth/refresh
 * body: { refreshToken }
 * returns new accessToken if refreshToken valid and not blacklisted
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });

    // check blacklist
    const black = await BlacklistedToken.findOne({ token: refreshToken, type: 'refresh' });
    if (black) return res.status(401).json({ error: 'Refresh token blacklisted' });

    // verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid/expired refresh token' });
    }

    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    // check stored refresh token matches (simple anti-replay)
    if (user.refreshToken !== refreshToken) return res.status(401).json({ error: 'Refresh token mismatch' });

    // issue new access token (do not automatically rotate refresh token here; could be implemented)
    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

export default router;

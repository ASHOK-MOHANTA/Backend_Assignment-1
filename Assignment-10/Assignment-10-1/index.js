require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  JWT_SECRET,
  MONGODB_URI,
  SERVER_ROOT_URL,
  PORT = 4000
} = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !JWT_SECRET || !MONGODB_URI || !SERVER_ROOT_URL) {
  console.error('Missing required env vars. Check .env');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.get('/auth/github', (req, res) => {
  const state = Math.random().toString(36).slice(2); // simple state; to be improved in production
  // Save state in cookie for CSRF checking (in production, use secure cookie and proper session store)
  res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax' });

  const redirectUrl = `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&scope=${encodeURIComponent('read:user user:email')}` +
    `&state=${encodeURIComponent(state)}`;
  res.redirect(redirectUrl);
});


app.get('/auth/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const cookieState = req.cookies['oauth_state'];

    // Basic CSRF/state check
    if (!code || !state || !cookieState || state !== cookieState) {
      return res.status(400).json({ error: 'Invalid OAuth state or missing code' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${SERVER_ROOT_URL}/auth/github/callback`,
        state
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const tokenData = tokenResponse.data;
    if (tokenData.error) {
      return res.status(400).json({ error: 'Token exchange failed', details: tokenData });
    }
    const accessToken = tokenData.access_token;

    // Fetch GitHub user profile
    const userResp = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-jwt-login-app'
      }
    });

    const emailsResp = await axios.get('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-jwt-login-app'
      }
    });

    const ghUser = userResp.data;
    const ghEmails = Array.isArray(emailsResp.data) ? emailsResp.data : [];

    // choose primary, verified email if present
    let email = null;
    const primary = ghEmails.find(e => e.primary && e.verified);
    if (primary) email = primary.email;
    else {
      const verified = ghEmails.find(e => e.verified);
      if (verified) email = verified.email;
      else if (ghUser.email) email = ghUser.email; // sometimes public email
    }

    // Upsert user into MongoDB
    const filter = { githubId: String(ghUser.id) };
    const update = {
      githubId: String(ghUser.id),
      username: ghUser.login,
      email,
      avatar: ghUser.avatar_url,
      name: ghUser.name || ghUser.login
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // findOneAndUpdate returns the old doc by default; using findOne then update to get fresh doc
    let user = await User.findOne(filter);
    if (!user) {
      user = await User.create(update);
    } else {
      // update fields if changed
      user.username = update.username;
      user.email = update.email;
      user.avatar = update.avatar;
      user.name = update.name;
      await user.save();
    }

    // Generate JWT
    const payload = {
      sub: user._id.toString(),
      githubId: user.githubId,
      username: user.username
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        githubId: user.githubId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Callback error', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
});

// Protected example route
app.get('/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'Malformed token' });

  const token = match[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on ${SERVER_ROOT_URL} (port ${PORT})`));

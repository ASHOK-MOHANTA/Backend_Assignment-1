import { Router } from 'express';
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(401).json({ error: 'Invalid credentials' });


const payload = { sub: user._id.toString(), role: user.role, username: user.username };
const accessToken = signAccessToken(payload);
const refreshToken = signRefreshToken({ sub: user._id.toString() });


// Save refresh info on user (rotation)
const decoded = verifyRefresh(refreshToken);
user.refreshToken = refreshToken;
user.refreshTokenExpiresAt = new Date(decoded.exp * 1000);
await user.save();


res.json({
accessToken,
refreshToken,
user: { id: user._id, username: user.username, email: user.email, role: user.role }
});
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Login failed' });
}
});


// POST /refresh
router.post('/refresh', async (req, res) => {
try {
const { refreshToken } = req.body;
if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });


const decoded = verifyRefresh(refreshToken);
const user = await User.findById(decoded.sub);
if (!user || user.refreshToken !== refreshToken) {
return res.status(401).json({ error: 'Invalid refresh token' });
}


// Issue new access token (15m)
const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, username: user.username });
res.json({ accessToken });
} catch (err) {
console.error(err);
return res.status(401).json({ error: 'Invalid/expired refresh token' });
}
});


// POST /logout (optional) – revoke refresh token
router.post('/logout', async (req, res) => {
try {
const { refreshToken } = req.body;
if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });
try {
const { sub } = verifyRefresh(refreshToken);
const user = await User.findById(sub);
if (user && user.refreshToken === refreshToken) {
user.refreshToken = null;
user.refreshTokenExpiresAt = null;
await user.save();
}
} catch (_) {}
res.json({ message: 'Logged out' });
} catch (err) {
res.status(500).json({ error: 'Logout failed' });
}
});


export default router;
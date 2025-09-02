import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const authenticate = async (req, res, next) => {
try {
const auth = req.headers.authorization || '';
const match = auth.match(/^Bearer (.+)$/);
if (!match) return res.status(401).json({ error: 'Missing Bearer token' });


const token = match[1];
const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const user = await User.findById(decoded.sub).lean();
if (!user) return res.status(401).json({ error: 'User not found' });


req.user = { id: user._id.toString(), role: user.role, username: user.username };
next();
} catch (err) {
return res.status(401).json({ error: 'Invalid/expired token' });
}
};


export const requireRole = (...roles) => (req, res, next) => {
if (!req.user || !roles.includes(req.user.role)) {
return res.status(403).json({ error: 'Forbidden' });
}
next();
};
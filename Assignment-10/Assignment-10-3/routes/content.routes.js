import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requireSubscription } from '../middleware/rbac.js';
import mongoose from 'mongoose';

const router = express.Router();

// Minimal in-memory content store for demo. Replace with DB model for production.
const Content = {
  items: [],
  create: function (data) {
    const id = new mongoose.Types.ObjectId().toString();
    const item = { id, ...data, createdAt: new Date() };
    this.items.push(item);
    return item;
  },
  listFree: function () {
    return this.items.filter(i => i.category === 'free');
  },
  listPremium: function () {
    return this.items.filter(i => i.category === 'premium' || i.category === 'free');
  },
  delete: function (id) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    const [removed] = this.items.splice(idx, 1);
    return removed;
  }
};

/**
 * GET /content/free
 * public route (but auth optional). We'll return free content to anyone.
 */
router.get('/free', (req, res) => {
  res.json({ content: Content.listFree() });
});

/**
 * GET /content/premium
 * require subscription premium or pro
 */
router.get('/premium', authenticate, requireSubscription('premium', 'pro'), (req, res) => {
  res.json({ content: Content.listPremium() });
});

/**
 * POST /content (admin only)
 * body: { title, body, category: 'free'|'premium' }
 */
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  try {
    const { title, body, category } = req.body;
    if (!title || !body || !['free', 'premium'].includes(category)) return res.status(400).json({ error: 'title, body, category required' });

    const item = Content.create({ title, body, category, createdBy: req.user.id });
    res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed' });
  }
});

/**
 * DELETE /content/:id (admin only)
 */
router.delete('/:id', authenticate, requireRole('admin'), (req, res) => {
  try {
    const removed = Content.delete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: removed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;

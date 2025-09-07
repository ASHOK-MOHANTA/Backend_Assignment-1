const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { body, validationResult } = require('express-validator');

// Create resource: allowed for admin and moderator and user (customize)
router.post('/', verifyToken, requireRole('admin','moderator','user'), [
  body('title').notEmpty()
], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const resource = new Resource({ ...req.body, createdBy: req.user.id });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) { res.status(500).send('Server error'); }
});

// Read all — maybe only admin/moderator
router.get('/', verifyToken, requireRole('admin','moderator'), async (req, res) => {
  const resources = await Resource.find().populate('createdBy', 'name email');
  res.json(resources);
});

// Read single — allowed for any authenticated user
router.get('/:id', verifyToken, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });
  res.json(resource);
});

// Update — allow owner or admin/moderator
router.put('/:id', verifyToken, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });

  const isOwner = String(resource.createdBy) === req.user.id;
  const isPrivileged = req.user.roles?.some(r => ['admin','moderator'].includes(r));

  if (!isOwner && !isPrivileged) return res.status(403).json({ message: 'Forbidden' });

  Object.assign(resource, req.body);
  await resource.save();
  res.json(resource);
});

// Delete — admin or owner
router.delete('/:id', verifyToken, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Not found' });

  const isOwner = String(resource.createdBy) === req.user.id;
  const isAdmin = req.user.roles?.includes('admin');

  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

  await resource.remove();
  res.json({ message: 'Deleted' });
});

module.exports = router;

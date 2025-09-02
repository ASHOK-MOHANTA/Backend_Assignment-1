import { Router } from 'express';
try {
const { serviceName, requestedAt } = req.body;
if (!serviceName || !requestedAt) return res.status(400).json({ error: 'serviceName and requestedAt are required' });


const booking = await Booking.create({
user: req.user.id,
serviceName,
requestedAt: new Date(requestedAt),
status: 'pending'
});


res.status(201).json({ booking });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Create booking failed' });
}
});


// Get bookings – user: own, admin: all
router.get('/', authenticate, async (req, res) => {
try {
const filter = req.user.role === 'admin' ? {} : { user: req.user.id };
const bookings = await Booking.find(filter).sort({ createdAt: -1 }).populate('user', 'username email role');
res.json({ bookings });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Fetch bookings failed' });
}
});


// Update booking (only owner, only if pending)
router.put('/:id', authenticate, async (req, res) => {
try {
const { id } = req.params;
const { serviceName, requestedAt } = req.body;


const booking = await Booking.findById(id);
if (!booking) return res.status(404).json({ error: 'Not found' });
if (booking.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not your booking' });
if (booking.status !== 'pending') return res.status(400).json({ error: 'Only pending bookings can be updated' });


if (serviceName) booking.serviceName = serviceName;
if (requestedAt) booking.requestedAt = new Date(requestedAt);
await booking.save();


res.json({ booking });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Update failed' });
}
});


// Cancel booking (only owner, only if pending) – set status to cancelled
router.delete('/:id', authenticate, async (req, res) => {
try {
const { id } = req.params;
const booking = await Booking.findById(id);
if (!booking) return res.status(404).json({ error: 'Not found' });
// If admin calls this endpoint, treat as hard delete (see
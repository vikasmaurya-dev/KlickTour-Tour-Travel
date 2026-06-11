import express from 'express';
import Contact from '../models/Contact.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/contact — Submit a contact message
router.post('/', async (req, res) => {
  try {
    const newMsg = new Contact(req.body);
    const saved = await newMsg.save();
    res.status(201).json({ message: 'Message sent successfully!', contact: saved });
  } catch (err) {
    res.status(400).json({ message: 'Failed to send message', error: err.message });
  }
});

// GET /api/contact — List all messages (admin use)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

// PATCH /api/contact/:id/read — Mark message as read
router.patch('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Message not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update message', error: err.message });
  }
});

export default router;

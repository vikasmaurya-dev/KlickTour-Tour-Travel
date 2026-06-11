import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist', error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { itemType, itemId, title, image, price, meta } = req.body;
    if (!itemType || !itemId || !title) {
      return res.status(400).json({ success: false, message: 'Wishlist item details are required' });
    }

    const filter = { userId: req.user._id, itemType, itemId };
    const existing = await Wishlist.findOne(filter);
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, data: null, saved: false, message: 'Removed from wishlist' });
    }

    const item = await Wishlist.create({
      userId: req.user._id,
      itemType,
      itemId,
      title,
      image,
      price,
      meta,
    });
    res.status(201).json({ success: true, data: item, saved: true, message: 'Added to wishlist' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update wishlist', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Wishlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    res.json({ success: true, data: null, message: 'Wishlist item removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to remove wishlist item', error: err.message });
  }
});

export default router;

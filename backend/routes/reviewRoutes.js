import express from 'express';
import Review from '../models/Review.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createLog } from '../utils/logger.js';

const router = express.Router();

// Get all reviews for admin
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
});

router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const reviews = await Review.find({ targetType, targetId }).sort({ createdAt: -1 });
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        count: reviews.length,
        averageRating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Review details are required' });
    }

    const review = await Review.findOneAndUpdate(
      { userId: req.user._id, targetType, targetId },
      {
        userId: req.user._id,
        targetType,
        targetId,
        userName: req.user.name,
        rating,
        comment,
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    await createLog({
      user: req.user._id,
      action: 'Review Posted',
      category: 'Review',
      details: `User posted a ${review.rating}-star review for ${review.targetType} ${review.targetId}`,
      status: 'success'
    }, req);

    res.status(201).json({ success: true, data: review, message: 'Review saved successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to save review', error: err.message });
  }
});

// Delete review (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (deleted) {
      await createLog({
        user: req.user._id,
        action: 'Review Deletion',
        category: 'Admin',
        details: `Administrator deleted review from ${deleted.userName} for ${deleted.targetType} ${deleted.targetId}`,
        status: 'warning'
      }, req);
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete review', error: err.message });
  }
});

export default router;

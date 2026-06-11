import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { createLog } from '../utils/logger.js';

const router = express.Router();

const calculateDiscount = (coupon, amount) => {
  if (coupon.discountType === 'flat') {
    return Math.min(coupon.discountValue, amount);
  }
  return Math.round((amount * coupon.discountValue) / 100);
};

router.post('/validate', async (req, res) => {
  try {
    const { code, amount = 0 } = req.body;
    const coupon = await Coupon.findOne({ code: String(code || '').toUpperCase(), active: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (Number(amount) < coupon.minAmount) {
      return res.status(400).json({ success: false, message: `Minimum booking amount is ${coupon.minAmount}` });
    }

    const discountAmount = calculateDiscount(coupon, Number(amount));
    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
        finalAmount: Math.max(Number(amount) - discountAmount, 0),
        description: coupon.description,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to validate coupon', error: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons', error: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: String(req.body.code || '').toUpperCase() });
    
    await createLog({
      user: req.user._id,
      action: 'Coupon Creation',
      category: 'Admin',
      details: `Administrator created coupon: ${coupon.code}`,
      status: 'success'
    }, req);

    res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create coupon', error: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.code) payload.code = String(payload.code).toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    await createLog({
      user: req.user._id,
      action: 'Coupon Update',
      category: 'Admin',
      details: `Administrator updated coupon: ${coupon.code}`,
      status: 'info'
    }, req);

    res.json({ success: true, data: coupon, message: 'Coupon updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update coupon', error: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    await createLog({
      user: req.user._id,
      action: 'Coupon Deletion',
      category: 'Admin',
      details: `Administrator deleted coupon: ${coupon.code}`,
      status: 'warning'
    }, req);

    res.json({ success: true, data: null, message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to delete coupon', error: err.message });
  }
});

export default router;

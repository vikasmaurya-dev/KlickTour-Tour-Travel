import express from 'express';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking.js';
import Coupon from '../models/Coupon.js';
import Package from '../models/Package.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { sendBookingConfirmation } from '../utils/emailService.js';
import { createLog } from '../utils/logger.js';

const router = express.Router();

const createInvoiceNumber = () => `KT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const calculateDiscount = (coupon, amount) => {
  if (coupon.discountType === 'flat') return Math.min(coupon.discountValue, amount);
  return Math.round((amount * coupon.discountValue) / 100);
};

// POST /api/bookings — Create a new booking
router.post('/', async (req, res) => {
  try {
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {} // ignore invalid optional token
    }

    const requestedTotal = Number(req.body.totalPrice || 0);
    let discountAmount = 0;
    let couponCode = '';

    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({ code: String(req.body.couponCode).toUpperCase(), active: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (requestedTotal < coupon.minAmount) {
        return res.status(400).json({ message: `Minimum booking amount is ${coupon.minAmount}` });
      }
      discountAmount = calculateDiscount(coupon, requestedTotal);
      couponCode = coupon.code;
    }

    const newBooking = new Booking({
      ...req.body,
      userId,
      couponCode,
      discountAmount,
      totalPrice: Math.max(requestedTotal - discountAmount, 0),
      invoiceNumber: createInvoiceNumber(),
    });
    const saved = await newBooking.save();
    
    // Log the booking creation
    await createLog({
      user: userId,
      action: 'New Booking',
      category: 'Booking',
      details: `User ${saved.fullName} (${saved.email}) created a booking for ${req.body.packageName || 'a package'}. Invoice: ${saved.invoiceNumber}`,
      status: 'success'
    }, req);

    const pkg = req.body.packageId ? await Package.findById(req.body.packageId) : null;
    sendBookingConfirmation(saved.email, saved, pkg).catch((emailErr) => {
      console.error('Booking email failed:', emailErr.message);
    });
    res.status(201).json({ success: true, message: 'Booking created successfully!', data: saved });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create booking', error: err.message });
  }
});

// GET /api/bookings/my — List bookings for current user
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('packageId', 'name price duration location image')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your bookings', error: err.message });
  }
});

// GET /api/bookings — List all bookings (admin use)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('packageId', 'name price duration')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
});

// GET /api/bookings/:id — Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('packageId', 'name price duration');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch booking', error: err.message });
  }
});

// PATCH /api/bookings/:id/status — Update booking status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Booking not found' });

    // Log the status update
    await createLog({
      user: req.user._id,
      action: 'Booking Status Update',
      category: 'Booking',
      details: `Administrator updated booking ${updated.invoiceNumber} status to ${status}`,
      status: status === 'Cancelled' ? 'warning' : 'success'
    }, req);

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update booking status', error: err.message });
  }
});

export default router;

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountValue: { type: Number, required: true, min: 1 },
  minAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);

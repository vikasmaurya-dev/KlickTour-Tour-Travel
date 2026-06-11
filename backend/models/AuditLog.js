import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Security', 'Package', 'Booking', 'Destination', 'Hotel', 'User', 'System', 'Coupon'],
    default: 'System'
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'success'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

// Index for faster searching
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

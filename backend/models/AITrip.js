import mongoose from 'mongoose';

const aiTripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800,
    },
    generatedTrip: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
  },
  { timestamps: true }
);

aiTripSchema.index({ userId: 1, createdAt: -1 });
aiTripSchema.index({ createdAt: -1 });

export default mongoose.model('AITrip', aiTripSchema);

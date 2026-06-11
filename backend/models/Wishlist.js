import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['package', 'hotel'], required: true },
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, default: 0 },
  meta: { type: String, default: '' },
}, { timestamps: true });

wishlistSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);

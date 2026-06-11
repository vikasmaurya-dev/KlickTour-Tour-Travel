import mongoose from 'mongoose';

const dynamicDestinationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: { type: String },
  state: { type: String },
  category: { type: String },
  description: { type: String },
  bestTime: { type: String },
  duration: { type: String },
  heroImage: { type: String },
  imageSource: { type: String, default: '' },
  imageUpdatedAt: { type: Date },
  imagePool: { type: [String], default: [] },
  attractions: { type: Array, default: [] },
  packages: { type: Array, default: [] },
  hotels: { type: Array, default: [] },
  transportation: { type: Array, default: [] },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  generatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 } // Cache expires in 30 days
});

// Auto-delete documents after exactly 30 days based on expiresAt field
// This helps keep cache fresh against external API updates
dynamicDestinationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('DynamicDestination', dynamicDestinationSchema);

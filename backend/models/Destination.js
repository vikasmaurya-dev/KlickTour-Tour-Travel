import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const destinationSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  location:    { type: String, default: 'Global' },
  type:        { type: String, enum: ['Adventure', 'Beach', 'Mountain', 'Spiritual', 'Historical', 'Honeymoon', 'Wildlife', 'City', 'Desert', 'Island', 'Family', 'Luxury'], required: true },
  budget:      { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  duration:    { type: String, required: true },
  price:       { type: Number, required: true },
  rating:      { type: Number, default: 4.5 },
  tagline:     { type: String, default: 'Experience the journey of a lifetime.' },
  description: { type: String, required: true },
  overview:    { type: String, default: '' },
  bestTime:    { type: String, default: 'Year Round' },
  localFood:   { type: [String], default: [] },
  weather:     { type: String, default: 'Pleasant and welcoming weather for tourists.' },
  famousAttractions: { type: [String], default: [] },
  thingsToDo:  { type: [String], default: [] },
  images:      { type: [String], default: [] },
  gallery:     { type: [String], default: [] },
  heroImage:   { type: String, default: '' },
  imageSource: { type: String, default: '' },
  imageUpdatedAt: { type: Date },
  imagePool:   { type: [String], default: [] },
  reviews:     [reviewSchema],
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  highlights: { type: [String], default: [] },
  included: { type: [String], default: [] },
  excluded: { type: [String], default: [] },
  itinerary: [{
    day: Number,
    title: String,
    desc: String,
    activities: [String]
  }],
  faqs: [{
    q: String,
    a: String
  }],
  transportDesc: { type: String, default: '' },
  hotelsInfo: { type: [String], default: [] },
  isAIGenerated: { type: Boolean, default: false },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
}, { timestamps: true });

export default mongoose.model('Destination', destinationSchema);

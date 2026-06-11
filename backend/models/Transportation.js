import mongoose from 'mongoose';

const transportationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Flight', 'Train', 'Cab', 'Car Rental', 'Bus', 'Luxury Coach', 'Bike'],
    index: true,
  },
  providerName: {
    type: String,
    required: true,
    trim: true,
  },
  mode: {
    type: String,
    required: true,
    enum: ['Flight', 'Train', 'Cab', 'Car Rental', 'Bus', 'Luxury Coach', 'Bike'],
    index: true,
  },
  operator: {
    type: String,
    required: true,
    trim: true,
  },
  from: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  vehicleType: {
    type: String,
    default: '',
  },
  seats: {
    type: Number,
    default: 4,
  },
  seatsAvailable: {
    type: Number,
    default: 20,
  },
  luggage: {
    type: Number,
    default: 2,
  },
  luxuryLevel: {
    type: String,
    enum: ['Standard', 'Premium', 'Luxury', 'Ultra Luxury'],
    default: 'Standard',
  },
  comfortLevel: {
    type: String,
    enum: ['Economy', 'Standard', 'Business', 'First Class', 'Luxury'],
    default: 'Standard',
  },
  facilities: [{
    type: String,
    enum: ['AC', 'Wi-Fi', 'Sleeper', 'Charging Port', 'Food', 'Luggage', 'Pet Friendly'],
  }],
  routeType: {
    type: String,
    enum: ['Direct', 'One Stop', 'Multi-Stop'],
    default: 'Direct',
  },
  groupType: [{
    type: String,
    enum: ['Solo', 'Couple', 'Family', 'Friends', 'Corporate'],
  }],
  badge: {
    type: String,
    enum: ['Best Value', 'Fastest', 'Cheapest', 'Family Friendly', 'Eco Friendly', 'Luxury Pick', null],
    default: null,
  },
  image: {
    type: String,
    default: '',
  },
  heroImage: {
    type: String,
    default: '',
  },
  imageSource: {
    type: String,
    default: '',
  },
  imageUpdatedAt: {
    type: Date,
  },
  description: {
    type: String,
    default: '',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  gallery: {
    type: [String],
    default: [],
  },
  imagePool: {
    type: [String],
    default: [],
  },
  availabilityDate: {
    type: Date,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for common query patterns
transportationSchema.index({ type: 1, providerName: 1 });
transportationSchema.index({ mode: 1, from: 1, to: 1, availabilityDate: 1 });
transportationSchema.index({ price: 1, rating: -1 });
transportationSchema.index({ featured: 1 });
transportationSchema.index({ isActive: 1 });

const Transportation = mongoose.model('Transportation', transportationSchema);

export default Transportation;

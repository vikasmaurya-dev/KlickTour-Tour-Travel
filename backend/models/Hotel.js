import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    locationKey: {
      type: String,
      default: '',
      index: true,
    },
    sourceLocation: {
      type: String,
      default: '',
    },
    sourceType: {
      type: String,
      default: 'manual',
    },
    isCatalogHotel: {
      type: Boolean,
      default: false,
    },
    catalogRank: {
      type: Number,
      default: 0,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
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
    images: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    imagePool: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rooms: [
      {
        id: String,
        roomType: String,
        price: Number,
        capacity: String,
        image: String,
        available: { type: Boolean, default: true },
        featured: { type: Boolean, default: false }
      }
    ],
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    }
  },
  { timestamps: true }
);

hotelSchema.index(
  { locationKey: 1, catalogRank: 1 },
  {
    unique: true,
    partialFilterExpression: { isCatalogHotel: true },
  }
);

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transportation from './models/Transportation.js';
import connectDB from './config/db.js';

dotenv.config();

const buildFilterQuery = (params) => {
  const filter = { isActive: { $ne: false } };

  if (params.mode && params.mode !== 'All') filter.type = params.mode;
  if (params.type && params.type !== 'all') {
    const typeMap = {
      'flights': 'Flight', 'flight': 'Flight',
      'trains': 'Train', 'train': 'Train',
      'buses': 'Bus', 'bus': 'Bus',
      'cabs': 'Cab', 'cab': 'Cab',
      'rental': 'Car Rental', 'car rental': 'Car Rental', 'rental cars': 'Car Rental',
      'bikes': 'Bike', 'bike': 'Bike',
      'luxury coach': 'Luxury Coach',
    };
    const mapped = typeMap[params.type.toLowerCase()] || params.type;
    filter.type = mapped;
  }
  return filter;
};

const debug = async () => {
  await connectDB();
  try {
    const query = { type: 'flights' };
    const filter = buildFilterQuery(query);
    console.log('Filter:', JSON.stringify(filter, null, 2));
    
    const items = await Transportation.find(filter).limit(1).lean();
    console.log('Items found:', items.length);
    if (items.length > 0) {
        console.log('Sample item type:', items[0].type);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Debug failed:', err);
    process.exit(1);
  }
};

debug();

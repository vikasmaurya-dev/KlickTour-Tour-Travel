import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Hotel from './models/Hotel.js';
import { syncHotelCatalogFromCollections } from './services/hotelCatalogService.js';

dotenv.config({ override: true });

const run = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected for hotel catalog sync...');

    const removed = await Hotel.deleteMany({ isCatalogHotel: true });
    console.log(`Cleared ${removed.deletedCount || 0} existing catalog hotel records.`);

    const summary = await syncHotelCatalogFromCollections();
    const totalPlaces = summary.length;
    const totalHotels = summary.reduce((acc, item) => acc + Number(item.count || 0), 0);

    console.log(`Hotel catalog synced for ${totalPlaces} places.`);
    console.log(`Created or refreshed ${totalHotels} catalog hotel records.`);
    process.exit(0);
  } catch (error) {
    console.error('Hotel catalog sync failed:', error);
    process.exit(1);
  }
};

run();

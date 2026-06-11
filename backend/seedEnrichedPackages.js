import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from './models/Package.js';
import connectDB from './config/db.js';

dotenv.config({ path: './backend/.env' });
await connectDB();

const seedData = [
  {
    name: "Goa Beach Getaway",
    location: "Goa, India",
    duration: "5 Days / 4 Nights",
    category: "Beach",
    image: "https://images.unsplash.com/photo-1549488344-c6899ba89f41?auto=format&fit=crop&w=800&q=80",
    price: 15450,
    rating: 4.8,
    popularity: 90,
    groupType: ["Friends", "Couple", "Solo"],
    inclusions: ["Hotel", "Meals", "Transfers", "Sightseeing"],
    travelMonths: ["November", "December", "January", "February"],
    comfortLevel: "Standard",
    isEcoFriendly: true,
    views: 1200
  },
  {
    name: "Golden Triangle Tour",
    location: "Delhi, Agra, Jaipur, India",
    duration: "7 Days / 6 Nights",
    category: "Historical",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    price: 25500,
    rating: 4.9,
    popularity: 95,
    groupType: ["Family", "Corporate"],
    inclusions: ["Flights", "Hotel", "Meals", "Transfers", "Guide"],
    travelMonths: ["October", "November", "December", "January", "February", "March"],
    comfortLevel: "Deluxe",
    isEcoFriendly: false,
    views: 2500
  },
  {
    name: "Himalayan Trekking in Manali",
    location: "Manali, Himachal, India",
    duration: "7 Days / 6 Nights",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1605649487212-4d4ce17a8ea3?auto=format&fit=crop&w=800&q=80",
    price: 18650,
    rating: 4.6,
    popularity: 80,
    groupType: ["Solo", "Friends"],
    inclusions: ["Camping", "Meals", "Guide", "Equipment"],
    travelMonths: ["April", "May", "June", "September", "October"],
    comfortLevel: "Budget",
    isEcoFriendly: true,
    views: 850
  },
  {
    name: "Kerala Backwaters Cruise",
    location: "Alleppey, Kerala, India",
    duration: "5 Days / 4 Nights",
    category: "Spiritual",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    price: 32800,
    rating: 5.0,
    popularity: 88,
    groupType: ["Couple", "Family"],
    inclusions: ["Houseboat", "Meals", "Transfers"],
    travelMonths: ["September", "October", "November", "December", "January"],
    comfortLevel: "Luxury",
    isEcoFriendly: true,
    views: 1800
  },
  {
    name: "Udaipur Luxury Stay",
    location: "Udaipur, Rajasthan, India",
    duration: "3 Days / 2 Nights",
    category: "Honeymoon",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80",
    price: 28500,
    rating: 4.9,
    popularity: 91,
    groupType: ["Couple"],
    inclusions: ["Hotel", "Breakfast", "Private Transfers", "Candle Light Dinner"],
    travelMonths: ["October", "November", "December", "January", "February"],
    comfortLevel: "Luxury",
    isEcoFriendly: false,
    views: 3200
  },
  {
    name: "Kaziranga Wildlife Safari",
    location: "Assam, India",
    duration: "4 Days / 3 Nights",
    category: "Wildlife",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&w=800&q=80",
    price: 22000,
    rating: 4.7,
    popularity: 88,
    groupType: ["Family", "Friends"],
    inclusions: ["Resort", "Meals", "Safari", "Transfers"],
    travelMonths: ["November", "December", "January", "February", "March", "April"],
    comfortLevel: "Standard",
    isEcoFriendly: true,
    views: 1100
  }
];

const seed = async () => {
  try {
    console.log('🔄 Starting enriched upsert for package data...');

    let upsertedCount = 0;
    for (const item of seedData) {
      const result = await Package.updateOne(
        { name: item.name },
        { $set: item },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0 || result.modifiedCount > 0) {
        upsertedCount++;
      }
    }

    console.log(`✅ Upserted/Modified ${upsertedCount} enriched package records safely`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();

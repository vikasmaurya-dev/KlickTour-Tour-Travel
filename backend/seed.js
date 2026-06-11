import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from './models/Package.js';
import Destination from './models/Destination.js';
import Hotel from './models/Hotel.js';

dotenv.config();

// ─── Seed Data ────────────────────────────────────────────────

const packagesData = [
  { name: "Goa Beach Getaway", duration: "5 Days / 4 Nights", image: "https://images.unsplash.com/photo-1549488344-c6899ba89f41?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 15450, rating: 4.8, popularity: 90 },
  { name: "Golden Triangle Tour", duration: "7 Days / 6 Nights", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 25500, rating: 4.9, popularity: 95 },
  { name: "Rajasthan Desert Safari", duration: "3 Days / 2 Nights", image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 12299, rating: 4.7, popularity: 85 },
  { name: "Himalayan Trekking in Manali", duration: "7 Days / 6 Nights", image: "https://images.unsplash.com/photo-1605649487212-4d4ce17a8ea3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 18650, rating: 4.6, popularity: 80 },
  { name: "Kerala Backwaters Cruise", duration: "5 Days / 4 Nights", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 32800, rating: 5.0, popularity: 88 },
  { name: "Meghalaya Nature Tour", duration: "8 Days / 7 Nights", image: "https://images.unsplash.com/photo-1596707314271-e75c74384a32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 28400, rating: 4.9, popularity: 92 },
  { name: "Andaman Island Hopping", duration: "6 Days / 5 Nights", image: "https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 24000, rating: 4.8, popularity: 86 },
  { name: "Kashmir Paradise Tour", duration: "7 Days / 6 Nights", image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 35000, rating: 4.9, popularity: 89 },
  { name: "Varanasi Spiritual Journey", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 11000, rating: 4.5, popularity: 82 },
  { name: "Ooty & Coorg Retreat", duration: "6 Days / 5 Nights", image: "https://images.unsplash.com/photo-1582239634898-d10ac3d7d4c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 21500, rating: 4.7, popularity: 84 },
  { name: "Mumbai City Tour", duration: "3 Days / 2 Nights", image: "https://images.unsplash.com/photo-1570168007204-c1e3e515ce92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 10500, rating: 4.5, popularity: 78 },
  { name: "Delhi Heritage Walk", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 12000, rating: 4.6, popularity: 81 },
  { name: "Ladakh Bike Expedition", duration: "10 Days / 9 Nights", image: "https://images.unsplash.com/photo-1581791538302-03537b9c97bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 45000, rating: 4.9, popularity: 94 },
  { name: "Spiti Valley Road Trip", duration: "12 Days / 11 Nights", image: "https://images.unsplash.com/photo-1589308454676-473d09a56658?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 38000, rating: 4.8, popularity: 87 },
  { name: "Rann of Kutch Festival", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1623912079083-d5d83389a9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 16500, rating: 4.7, popularity: 83 },
  { name: "Darjeeling Hill Getaway", duration: "5 Days / 4 Nights", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 19800, rating: 4.6, popularity: 85 },
  { name: "Udaipur Luxury Stay", duration: "3 Days / 2 Nights", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 28500, rating: 4.9, popularity: 91 },
  { name: "Hampi Ruins Exploration", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 14200, rating: 4.8, popularity: 82 },
  { name: "Kaziranga Wildlife Safari", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 22000, rating: 4.7, popularity: 88 },
  { name: "Pondicherry French Vibe", duration: "3 Days / 2 Nights", image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 11500, rating: 4.5, popularity: 84 },
  { name: "Lakshadweep Scuba Tour", duration: "6 Days / 5 Nights", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 42000, rating: 4.9, popularity: 89 },
  { name: "Wayanad Forest Escape", duration: "4 Days / 3 Nights", image: "https://images.unsplash.com/photo-1593693397690-362cb9666cf2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 17500, rating: 4.6, popularity: 81 },
  { name: "Mahabaleshwar Retreat", duration: "3 Days / 2 Nights", image: "https://images.unsplash.com/photo-1590766948510-1ec62116035f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 13800, rating: 4.5, popularity: 79 },
  { name: "Shimla Snow Adventure", duration: "5 Days / 4 Nights", image: "https://images.unsplash.com/photo-1605649487212-4d4ce17a8ea3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", price: 21000, rating: 4.7, popularity: 86 },
];

const destinationsData = [
  // Beach
  { name: "Goa", type: "Beach", budget: "Medium", duration: "1-2 Weeks", price: 15500, rating: 4.8, location: "Goa, India", description: "Vibrant beaches, sunset parties, and historic Portuguese architecture.", images: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"] },
  { name: "Radhanagar Beach", type: "Beach", budget: "High", duration: "1-2 Weeks", price: 32000, rating: 4.9, location: "Andaman Islands", description: "Often rated the best beach in Asia, perfect for serenity lovers.", images: ["https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?auto=format&fit=crop&w=800&q=80"] },
  { name: "Bali", type: "Beach", budget: "High", duration: "1-2 Weeks", price: 55000, rating: 4.9, location: "Indonesia", description: "Tropical paradise with lush jungles, serene beaches, and vibrant culture.", images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80"] },
  
  // Mountain
  { name: "Manali", type: "Mountain", budget: "Medium", duration: "5-7 Days", price: 18499, rating: 4.7, location: "Himachal, India", description: "Adventure sports, snowy peaks, and the famous Rohtang Pass.", images: ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"] },
  { name: "Swiss Alps", type: "Mountain", budget: "High", duration: "10-12 Days", price: 125000, rating: 5.0, location: "Switzerland", description: "Breathtaking snow-capped peaks and world-class ski resorts.", images: ["https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80"] },
  
  // Adventure
  { name: "Rishikesh", type: "Adventure", budget: "Low", duration: "3-5 Days", price: 6500, rating: 4.6, location: "Uttarakhand, India", description: "White water rafting and bungee jumping in the foothills of Himalayas.", images: ["https://images.unsplash.com/photo-1593693397690-362cb9666cf2?auto=format&fit=crop&w=800&q=80"] },
  { name: "Petra", type: "Adventure", budget: "High", duration: "5-7 Days", price: 85000, rating: 4.9, location: "Jordan", description: "Ancient city carved into red desert rocks, a world wonder.", images: ["https://images.unsplash.com/photo-1579606030130-c9ae98a69ade?auto=format&fit=crop&w=800&q=80"] },
  
  // Spiritual
  { name: "Varanasi", type: "Spiritual", budget: "Low", duration: "3-5 Days", price: 8200, rating: 4.5, location: "UP, India", description: "One of the oldest living cities, spiritual ghats, and Ganga Aarti.", images: ["https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"] },
  { name: "Kyoto", type: "Spiritual", budget: "High", duration: "1-2 Weeks", price: 95000, rating: 4.8, location: "Japan", description: "City of ten thousand shrines, Zen gardens, and traditional tea houses.", images: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"] },

  // Historical
  { name: "Jaipur", type: "Historical", budget: "Medium", duration: "4-6 Days", price: 21000, rating: 4.7, location: "Rajasthan, India", description: "The Pink City famous for its royal forts, palaces, and heritage.", images: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80"] },
  { name: "Rome", type: "Historical", budget: "High", duration: "1 Week", price: 110000, rating: 4.9, location: "Italy", description: "The Eternal City, home to the Colosseum, Roman Forum, and Vatican.", images: ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80"] },

  // Wildlife
  { name: "Jim Corbett", type: "Wildlife", budget: "Medium", duration: "3-4 Days", price: 14500, rating: 4.6, location: "Uttarakhand, India", description: "Royal Bengal Tigers and elephants in India's oldest national park.", images: ["https://images.unsplash.com/photo-1590766948510-1ec62116035f?auto=format&fit=crop&w=800&q=80"] },
  { name: "Massai Mara", type: "Wildlife", budget: "High", duration: "1 Week", price: 150000, rating: 5.0, location: "Kenya", description: "Witness the Great Migration and the African Big Five in the wild.", images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80"] },

  // City / Urban
  { name: "Mumbai", type: "City", budget: "High", duration: "3-5 Days", price: 12000, rating: 4.5, location: "Maharashtra, India", description: "The City of Dreams, Marine Drive, and Bollywood vibes.", images: ["https://images.unsplash.com/photo-1570168007204-c1e3e515ce92?auto=format&fit=crop&w=800&q=80"] },
  { name: "New York", type: "City", budget: "High", duration: "5-7 Days", price: 180000, rating: 4.7, location: "USA", description: "The city that never sleeps, from Times Square to Central Park.", images: ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80"] },

  // Desert
  { name: "Jaisalmer", type: "Desert", budget: "Medium", duration: "3-5 Days", price: 19500, rating: 4.8, location: "Rajasthan, India", description: "Camel safaris, golden dunes, and the majestic Golden Fort.", images: ["https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=800&q=80"] },
  { name: "Dubai", type: "Desert", budget: "High", duration: "5-7 Days", price: 85000, rating: 4.8, location: "UAE", description: "Modern skyscrapers meeting vast deserts and luxury shopping.", images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"] },

  // Island
  { name: "Havelock Island", type: "Island", budget: "High", duration: "5-7 Days", price: 28000, rating: 4.9, location: "Andaman, India", description: "Crystal clear waters, coral reefs, and scuba diving paradise.", images: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"] },
  { name: "Santorini", type: "Island", budget: "High", duration: "1 Week", price: 140000, rating: 4.9, location: "Greece", description: "Iconic white buildings, blue domes, and stunning Aegean sunsets.", images: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80"] },

  // Honeymoon
  { name: "Gulmarg", type: "Honeymoon", budget: "High", duration: "5-7 Days", price: 35000, rating: 5.0, location: "Kashmir, India", description: "The Switzerland of India, perfect for romantic snowy retreats.", images: ["https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=800&q=80"] },
  { name: "Maldives", type: "Honeymoon", budget: "High", duration: "1 Week", price: 160000, rating: 5.0, location: "Maldives", description: "Overwater villas and turquoise lagoons for the ultimate romance.", images: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80"] },
];

const hotelsData = [
  { name: "Taj Mahal Palace", city: "Mumbai", price: 45000, rating: 4.9, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Spa", "Sea View", "Pool", "Free WiFi"], featured: true },
  { name: "Trident Nariman Point", city: "Mumbai", price: 15000, rating: 4.7, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Gym", "Pool", "Free WiFi"], featured: false },
  { name: "ITC Maurya", city: "Delhi", price: 35000, rating: 4.8, image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Spa", "Fine Dining", "Pool"], featured: true },
  { name: "The Leela Palace", city: "Delhi", price: 38000, rating: 4.9, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Spa", "Gym", "Pool", "Free WiFi"], featured: true },
  { name: "Rambagh Palace", city: "Jaipur", price: 50000, rating: 5.0, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Spa", "Heritage Walk", "Pool"], featured: true },
  { name: "Taj Exotica Resort", city: "Goa", price: 30000, rating: 4.8, image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", amenities: ["Beach Access", "Spa", "Pool"], featured: true },
];

// ─── Seed Function ────────────────────────────────────────────

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB for seeding');

    // Clear existing data
    await Package.deleteMany({});
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    console.log('🗑️   Cleared old data');

    // Insert seed data
    const pkgs = await Package.insertMany(packagesData);
    const dests = await Destination.insertMany(destinationsData);
    const hotels = await Hotel.insertMany(hotelsData);
    console.log(`📦  Inserted ${pkgs.length} packages`);
    console.log(`🌍  Inserted ${dests.length} destinations`);
    console.log(`🏨  Inserted ${hotels.length} hotels`);

    console.log('\n🎉  Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();

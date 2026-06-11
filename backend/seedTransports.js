import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transportation from './models/Transportation.js';

dotenv.config();

const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Jaipur', 'Ahmedabad', 'Pune', 'Goa', 'Kochi', 'Agra', 'Udaipur', 'Manali', 'Varanasi', 'Amritsar'];
const operators = {
  Flight: ['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'AirAsia India'],
  Train: ['Indian Railways (Rajdhani)', 'Indian Railways (Shatabdi)', 'Vande Bharat Express', 'Duronto Express'],
  Bus: ['RedBus Express', 'Zingbus', 'IntrCity SmartBus', 'SRS Travels', 'VRL Travels', 'Orange Tours'],
  'Luxury Coach': ['Volvo Lux Travels', 'Benz Coaches', 'Maharaja Travels'],
  Cab: ['Ola Outstation', 'Uber Intercity', 'MakeMyTrip Cabs', 'Savaari'],
  'Car Rental': ['Zoomcar', 'Revv', 'Avis India', 'Hertz']
};

const vehicleTypes = {
  Flight: ['Boeing 737', 'Airbus A320', 'Boeing 787 Dreamliner'],
  Train: ['1A AC First Class', '2A AC Two Tier', 'CC AC Chair Car', 'Executive Chair Car'],
  Bus: ['Volvo AC Semi-Sleeper', 'Scania AC Sleeper', 'Mercedes Benz Multi-axle'],
  'Luxury Coach': ['Volvo 9400 AC Sleeper', 'Scania Metrolink'],
  Cab: ['Toyota Innova Crysta', 'Maruti Suzuki Dzire', 'Honda City', 'Mahindra XUV700'],
  'Car Rental': ['Hyundai Creta', 'Kia Seltos', 'Toyota Fortuner', 'Mahindra Thar']
};

const images = {
  Flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop',
  Train: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop',
  Bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
  'Luxury Coach': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop',
  Cab: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
  'Car Rental': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop'
};

const modes = ['Flight', 'Train', 'Cab', 'Car Rental', 'Bus', 'Luxury Coach'];
const luxuryLevels = ['Standard', 'Premium', 'Luxury', 'Ultra Luxury'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(hours, minutes) {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m}`;
}

const generateRecords = (count) => {
  const records = [];
  for (let i = 0; i < count; i++) {
    const fromCity = getRandomItem(cities);
    let toCity = getRandomItem(cities);
    while (toCity === fromCity) {
      toCity = getRandomItem(cities);
    }

    const mode = getRandomItem(modes);
    const operator = getRandomItem(operators[mode]);
    const vehicleType = getRandomItem(vehicleTypes[mode]);
    const luxuryLevel = getRandomItem(luxuryLevels);
    
    let priceBase;
    switch (mode) {
      case 'Flight': priceBase = getRandomInt(3500, 15000); break;
      case 'Train': priceBase = getRandomInt(800,  3500); break;
      case 'Cab': priceBase = getRandomInt(2000, 8000); break;
      case 'Car Rental': priceBase = getRandomInt(1500, 5000); break;
      case 'Bus': priceBase = getRandomInt(500, 2500); break;
      case 'Luxury Coach': priceBase = getRandomInt(1200, 3500); break;
      default: priceBase = 1000;
    }
    
    // Add premium logic 
    if (luxuryLevel === 'Luxury' || luxuryLevel === 'Ultra Luxury') {
      priceBase *= 1.5;
    }
    
    const price = Math.round(priceBase);
    const originalPrice = Math.round(price * (1 + getRandomInt(10, 30) / 100)); // 10-30% higher
    
    const depHour = getRandomInt(0, 23);
    const depMin = getRandomItem([0, 15, 30, 45]);
    
    // Duration
    const durHours = (mode === 'Flight') ? getRandomInt(1, 3) : getRandomInt(4, 24);
    const durMins = getRandomItem([0, 15, 30, 45]);
    
    let arrHour = (depHour + durHours) % 24;
    let arrMin = (depMin + durMins);
    if (arrMin >= 60) {
      arrHour = (arrHour + 1) % 24;
      arrMin -= 60;
    }

    const seats = mode === 'Cab' || mode === 'Car Rental' ? getRandomInt(4, 7) : getRandomInt(30, 200);
    const luggage = mode === 'Flight' ? 1 : mode === 'Train' || mode === 'Bus' ? 2 : 3;
    
    const rating = parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1));
    const reviews = getRandomInt(10, 2500);
    const featured = Math.random() > 0.8;

    records.push({
      mode,
      operator,
      from: fromCity,
      to: toCity,
      departureTime: formatTime(depHour, depMin),
      arrivalTime: formatTime(arrHour, arrMin),
      duration: `${durHours}h ${durMins}m`,
      price,
      originalPrice,
      rating,
      reviews,
      vehicleType,
      seats,
      luggage,
      luxuryLevel,
      image: images[mode],
      description: `Experience a comfortable ${mode.toLowerCase()} journey from ${fromCity} to ${toCity} with ${operator}. Enjoy top-notch services with our ${luxuryLevel.toLowerCase()} offering.`,
      featured
    });
  }
  return records;
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Missing MONGODB_URI in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const newRecords = generateRecords(50);
    
    await Transportation.insertMany(newRecords);
    console.log(`Successfully generated and inserted 50 transportation records!`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();

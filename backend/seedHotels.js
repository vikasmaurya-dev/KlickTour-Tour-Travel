import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from './models/Hotel.js';

dotenv.config();

const hotelsToSeed = [
  {
    name: "The Taj Mahal Palace",
    city: "Mumbai",
    location: "Apollo Bunder, Colaba, Mumbai",
    price: 25000,
    rating: 5,
    image: "/images/hotels/taj_mahal_exterior.png",
    gallery: [
      "/images/hotels/taj_mahal_exterior.png", // Exterior
      "/images/hotels/luxury_lobby.png", // Lobby
      "/images/hotels/luxury_standard_room.png", // Standard Room
      "/images/hotels/luxury_deluxe_room.png", // Deluxe Room
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"  // Pool
    ],
    amenities: ["Ocean View", "Swimming Pool", "Spa & Wellness", "Fine Dining", "Butler Service"],
    description: "An architectural marvel and a landmark of Mumbai, The Taj Mahal Palace offers panoramic views of the Arabian Sea and the Gateway of India. With a history spanning over a century, it remains a preferred destination for royalty and heads of state.",
    featured: true,
    lat: 18.9218,
    lng: 72.8333,
    rooms: [
      { id: "tj-std", roomType: "Tower Room", price: 25000, capacity: "2 Guests • 1 Queen Bed", image: "/images/hotels/luxury_standard_room.png", available: true },
      { id: "tj-dlx", roomType: "Sea View Room", price: 35000, capacity: "2 Guests • 1 King Bed", image: "/images/hotels/luxury_deluxe_room.png", available: true },
      { id: "tj-ste", roomType: "Grand Luxury Suite", price: 85000, capacity: "3 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "Umaid Bhawan Palace",
    city: "Jodhpur",
    location: "Circuit House Rd, Jodhpur",
    price: 45000,
    rating: 4.9,
    image: "/images/hotels/umaid_bhawan_exterior.png",
    gallery: [
      "/images/hotels/umaid_bhawan_exterior.png", // Exterior
      "https://images.unsplash.com/photo-1585544314038-a0d3769d0193?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80", // Standard Room
      "https://images.unsplash.com/photo-1592861956120-e524caf73969?auto=format&fit=crop&w=1200&q=80", // Deluxe Room
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Heritage Museum", "Zodiac Pool", "Royal Gardens", "Champagne Breakfast", "Spa"],
    description: "Perched high above the desert city of Jodhpur, Umaid Bhawan Palace is one of the world's largest private residences. A part of the palace is managed by Taj Hotels, offering guests a glimpse into the royal lifestyle of the Marwar dynasty.",
    featured: true,
    lat: 26.2807,
    lng: 73.0475,
    rooms: [
      { id: "ub-std", roomType: "Palace Room", price: 45000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "ub-ste", roomType: "Historical Suite", price: 95000, capacity: "2 Guests • Royal View", image: "https://images.unsplash.com/photo-1592861956120-e524caf73969?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "The Oberoi Amarvilas",
    city: "Agra",
    location: "Taj East Gate Road, Agra",
    price: 32000,
    rating: 5,
    image: "/images/hotels/oberoi_amarvilas_exterior.png",
    gallery: [
      "/images/hotels/oberoi_amarvilas_exterior.png", // Exterior
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f2c5?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80", // Standard Room
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80", // Deluxe Room
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Taj Mahal View", "Spa", "Pool", "Bar", "Free WiFi"],
    description: "Located just 600 meters from the Taj Mahal, every room at The Oberoi Amarvilas offers an uninterrupted view of the ancient monument to love. The hotel's design is inspired by Moorish and Mughal architecture.",
    featured: true,
    lat: 27.1684,
    lng: 78.0431,
    rooms: [
      { id: "oa-std", roomType: "Premier Room", price: 32000, capacity: "2 Guests • Taj View", image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "oa-ste", roomType: "Luxury Suite", price: 75000, capacity: "2 Guests • Private Balcony", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "Wildflower Hall",
    city: "Shimla",
    location: "Chharabra, Shimla, Himachal Pradesh",
    price: 22000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "/images/hotels/luxury_deluxe_room_2.png", // Deluxe Room
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Infinity Pool", "Yoga", "Hiking", "Fine Dining", "Library"],
    description: "Located 8,250 feet above sea level, Wildflower Hall is a fairy-tale luxury resort in the Himalayas. Experience the magic of the mountains with outdoor whirlpools, forest trails, and world-class spa treatments.",
    featured: true,
    lat: 31.1192,
    lng: 77.2281,
    rooms: [
      { id: "wh-std", roomType: "Garden View Room", price: 22000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "wh-ste", roomType: "Mountain View Room", price: 30000, capacity: "2 Guests • Valley View", image: "/images/hotels/luxury_deluxe_room_2.png", available: true, featured: true }
    ]
  },
  {
    name: "The Leela Palace",
    city: "Udaipur",
    location: "Lake Pichola, Udaipur",
    price: 38000,
    rating: 5,
    image: "/images/hotels/luxury_lobby.png", // Using a grand lobby as main if exterior isn't as good
    gallery: [
      "/images/hotels/modern_exterior_generic.png", // Exterior
      "/images/hotels/luxury_lobby.png", // Lobby
      "/images/hotels/luxury_standard_room_2.png", // Standard
      "/images/hotels/luxury_deluxe_room_2.png", // Deluxe
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Lake View", "Swimming Pool", "Spa", "Dining", "Butler"],
    description: "Nestled on the banks of Lake Pichola, The Leela Palace Udaipur offers breathtaking views of the Aravalli Hills and the City Palace. Experience the grandeur of Rajasthan with modern luxury and impeccable service.",
    featured: true,
    lat: 24.5794,
    lng: 73.6733,
    rooms: [
      { id: "lp-std", roomType: "Lake View Room", price: 38000, capacity: "2 Guests • Lake View", image: "/images/hotels/luxury_standard_room_2.png", available: true },
      { id: "lp-ste", roomType: "Luxury Suite", price: 65000, capacity: "2 Guests • Private Pool", image: "/images/hotels/luxury_deluxe_room_2.png", available: true, featured: true }
    ]
  },
  {
    name: "Taj Exotica Resort & Spa",
    city: "Goa",
    location: "Benaulim Beach, Goa",
    price: 18500,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Beachfront", "Spa", "Pool", "Water Sports", "Kids Club"],
    description: "Spread across 56 acres of lush greenery, Taj Exotica Resort & Spa in Benaulim is the ultimate destination for a relaxing Goan getaway. Mediterranean-style villas, sun-drenched beaches, and exquisite cuisine await you.",
    featured: true,
    lat: 15.2489,
    lng: 73.9213,
    rooms: [
      { id: "te-std", roomType: "Garden Villa", price: 18500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "te-dlx", roomType: "Sea View Villa", price: 28000, capacity: "2 Guests • Ocean View", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "ITC Maurya",
    city: "Delhi",
    location: "Diplomatic Enclave, Delhi",
    price: 18000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Fitness Center", "Spa & Wellness", "Bukhara Restaurant", "Bar", "Free WiFi"],
    description: "A tribute to the Mauryan dynasty, ITC Maurya is a landmark luxury hotel in Delhi. Home to the world-renowned Bukhara restaurant, the hotel offers a unique blend of historical grandeur and modern sophistication.",
    featured: true,
    lat: 28.5977,
    lng: 77.1741,
    rooms: [
      { id: "im-std", roomType: "Executive Club", price: 18000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "im-dlx", roomType: "ITC One Room", price: 26000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "The Oberoi",
    city: "Mumbai",
    location: "Nariman Point, Mumbai",
    price: 28000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Ocean View", "Fitness Center", "Award-Winning Dining", "Bar", "Free WiFi"],
    description: "Offering sweeping views of the Marine Drive, The Oberoi Mumbai is a masterpiece of modern design and luxury. Experience unparalleled comfort in our elegant rooms and indulge in culinary delights at our award-winning restaurants.",
    featured: true,
    lat: 18.9269,
    lng: 72.8205,
    rooms: [
      { id: "ob-std", roomType: "Deluxe Room", price: 28000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "ob-dlx", roomType: "Premier Ocean View", price: 38000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Jaipur Palace Heritage",
    city: "Jaipur",
    location: "Amer Road, Jaipur",
    price: 12500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1585544314038-a0d3769d0193?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1592861956120-e524caf73969?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Heritage Building", "Swimming Pool", "Royal Dining", "Spa", "Free WiFi"],
    description: "Step back in time at Jaipur Palace Heritage. This beautifully restored palace hotel offers a royal experience with antique furnishings, traditional Rajasthani cuisine, and majestic views of the Aravalli hills.",
    featured: true,
    lat: 26.9124,
    lng: 75.7873,
    rooms: [
      { id: "jp-std", roomType: "Heritage Room", price: 12500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "jp-dlx", roomType: "Royal Suite", price: 25000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Kumarakom Lake Resort",
    city: "Kottayam",
    location: "Kumarakom, North Manjoor, Kerala",
    price: 16500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1580674239581-3fbc196457f3?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580674239581-3fbc196457f3?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Backwater View", "Ayurvedic Spa", "Pool", "Houseboat Dining", "Free WiFi"],
    description: "Winners of the 'World's Leading Luxury Resort' award, Kumarakom Lake Resort is a heritage property on the banks of Vembanad Lake. Traditional Kerala architecture meets modern comfort in this serene paradise.",
    featured: true,
    lat: 9.5916,
    lng: 76.4274,
    rooms: [
      { id: "klr-std", roomType: "Luxury Pavilion", price: 16500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "klr-dlx", roomType: "Meandering Pool Villa", price: 28000, capacity: "2 Guests • Pool Access", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "ITC Gardenia",
    city: "Bangalore",
    location: "Residency Road, Bangalore",
    price: 14000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1551882547-ff43c33f7835?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff43c33f7835?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1596701062351-df5f8a42f3c7?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Vertical Garden", "Pool", "Edo Restaurant", "Spa", "Free WiFi"],
    description: "Inspired by the garden city of Bangalore, ITC Gardenia is a LEED Platinum certified luxury hotel. Experience eco-friendly luxury with vertical gardens, spacious rooms, and world-class dining in the heart of the city.",
    featured: false,
    lat: 12.9602,
    lng: 77.5941,
    rooms: [
      { id: "ig-std", roomType: "Towers Room", price: 14000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "ig-dlx", roomType: "ITC One Room", price: 22000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "The Lodhi",
    city: "Delhi",
    location: "Lodhi Road, New Delhi",
    price: 35000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Private Pool", "Spa", "Gym", "Dining", "Library"],
    description: "The Lodhi is a member of the 'Leading Hotels of the World' and offers an urban oasis in the heart of New Delhi. Known for its sophisticated design and spacious rooms with private plunge pools.",
    featured: true,
    lat: 28.5894,
    lng: 77.2341,
    rooms: [
      { id: "ld-std", roomType: "Lodhi Room", price: 35000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "ld-ste", roomType: "Lodhi Suite", price: 55000, capacity: "2 Guests • Private Pool", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "Evolve Back",
    city: "Hampi",
    location: "Kamalapura, Hampi, Karnataka",
    price: 24000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1585544314038-a0d3769d0193?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585544314038-a0d3769d0193?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Historical Architecture", "Pool", "Spa", "Dining", "Cultural Tours"],
    description: "Inspired by the Vijayanagara Empire, Evolve Back Kamalapura Palace in Hampi offers a regal experience with fort-like entrances, stone-paved paths, and arched hallways. A perfect blend of history and luxury.",
    featured: true,
    lat: 15.3192,
    lng: 76.4713,
    rooms: [
      { id: "eb-std", roomType: "Nivasa Room", price: 24000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "eb-dlx", roomType: "Nilaya Suite", price: 38000, capacity: "2 Guests • Terrace", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Taj Falaknuma Palace",
    city: "Hyderabad",
    location: "Engine Bowli, Falaknuma, Hyderabad",
    price: 38000,
    rating: 5,
    image: "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566752355-3979ff69a3bc?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1585544314038-a0d3769d0193?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Palace Experience", "Horse Carriage", "Royal Dining", "Spa", "Library"],
    description: "Once the residence of the Nizam of Hyderabad, Taj Falaknuma Palace is a magnificent jewel in the clouds. Arrive in a horse-drawn carriage and experience the opulence of the world's most beautiful palace.",
    featured: true,
    lat: 17.3314,
    lng: 78.4674,
    rooms: [
      { id: "tf-std", roomType: "Palace Room", price: 38000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "tf-ste", roomType: "Royal Suite", price: 95000, capacity: "2 Guests • Royal View", image: "https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "Ananda in the Himalayas",
    city: "Rishikesh",
    location: "The Palace Estate, Narendra Nagar, Uttarakhand",
    price: 35000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Wellness Spa", "Yoga", "Meditation", "Ayurveda", "Hill View"],
    description: "Ananda is an award-winning luxury destination spa in the Himalayan foothills. Set around a Maharaja's palace estate, it offers holistic wellness programs based on Ayurveda, Yoga, and Vedanta.",
    featured: true,
    lat: 30.1472,
    lng: 78.3072,
    rooms: [
      { id: "an-std", roomType: "Palace View Room", price: 35000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "an-ste", roomType: "Garden Suite", price: 55000, capacity: "2 Guests • Private Garden", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "The Park",
    city: "Kolkata",
    location: "Park Street, Kolkata",
    price: 8500,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Art Collection", "Nightclub", "Pool", "Dining", "Free WiFi"],
    description: "The Park Kolkata is a boutique hotel that celebrates contemporary design and art. Located on the iconic Park Street, it's known for its vibrant nightlife, stylish rooms, and exceptional service.",
    featured: false,
    lat: 22.5544,
    lng: 88.3513,
    rooms: [
      { id: "pk-std", roomType: "Luxury Room", price: 8500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "pk-dlx", roomType: "Residence Room", price: 12000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Vivanta by Taj",
    city: "Madikeri",
    location: "Coorg, Karnataka",
    price: 15500,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Nature Trails", "Infinity Pool", "Spa", "Dining", "Free WiFi"],
    description: "Perched on a hill 4,000 feet above sea level, Vivanta by Taj Madikeri offers a unique rainforest experience. Sustainable architecture, breathtaking views, and immersive nature activities await in the heart of Coorg.",
    featured: true,
    lat: 12.4244,
    lng: 75.7373,
    rooms: [
      { id: "vt-std", roomType: "Superior Room", price: 15500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "vt-dlx", roomType: "Deluxe Delight", price: 22000, capacity: "2 Guests • Forest View", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Marari Beach Resort",
    city: "Alleppey",
    location: "Mararikulam, Alleppey, Kerala",
    price: 12500,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Eco-Resort", "Butterfly Garden", "Pool", "Organic Dining", "Yoga"],
    description: "Marari Beach is an eco-resort that captures the essence of life in a Kerala fishing village. Experience simplicity and luxury with thatched-roof villas, organic gardens, and a pristine beach.",
    featured: false,
    lat: 9.5992,
    lng: 76.2974,
    rooms: [
      { id: "mb-std", roomType: "Garden Villa", price: 12500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "mb-dlx", roomType: "Pool Villa", price: 22000, capacity: "2 Guests • Private Pool", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "Radisson Blu Palace",
    city: "Udaipur",
    location: "Near Fateh Sagar Lake, Udaipur",
    price: 11000,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Lake View", "Swimming Pool", "Spa", "Dining", "Free WiFi"],
    description: "Radisson Blu Palace Resort & Spa Udaipur offers panoramic views of Fateh Sagar Lake. With its palatial architecture and modern amenities, it's a perfect choice for weddings and luxury stays.",
    featured: false,
    lat: 24.5944,
    lng: 73.6841,
    rooms: [
      { id: "rb-std", roomType: "Superior Room", price: 11000, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "rb-dlx", roomType: "Business Class", price: 16000, capacity: "2 Guests • Lake View", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  },
  {
    name: "JW Marriott Walnut Grove",
    city: "Mussoorie",
    location: "Village Siya, Mussoorie, Uttarakhand",
    price: 26000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Himalayan View", "Heated Pool", "Spa", "Bowling Alley", "Free WiFi"],
    description: "Experience the ultimate mountain retreat at JW Marriott Mussoorie Walnut Grove Resort & Spa. With stunning views of the Himalayas, world-class amenities, and impeccable service, it's a haven of luxury.",
    featured: true,
    lat: 30.4592,
    lng: 78.0674,
    rooms: [
      { id: "jw-std", roomType: "Deluxe Valley View", price: 26000, capacity: "2 Guests • Valley View", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "jw-ste", roomType: "Executive Suite", price: 45000, capacity: "2 Guests • 1 King Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true, featured: true }
    ]
  },
  {
    name: "Novotel Airport",
    city: "Hyderabad",
    location: "GMR Arena, Shamshabad, Hyderabad",
    price: 9500,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", // Exterior
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=1200&q=80", // Lobby
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", // Standard
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Deluxe
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Dining
      "https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&w=1200&q=80"  // View
    ],
    amenities: ["Airport Shuttle", "Pool", "Gym", "Dining", "Free WiFi"],
    description: "Located near the GMR Hyderabad International Airport, Novotel Hyderabad Airport offers a perfect blend of business and leisure. Experience modern rooms, exceptional dining, and extensive recreational facilities.",
    featured: false,
    lat: 17.2392,
    lng: 78.4341,
    rooms: [
      { id: "nv-std", roomType: "Superior Room", price: 9500, capacity: "2 Guests • 1 Bed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", available: true },
      { id: "nv-dlx", roomType: "Premier Room", price: 14000, capacity: "2 Guests • Airport View", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", available: true }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Hotel Seeding...');

    await Hotel.deleteMany();
    console.log('Existing hotels cleared.');

    // Ensure image and images are also set for compatibility
    const processedHotels = hotelsToSeed.map(h => ({
      ...h,
      images: h.gallery // Syncing images with gallery for compatibility
    }));

    await Hotel.insertMany(processedHotels);
    console.log(`${processedHotels.length} Hotels seeded successfully with unique image galleries.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hotels:', error);
    process.exit(1);
  }
};

seedDB();

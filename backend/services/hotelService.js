import Hotel from '../models/Hotel.js';

export const getHotelsForPlace = async (cityName, country) => {
  try {
    // 1. Check if we have hotels for this city in our Database
    // Using regex for case-insensitive match
    const regex = new RegExp(cityName, 'i');
    let hotels = await Hotel.find({ city: regex }).limit(4);

    // 2. If Hotels found in DB, return them mapping them to common format
    if (hotels && hotels.length > 0) {
      return hotels.map(h => ({
        _id: h._id,
        name: h.name,
        rating: h.rating,
        price: h.price,
        image: h.image,
        amenities: h.amenities || ['Free WiFi', 'AC', 'Breakfast']
      }));
    }

    // 3. Fallback: Generate generic hotel options for this specific city
    const currency = country === 'India' ? '₹' : '$';
    const basePrice = country === 'India' ? 2500 : 50;

    return [
      {
        _id: `htl_1_${Date.now()}`,
        name: `${cityName} Grand Resort`,
        rating: 4.8,
        price: basePrice * 4,
        currency,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800&q=80',
        amenities: ['Pool', 'Spa', 'Free Breakfast', 'Restaurant']
      },
      {
        _id: `htl_2_${Date.now()}`,
        name: `The Royal ${cityName}`,
        rating: 4.5,
        price: basePrice * 2.5,
        currency,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c0d13c82?fit=crop&w=800&q=80',
        amenities: ['Free WiFi', 'City View', 'Gym']
      },
      {
        _id: `htl_3_${Date.now()}`,
        name: `${cityName} Backpackers Hostel`,
        rating: 4.2,
        price: basePrice * 0.5,
        currency,
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?fit=crop&w=800&q=80',
        amenities: ['Shared Lounge', 'Free Breakfast', 'Bar']
      }
    ];
  } catch (error) {
    console.error("HotelService Error:", error.message);
    return [];
  }
};

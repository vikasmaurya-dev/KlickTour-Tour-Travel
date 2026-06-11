import HotelBooking from '../models/HotelBooking.js';
import Hotel from '../models/Hotel.js';
import { getHotelImages } from '../services/imageService.js';
import {
  ensureHotelCatalogForContext,
  normalizeHotelLocationKey,
  resolveHotelLocationLabel,
  serializeHotelForClient,
} from '../services/hotelCatalogService.js';
import { sendHotelBookingConfirmation } from '../utils/emailService.js';
import { createLog } from '../utils/logger.js';

let hotelCache = {}; 
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const HOTEL_NAME_PATTERN = /\b(hotel|resort|palace|suites?|inn|lodge|retreat|villa|stay|marriott|hilton|hyatt|radisson|oberoi|taj|leela|itc|novotel|lemon tree|fairmont|sheraton)\b/i;

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (value = '') => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const uniqueImageList = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((image) => {
    const next = String(image).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const buildSearchHotelRooms = (hotelName, price, image) => ([
  { id: `${slugify(hotelName)}-standard`, roomType: 'Premium Room', price, capacity: '2 Guests', image, available: true, featured: true },
  { id: `${slugify(hotelName)}-deluxe`, roomType: 'Deluxe Room', price: price + Math.round(price * 0.18), capacity: '2 Guests', image, available: true },
  { id: `${slugify(hotelName)}-suite`, roomType: 'Signature Suite', price: price + Math.round(price * 0.35), capacity: '4 Guests', image, available: true },
]);

const getUserNameParts = (name = '') => {
  const [firstName = '', ...lastNameParts] = String(name).trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: lastNameParts.join(' ') };
};

const isValidDateValue = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const ensureExactSearchHotel = async (query) => {
  const hotelName = String(query || '').trim().replace(/\s+/g, ' ');
  const isKnownLocationOnly = normalizeHotelLocationKey({ location: hotelName }) !== slugify(hotelName);
  const isLikelyHotelName = HOTEL_NAME_PATTERN.test(hotelName) || (hotelName.split(/\s+/).length >= 2 && !isKnownLocationOnly);
  if (!hotelName || !isLikelyHotelName) return null;

  const exactNameRegex = new RegExp(`^${escapeRegex(hotelName)}$`, 'i');
  const existingHotel = await Hotel.findOne({ name: exactNameRegex });
  if (existingHotel) return serializeHotelForClient(existingHotel);

  const cityLabel = resolveHotelLocationLabel({ name: hotelName, location: hotelName });
  const locationKey = `search-${slugify(hotelName)}`;
  const imageMeta = await getHotelImages({
    name: hotelName,
    location: cityLabel,
    country: 'India',
    category: 'luxury hotel',
    description: `${hotelName} premium hotel stay`,
  });
  const imagePool = uniqueImageList([
    imageMeta.heroImage,
    ...(imageMeta.rotationPool || []),
    ...(imageMeta.imagePool || []),
    ...(imageMeta.gallery || []),
  ]);
  const heroImage = imageMeta.heroImage || imagePool[0] || '';
  const price = 6500 + (hotelName.length % 6) * 900;

  const createdHotel = await Hotel.create({
    name: hotelName,
    roomType: 'Premium Room',
    city: cityLabel,
    location: cityLabel,
    locationKey,
    sourceLocation: hotelName,
    sourceType: 'hotel-search',
    price,
    rating: 4.7,
    heroImage,
    image: heroImage,
    imageSource: imageMeta.imageSource || 'image-service',
    imageUpdatedAt: imageMeta.imageUpdatedAt || new Date(),
    imagePool: imagePool.slice(0, 20),
    images: imagePool.length > 0 ? imagePool : [heroImage],
    gallery: uniqueImageList([heroImage, ...(imageMeta.gallery || []), ...imagePool.slice(1, 7)]).slice(0, 8),
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Restaurant', 'Room Service'],
    description: `Experience a premium stay at ${hotelName} with curated rooms, thoughtful service, and modern comfort.`,
    featured: true,
    rooms: buildSearchHotelRooms(hotelName, price, heroImage),
  });

  return serializeHotelForClient(createdHotel);
};

const enrichHotelData = (otmData, imagesList = [], imageMeta = {}) => {
  const basePrice = Math.floor(Math.random() * 6500) + 3500; 
  const imagePool = uniqueImageList([
    ...(Array.isArray(imagesList) ? imagesList : []),
    imageMeta.heroImage,
    ...(imageMeta.rotationPool || []),
    ...(imageMeta.gallery || []),
  ]);
  const heroImage = imageMeta.imageSource === 'fallback' && imagePool[0]
    ? imagePool[0]
    : (imageMeta.heroImage || imagePool[0] || imagesList?.[0] || '');
  
  return {
    id: otmData.xid,
    name: otmData.name,
    city: otmData.address ? `${otmData.address.city || ''}` : "City Center",
    location: otmData.address ? `${otmData.address.city || ''}, ${otmData.address.country || ''}`.replace(/^, /, '') : "Central District",
    pricePerNight: basePrice,
    price: basePrice,
    rating: (Math.random() * 1.5 + 3.5), 
    reviewsCount: Math.floor(Math.random() * 2000) + 50,
    heroImage,
    imageSource: imageMeta.imageSource || 'image-service',
    imageUpdatedAt: imageMeta.imageUpdatedAt || new Date(),
    imagePool,
    images: imagePool.length > 0 ? imagePool : [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    image: heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: ["Free WiFi", "Swimming Pool", Math.random() > 0.5 ? "Spa & Wellness" : "Fitness Center", "Restaurant", Math.random() > 0.5 ? "Bar" : "Room Service"],
    type: "Hotel",
    isFeatured: Math.random() > 0.8,
    featured: Math.random() > 0.8,
    description: otmData.wikipedia_extracts?.text || `Experience luxury and comfort at ${otmData.name}. Centrally located with premium services.`,
    rooms: [
      { id: `${otmData.xid}-r1`, type: "Standard Room", price: basePrice, capacity: "2 Guests • 1 Bed", available: true },
      { id: `${otmData.xid}-r2`, type: "Deluxe View", price: basePrice + 1800, capacity: "2 Guests • 1 King Bed", available: true },
      { id: `${otmData.xid}-r3`, type: "Executive Suite", price: basePrice + 4200, capacity: "4 Guests • 2 Queen Beds", available: true, featured: true }
    ],
    lat: otmData.point?.lat,
    lng: otmData.point?.lon
  };
};

// @desc    Fetch accommodations via DB & OpenTripMap
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req, res) => {
  try {
    const {
      destination = '',
      location = '',
      packageId = '',
      destinationId = '',
      minPrice,
      maxPrice,
      stars,
      limit,
    } = req.query;
    const cacheKey = destination.toLowerCase().trim();
    const exactSearchHotel = await ensureExactSearchHotel(destination || location);

    const catalogRequested = Boolean(destination || location || packageId || destinationId);
    if (catalogRequested) {
      const catalogHotels = await ensureHotelCatalogForContext(
        {
          destinationId: destinationId || undefined,
          packageId: packageId || undefined,
          location: destination || location || '',
          name: destination || location || '',
          sourceType: packageId ? 'package' : destinationId ? 'destination' : 'manual',
        },
        { count: Number(limit) || 4 }
      );

      let finalCatalogResults = catalogHotels.map((hotel) => serializeHotelForClient(hotel));
      if (minPrice) finalCatalogResults = finalCatalogResults.filter((h) => h.price >= Number(minPrice));
      if (maxPrice) finalCatalogResults = finalCatalogResults.filter((h) => h.price <= Number(maxPrice));
      if (stars && Number(stars) > 0) finalCatalogResults = finalCatalogResults.filter((h) => Math.floor(h.rating) === Number(stars));
      if (exactSearchHotel && !finalCatalogResults.some((hotel) => String(hotel.name).toLowerCase() === String(exactSearchHotel.name).toLowerCase())) {
        finalCatalogResults = [exactSearchHotel, ...finalCatalogResults];
      }

      return res.json({ success: true, data: finalCatalogResults, message: "Hotels fetched successfully" });
    }
    
    // 1. Fetch DB Hotels matching destination
    // If destination is empty, this returns all seeded hotels.
    const dbQuery = destination ? { city: new RegExp(destination, 'i') } : {};
    const dbHotels = await Hotel.find(dbQuery).limit(20);

    // Format DB Hotels to look similar
    const formattedDbHotels = dbHotels.map(h => ({
      id: h._id.toString(),
      name: h.name,
      city: h.city,
      location: `${h.city}, India`,
      pricePerNight: h.price,
      price: h.price,
      rating: h.rating,
      reviewsCount: Math.floor(Math.random() * 500) + 50,
      heroImage: h.heroImage || h.image || h.images?.[0] || h.gallery?.[0] || '',
      imageSource: h.imageSource || 'database',
      imageUpdatedAt: h.imageUpdatedAt,
      imagePool: uniqueImageList([
        h.heroImage,
        h.image,
        ...(h.images || []),
        ...(h.gallery || []),
        ...(h.imagePool || []),
      ]).slice(0, 20),
      images: uniqueImageList([
        h.heroImage,
        h.image,
        ...(h.images || []),
        ...(h.gallery || []),
      ]),
      image: h.heroImage || h.image,
      gallery: h.gallery || [],
      amenities: h.amenities,
      type: "Hotel",
      isFeatured: h.featured,
      featured: h.featured,
      description: `A stunning stay at ${h.name} in ${h.city}`,
    }));

    let externalHotels = [];

    // 2. If we don't have enough hotels for the specific destination, fetch from OpenTripMap
    if (destination && formattedDbHotels.length < 10) {
      if (hotelCache[cacheKey] && hotelCache[cacheKey].timestamp > Date.now() - CACHE_TTL) {
        externalHotels = hotelCache[cacheKey].data;
      } else {
        const apiKey = process.env.OPENTRIPMAP_API_KEY;
        if (apiKey) {
          const geonameUrl = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(destination)}&apikey=${apiKey}`;
          const geonameRes = await fetch(geonameUrl);
          const geonameData = await geonameRes.json();
          
          if (geonameData && geonameData.status === 'OK') {
            const locus = { lon: geonameData.lon, lat: geonameData.lat };
            // Lowered rate to 2 to find more hotels if needed
            const radiusUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon=${locus.lon}&lat=${locus.lat}&kinds=accomodations&rate=2&apikey=${apiKey}`;
            const placesRes = await fetch(radiusUrl);
            const placesData = await placesRes.json();
            
            if (placesData && placesData.features) {
              const topFeatures = placesData.features.filter(f => f.properties.name).slice(0, 10 - formattedDbHotels.length);
              
              const fetchPromises = topFeatures.map(async (feature) => {
                const xid = feature.properties.xid;
                if (!xid) return null;
                try {
                  const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`;
                  const detailRes = await fetch(detailUrl);
                  const detailData = await detailRes.json();
                  
                  const imageMeta = await getHotelImages({
                    name: detailData.name,
                    location: detailData.address?.city || detailData.address?.state || destination || detailData.name,
                    country: detailData.address?.country || '',
                    category: 'luxury hotel',
                    description: detailData.wikipedia_extracts?.text || detailData.name,
                  });
                  return enrichHotelData(
                    detailData,
                    imageMeta.rotationPool || imageMeta.imagePool || imageMeta.gallery || [],
                    imageMeta
                  );
                } catch (e) {
                  return null;
                }
              });

              // Fetch in parallel to avoid long response times
              const results = await Promise.all(fetchPromises);
              externalHotels = results.filter(h => h !== null);
              
              hotelCache[cacheKey] = { data: externalHotels, timestamp: Date.now() };
            }
          }
        }
      }
    }

    let finalResults = [...formattedDbHotels, ...externalHotels];

    // Apply post-filters
    if (minPrice) finalResults = finalResults.filter(h => h.price >= Number(minPrice));
    if (maxPrice) finalResults = finalResults.filter(h => h.price <= Number(maxPrice));
    if (stars && Number(stars) > 0) finalResults = finalResults.filter(h => Math.floor(h.rating) === Number(stars));

    res.json({ success: true, data: finalResults, message: "Hotels fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotels', error: err.message });
  }
};

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
export const getFeaturedHotels = async (req, res) => {
  try {
    const featured = await Hotel.find({ featured: true }).limit(5);
    res.json({ success: true, data: featured, message: "Featured hotels fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured hotels', error: err.message });
  }
};

// @desc    Get specific hotel details via OpenTripMap or DB
// @route   GET /api/hotels/:id
// @access  Public
export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's MongoDB ID
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
       const dbHotel = await Hotel.findById(id);
       if (dbHotel) {
          const formatted = serializeHotelForClient(dbHotel);
          return res.json({ success: true, data: formatted, message: "Hotel fetched successfully" });
       }
}

    const apiKey = process.env.OPENTRIPMAP_API_KEY;
    if (apiKey) {
      const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${apiKey}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      
      if (!detailData.error) {
        const imageMeta = await getHotelImages({
          name: detailData.name,
          location: detailData.address?.city || detailData.address?.state || detailData.name,
          country: detailData.address?.country || '',
          category: 'luxury hotel',
          description: detailData.wikipedia_extracts?.text || detailData.name,
        });

        return res.json({
          success: true,
          data: enrichHotelData(
            detailData,
            imageMeta.rotationPool || imageMeta.imagePool || imageMeta.gallery || [],
            imageMeta
          ),
          message: "Hotel fetched successfully"
        });
      }
    }
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hotel details', error: err.message });
  }
};

// @desc    Create a Hotel
// @route   POST /api/hotels
// @access  Private/Admin
export const createHotel = async (req, res) => {
  try {
    const newHotel = new Hotel({
      ...req.body,
      roomType: req.body.roomType || req.body.rooms?.[0]?.roomType || '',
      locationKey: req.body.locationKey || normalizeHotelLocationKey(req.body),
      sourceLocation: req.body.sourceLocation || req.body.location || req.body.city || resolveHotelLocationLabel(req.body),
      sourceType: req.body.sourceType || 'manual',
      isCatalogHotel: Boolean(req.body.isCatalogHotel),
      catalogRank: Number.isFinite(Number(req.body.catalogRank)) ? Number(req.body.catalogRank) : 0,
      destinationId: req.body.destinationId || undefined,
      packageId: req.body.packageId || undefined,
    });
    const saved = await newHotel.save();
    
    await createLog({
      user: req.user._id,
      action: 'Hotel Creation',
      category: 'Hotel',
      details: `Administrator created hotel: ${saved.name} in ${saved.city}`,
      status: 'success'
    }, req);

    res.status(201).json({ success: true, data: saved, message: "Hotel created successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create hotel', error: err.message });
  }
};

// @desc    Update a Hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
export const updateHotel = async (req, res) => {
  try {
    const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Hotel not found' });

    if (!updated.locationKey) {
      updated.locationKey = normalizeHotelLocationKey(updated.toObject ? updated.toObject() : updated);
    }
    if (!updated.sourceLocation) {
      updated.sourceLocation = resolveHotelLocationLabel(updated.toObject ? updated.toObject() : updated);
    }
    if (!updated.roomType && updated.rooms?.[0]?.roomType) {
      updated.roomType = updated.rooms[0].roomType;
    }
    await updated.save();
    
    await createLog({
      user: req.user._id,
      action: 'Hotel Update',
      category: 'Hotel',
      details: `Administrator updated hotel: ${updated.name}`,
      status: 'info'
    }, req);

    res.json({ success: true, data: updated, message: "Hotel updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update hotel', error: err.message });
  }
};

// @desc    Delete a Hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
export const deleteHotel = async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Hotel not found' });
    
    await createLog({
      user: req.user._id,
      action: 'Hotel Deletion',
      category: 'Hotel',
      details: `Administrator deleted hotel: ${deleted.name}`,
      status: 'warning'
    }, req);

    res.json({ success: true, data: null, message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete hotel', error: err.message });
  }
};

// @desc    Save Booking
// @route   POST /api/hotels/booking
// @access  Private
export const createHotelBooking = async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      roomId,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      totalPrice,
      paymentStatus = 'PENDING',
      bookingStatus = 'PENDING',
      ...guestDetails
    } = req.body;

    const userName = getUserNameParts(req.user?.name);
    const normalizedGuestDetails = {
      firstName: String(guestDetails.firstName || userName.firstName || '').trim(),
      lastName: String(guestDetails.lastName || userName.lastName || 'Guest').trim(),
      email: String(guestDetails.email || req.user?.email || '').trim(),
      phone: String(guestDetails.phone || req.user?.phone || '').trim(),
      requests: String(guestDetails.requests || '').trim(),
    };

    if (!hotelId) {
      return res.status(400).json({ success: false, message: 'Hotel ID is required' });
    }

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room is required' });
    }

    if (!normalizedGuestDetails.firstName) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }

    if (!normalizedGuestDetails.email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!normalizedGuestDetails.phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!isValidDateValue(checkIn) || !isValidDateValue(checkOut)) {
      return res.status(400).json({ success: false, message: 'Valid check-in and check-out dates are required' });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    if (!Number.isFinite(Number(totalPrice)) || Number(totalPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid booking total is required' });
    }

    const normalizedHotelId = String(hotelId);

    if (normalizedHotelId.match(/^[0-9a-fA-F]{24}$/)) {
      const hotelExists = await Hotel.exists({ _id: hotelId });
      if (!hotelExists) {
        return res.status(404).json({ success: false, message: 'Hotel not found' });
      }
    } else if (process.env.OPENTRIPMAP_API_KEY) {
      const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${normalizedHotelId}?apikey=${process.env.OPENTRIPMAP_API_KEY}`;
      const detailRes = await fetch(detailUrl);
      const detailData = await detailRes.json();
      if (!detailRes.ok || detailData.error) {
        return res.status(404).json({ success: false, message: 'Hotel not found' });
      }
    } else if (!hotelName) {
      return res.status(400).json({ success: false, message: 'Hotel details are required' });
    }

    const reservationId = '#KT-' + Math.floor(10000 + Math.random() * 90000);
    
    const booking = new HotelBooking({
      ...normalizedGuestDetails,
      userId: req.user._id,
      hotelId: normalizedHotelId,
      hotelName,
      roomId: String(roomId),
      checkIn,
      checkOut,
      guests: Number(guests),
      rooms: Number(rooms),
      totalPrice: Number(totalPrice),
      paymentStatus,
      bookingStatus,
      status: bookingStatus,
      reservationId,
    });

    const savedBooking = await booking.save();

    sendHotelBookingConfirmation(savedBooking.email, savedBooking).catch((emailErr) => {
      console.error('Hotel booking email failed:', emailErr.message);
    });
    
    await createLog({
      user: req.user ? req.user._id : null,
      action: 'Hotel Booking',
      category: 'Booking',
      details: `New hotel booking created for ${savedBooking.hotelName || savedBooking.hotelId}. Reservation ID: ${savedBooking.reservationId}`,
      status: 'success'
    }, req);

    res.status(201).json({
      success: true,
      data: { reservationId: savedBooking.reservationId, ...savedBooking._doc },
      message: "Hotel booking successfully created"
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Failed to complete booking', error: err.message });
  }
};

// @desc    Heal broken hotel image
// @route   PATCH /api/hotels/:id/heal-image
// @access  Public (Auto-healing)
export const healHotelImage = async (req, res) => {
  try {
    const { id } = req.params;
    let hotel;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id);
    } else {
      console.log(`[Healer] 🌐 Handling external hotel (xid): ${id}`);
      return res.json({
        success: true,
        newUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
        message: 'External hotel placeholder provided'
      });
    }

    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    console.log(`[Heal] 🔍 Healing hotel: ${hotel.name}`);
    
    const images = await getHotelImages({
      name: hotel.name,
      location: hotel.city || hotel.location,
      category: 'luxury hotel',
      description: hotel.description || hotel.name,
      forceRefresh: true,
    });

    if (images && images.heroImage) {
      const rotationPool = uniqueImageList([
        images.heroImage,
        ...(images.rotationPool || []),
        ...(images.gallery || []),
      ]);
      hotel.heroImage = images.heroImage;
      hotel.imageSource = images.imageSource || 'image-service';
      hotel.imageUpdatedAt = images.imageUpdatedAt || new Date();
      hotel.imagePool = rotationPool.slice(0, 20);
      hotel.image = images.heroImage;
      hotel.images = rotationPool.length > 0 ? rotationPool : [images.heroImage];
      hotel.gallery = images.gallery && images.gallery.length > 0
        ? images.gallery
        : rotationPool.slice(1, 7);
      
      await hotel.save();
      
      console.log(`[Heal] ? Hotel ${hotel.name} healed with: ${hotel.image}`);
      return res.json({ 
        success: true, 
        newUrl: hotel.image,
        gallery: hotel.gallery,
        imagePool: hotel.imagePool,
        imageSource: hotel.imageSource,
        imageUpdatedAt: hotel.imageUpdatedAt,
        message: 'Image healed and persisted to database' 
      });
    }
    throw new Error('Could not find a replacement image');
  } catch (err) {
    console.error(`[Heal] ❌ Hotel healing failed:`, err.message);
    res.status(500).json({ success: false, message: 'Healing failed', error: err.message });
  }
};


import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import Hotel from '../models/Hotel.js';
import Transportation from '../models/Transportation.js';
import { getDestinationImages } from '../services/imageService.js';
import { ensureHotelCatalogForContext } from '../services/hotelCatalogService.js';
import { generateTravelPackage } from '../services/aiService.js';
import { createLog } from '../utils/logger.js';

const uniqueImageList = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((image) => {
    const next = String(image).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const buildApproxDestinationPrice = (name = '', type = 'Adventure') => {
  const text = `${name} ${type}`.toLowerCase();
  const hashBump = String(name || type).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2500;
  let base = 9000;
  if (/luxury|honeymoon|wildlife|island/.test(text)) base = 18000;
  else if (/mountain|beach|desert|adventure/.test(text)) base = 13000;
  else if (/spiritual|city|historical/.test(text)) base = 7500;
  return Math.round((base + hashBump) / 500) * 500;
};

const DESTINATIONS_TO_FETCH = [
  { term: "Eiffel Tower", lon: 2.2945, lat: 48.8584 },
  { term: "Taj Mahal", lon: 78.0421, lat: 27.1751 },
  { term: "Colosseum", lon: 12.4922, lat: 41.8902 },
  { term: "Mount Fuji", lon: 138.7274, lat: 35.3606 },
  { term: "Statue of Liberty", lon: -74.0445, lat: 40.6892 },
  { term: "Machu Picchu", lon: -72.5450, lat: -13.1631 },
  { term: "Sydney Opera", lon: 151.2153, lat: -33.8568 },
  { term: "Burj Khalifa", lon: 55.2708, lat: 25.1972 },
  { term: "Sagrada Familia", lon: 2.1744, lat: 41.4036 }
];

let cachedDestinations = null;

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function fetchExternalDestinations() {
  if (cachedDestinations) return cachedDestinations;

  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return []; // Gracefully handle no api key setup

  const results = [];
  
  for (const dest of DESTINATIONS_TO_FETCH) {
    try {
      const autoSuggestUrl = `https://api.opentripmap.com/0.1/en/places/autosuggest?name=${encodeURIComponent(dest.term)}&radius=10000&lon=${dest.lon}&lat=${dest.lat}&rate=3&apikey=${apiKey}`;
      const suggestRes = await fetch(autoSuggestUrl);
      const suggestData = await suggestRes.json();

      if (suggestData.features && suggestData.features.length > 0) {
        const xid = suggestData.features[0].properties.xid;
        const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();

        if (detailData && detailData.name) {
          const imageContext = {
            name: detailData.name,
            location: [
              detailData.address?.city,
              detailData.address?.state,
              detailData.address?.country,
            ].filter(Boolean).join(', ') || detailData.name,
            country: detailData.address?.country || '',
            category: pickRandom(['Adventure', 'Family', 'Luxury', 'Nature']),
            description: detailData.wikipedia_extracts?.text || `A beautiful destination known as ${detailData.name}.`,
            type: pickRandom(['Adventure', 'Family', 'Luxury']),
          };

          const imageDetails = await getDestinationImages(imageContext);
          const previewImage = detailData.preview?.source;
          const rotationPool = uniqueImageList([
            imageDetails.heroImage,
            ...(imageDetails.rotationPool || []),
            ...(imageDetails.gallery || []),
            previewImage,
          ]);
          const heroImage = imageDetails.imageSource === 'fallback' && previewImage
            ? previewImage
            : (imageDetails.heroImage || previewImage || rotationPool[0]);
          const gallery = imageDetails.gallery && imageDetails.gallery.length > 0
            ? imageDetails.gallery
            : rotationPool.slice(1, 7);

          results.push({
            _id: detailData.xid,
            name: detailData.name,
            type: pickRandom(['Adventure', 'Family', 'Luxury']),
            budget: pickRandom(['Low', 'Medium', 'High']),
            duration: pickRandom(['3 Days', '5 Days', '7 Days', '10 Days']),
            price: buildApproxDestinationPrice(detailData.name, 'Adventure'),
            description: detailData.wikipedia_extracts?.text || `A beautiful destination known as ${detailData.name}.`,
            heroImage,
            imageSource: imageDetails.imageSource || 'fallback',
            imageUpdatedAt: imageDetails.imageUpdatedAt || new Date(),
            imagePool: rotationPool.slice(0, 20),
            images: rotationPool.length > 0 ? rotationPool : [heroImage],
            gallery,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching external destination:", dest.term, err);
    }
  }

  cachedDestinations = results;
  return results;
}

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
export const getDestinations = async (req, res) => {
  try {
    const { type, budget, duration } = req.query;
    let externalDestinations = await fetchExternalDestinations();
    let dbDestinations = await Destination.find();
    
    // Merge DB destinations and external ones
    let allDestinations = [...dbDestinations, ...externalDestinations];

    if (type && type !== 'All') {
      allDestinations = allDestinations.filter(d => d.type === type);
    }
    if (budget && budget !== 'All') {
      allDestinations = allDestinations.filter(d => d.budget === budget);
    }
    if (duration && duration !== 'All') {
      allDestinations = allDestinations.filter(d => d.duration === duration);
    }

    res.json({ success: true, data: allDestinations, message: "Destinations fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch destinations', error: err.message });
  }
};

// @desc    Get top destinations (bonus)
// @route   GET /api/destinations/top
// @access  Public
export const getTopDestinations = async (req, res) => {
  try {
    const dbTop = await Destination.find().limit(4);
    res.json({ success: true, data: dbTop, message: "Top destinations fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch top destinations', error: err.message });
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
export const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const destinations = await fetchExternalDestinations();
      const dest = destinations.find(d => d._id === id);
      if (dest) {
         return res.json({ success: true, data: dest, message: "Destination fetched successfully" });
      }
      
      const apiKey = process.env.OPENTRIPMAP_API_KEY;
      if (apiKey) {
        const detailUrl = `https://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${apiKey}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        
        if (detailData && !detailData.error) {
           const imageDetails = await getDestinationImages({
             name: detailData.name,
             location: [
               detailData.address?.city,
               detailData.address?.state,
               detailData.address?.country,
             ].filter(Boolean).join(', ') || detailData.name,
             country: detailData.address?.country || '',
             category: pickRandom(['Adventure', 'Family', 'Luxury', 'Nature']),
             description: detailData.wikipedia_extracts?.text || `A beautiful destination known as ${detailData.name}.`,
             forceRefresh: true,
           });
           const rotationPool = uniqueImageList([
             imageDetails.heroImage,
             ...(imageDetails.rotationPool || []),
             ...(imageDetails.gallery || []),
             detailData.preview?.source,
           ]);
           const heroImage = imageDetails.imageSource === 'fallback' && detailData.preview?.source
             ? detailData.preview.source
             : (imageDetails.heroImage || detailData.preview?.source || rotationPool[0]);

           return res.json({
             success: true,
             data: {
               _id: detailData.xid,
               name: detailData.name,
               type: pickRandom(['Adventure', 'Family', 'Luxury']),
               budget: pickRandom(['Low', 'Medium', 'High']),
               duration: pickRandom(['3 Days', '5 Days', '7 Days']),
               price: buildApproxDestinationPrice(detailData.name, 'Adventure'),
               description: detailData.wikipedia_extracts?.text || `A beautiful destination known as ${detailData.name}.`,
               heroImage,
               imageSource: imageDetails.imageSource || 'fallback',
               imageUpdatedAt: imageDetails.imageUpdatedAt || new Date(),
               imagePool: rotationPool.slice(0, 20),
               images: rotationPool.length > 0 ? rotationPool : [heroImage],
               gallery: imageDetails.gallery && imageDetails.gallery.length > 0 ? imageDetails.gallery : rotationPool.slice(1, 7),
             },
             message: "Destination fetched successfully"
          });
        }
      }
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const destRaw = await Destination.findById(req.params.id);
    if (!destRaw) return res.status(404).json({ success: false, message: 'Destination not found' });
    
    // Add default fallbacks if properties are physically missing or empty on the document
    const dest = destRaw.toObject();
    dest.heroImage = dest.heroImage || dest.images?.[0] || dest.gallery?.[0] || '';
    dest.imagePool = uniqueImageList([
      dest.heroImage,
      ...(dest.imagePool || []),
      ...(dest.gallery || []),
      ...(dest.images || []),
    ]).slice(0, 20);
    if (!dest.gallery || dest.gallery.length === 0) {
      dest.gallery = dest.imagePool.slice(1, 7);
    }
    if (!dest.tagline) dest.tagline = `Experience the journey of a lifetime in ${dest.name}.`;
    if (!dest.overview) dest.overview = dest.description || `Discover the beauty of ${dest.name}, a perfect blend of culture, adventure, and relaxation.`;
    if (!dest.famousAttractions || dest.famousAttractions.length === 0) dest.famousAttractions = [`City Center of ${dest.name}`, `Historic Landmarks`, `Local Markets`];
    if (!dest.localFood || dest.localFood.length === 0) dest.localFood = [`Traditional ${dest.name} Cuisine`, `Street Food`, `Local Desserts`];
    if (!dest.thingsToDo || dest.thingsToDo.length === 0) dest.thingsToDo = ['Sightseeing', 'Shopping', 'Cultural Tours', 'Local Dining'];
    if (!dest.weather) dest.weather = 'Pleasant and welcoming weather for tourists all year round.';
    if (!dest.bestTime) dest.bestTime = 'Year Round';

    // Fetch dependencies
    // To safely search irrespective of casing etc., use regex or broad text match if text index exists
    const searchRegex = new RegExp(dest.name, 'i');
    
    // Fallback packages matching destination name (or random if we want to guarantee data)
    let packages = await Package.find({ name: searchRegex }).limit(4);
    if(packages.length === 0) {
       packages = await Package.find().limit(3); // Random fallback
    }

    let hotels = await Hotel.find({ city: searchRegex }).limit(4);
    if (hotels.length === 0) {
       hotels = await Hotel.find().limit(3);
    }

    let transportations = await Transportation.find({ to: searchRegex }).limit(4);
    if(transportations.length === 0) {
       transportations = await Transportation.find().limit(3);
    }

    res.json({
      success: true, 
      data: dest,
      packages,
      hotels,
      transportations, 
      message: "Destination fetched successfully" 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch destination', error: err.message });
  }
};

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
export const createDestination = async (req, res) => {
  try {
    const newDest = new Destination(req.body);
    const saved = await newDest.save();
    await ensureHotelCatalogForContext(saved, { count: 4 });
    
    await createLog({
      user: req.user._id,
      action: 'Destination Creation',
      category: 'Destination',
      details: `Administrator created destination: ${saved.name}`,
      status: 'success'
    }, req);

    res.status(201).json({ success: true, data: saved, message: "Destination created successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create destination', error: err.message });
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
export const updateDestination = async (req, res) => {
  try {
    const updated = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Destination not found' });
    await ensureHotelCatalogForContext(updated, { count: 4 });
    
    await createLog({
      user: req.user._id,
      action: 'Destination Update',
      category: 'Destination',
      details: `Administrator updated destination: ${updated.name}`,
      status: 'info'
    }, req);

    res.json({ success: true, data: updated, message: "Destination updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update destination', error: err.message });
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
export const deleteDestination = async (req, res) => {
  try {
    const deleted = await Destination.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Destination not found' });
    
    await createLog({
      user: req.user._id,
      action: 'Destination Deletion',
      category: 'Destination',
      details: `Administrator deleted destination: ${deleted.name}`,
      status: 'warning'
    }, req);

    res.json({ success: true, data: null, message: 'Destination deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete destination', error: err.message });
  }
};
// @desc    Auto-heal broken image by fetching fresh ones from Unsplash/Pexels
// @route   PATCH /api/destinations/:id/heal-image
// @access  Public
export const healDestinationImage = async (req, res) => {
  try {
    const { id } = req.params;
    let dest;

    // Resilience against non-ObjectId strings (xids from OpenTripMap)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      dest = await Destination.findById(id);
    } else {
      console.log(`[Healer] ?? Handling external entity (xid): ${id}`);
      return res.json({
        success: true,
        newUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=85',
        message: 'External entity placeholder provided'
      });
    }

    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    console.log(`[Healer] ??? Repairing image for ${dest.name}...`);

    const imageDetails = await getDestinationImages({
      name: dest.name,
      location: dest.location,
      category: dest.type,
      country: 'India',
      description: dest.description,
      forceRefresh: true,
    });

    if (imageDetails && imageDetails.heroImage) {
      const rotationPool = uniqueImageList([
        imageDetails.heroImage,
        ...(imageDetails.rotationPool || []),
        ...(imageDetails.gallery || []),
      ]);

      dest.heroImage = imageDetails.heroImage;
      dest.imageSource = imageDetails.imageSource || 'image-service';
      dest.imageUpdatedAt = imageDetails.imageUpdatedAt || new Date();
      dest.imagePool = rotationPool.slice(0, 20);
      dest.images = rotationPool.length > 0 ? rotationPool : [imageDetails.heroImage];
      dest.gallery = imageDetails.gallery && imageDetails.gallery.length > 0
        ? imageDetails.gallery
        : rotationPool.slice(1, 7);

      await dest.save();
      console.log(`[Healer] ? Successfully updated ${dest.name} with new image`);

      return res.json({
        success: true,
        newUrl: imageDetails.heroImage,
        gallery: dest.gallery,
        imagePool: dest.imagePool,
        imageSource: dest.imageSource,
        imageUpdatedAt: dest.imageUpdatedAt,
        message: 'Image healed and persisted to database'
      });
    }

    res.status(500).json({ success: false, message: 'Could not fetch a suitable replacement image' });
  } catch (err) {
    console.error('[Heal Error]', err);
    res.status(500).json({ success: false, message: 'Failed to heal image', error: err.message });
  }
};
// @desc    AI Search for a destination to generate or fetch
// @route   POST /api/destinations/ai-search
// @access  Public
export const aiSearchDestination = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // 1. Search existing destinations
    let existingDest = await Destination.findOne({
      name: { $regex: new RegExp(normalizedQuery, 'i') }
    });

    if (existingDest) {
      return res.json({ success: true, isNew: false, data: existingDest, message: "Found existing destination" });
    }

    console.log(`[AI Destination Search] 🔍 Generating new destination for: ${query}`);

    // 2. Generate destination & package data using AI
    const aiData = await generateTravelPackage(query);

    // 3. Fetch images
    let images = { heroImage: '', gallery: [] };
    try {
      images = await getDestinationImages(`${query} travel`);
    } catch (imgErr) {
      console.warn("Failed to fetch images for AI generated destination:", imgErr.message);
      images = {
        heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522083111867-5fb50eb34ee2?auto=format&fit=crop&q=80'
        ]
      };
    }

    // 4. Save to Package Collection first (so we have the ID)
    const newPackageData = {
      ...aiData.package,
      image: images.heroImage,
      heroImage: images.heroImage,
      imageSource: images.imageSource || 'image-service',
      imageUpdatedAt: images.imageUpdatedAt || new Date(),
      imagePool: uniqueImageList([images.heroImage, ...(images.rotationPool || images.imagePool || images.gallery || [])]).slice(0, 20),
      gallery: images.gallery,
      isAIGenerated: false // Set to false to treat as normal
    };

    const newPkg = new Package(newPackageData);
    const savedPackage = await newPkg.save();

    // 5. Save to Destination Collection & Link Package
    const newDestData = {
      ...aiData.destination,
      packageId: savedPackage._id, // Link to the new package
      itinerary: aiData.package.itinerary,
      highlights: aiData.package.highlights,
      included: aiData.package.included,
      excluded: aiData.package.excluded,
      faqs: aiData.package.faqs,
      hotelsInfo: aiData.package.hotelsInfo,
      transportDesc: aiData.package.transportDesc,
      heroImage: images.heroImage,
      imageSource: images.imageSource || 'image-service',
      imageUpdatedAt: images.imageUpdatedAt || new Date(),
      imagePool: uniqueImageList([images.heroImage, ...(images.rotationPool || images.imagePool || images.gallery || [])]).slice(0, 20),
      images: images.gallery && images.gallery.length > 0 ? [images.heroImage, ...images.gallery] : [images.heroImage],
      gallery: images.gallery,
      isAIGenerated: false
    };

    const newDest = new Destination(newDestData);
    const savedDest = await newDest.save();
    await ensureHotelCatalogForContext(savedDest, { count: 4 });

    console.log(`[AI Search] ✨ Successfully generated and saved Destination & Package for ${query}`);

    res.status(201).json({ 
      success: true, 
      isNew: true, 
      data: savedDest, 
      packageId: savedPackage._id,
      message: "Destination and Package generated successfully" 
    });
  } catch (err) {
    console.error("[AI Destination Search Error]:", err);
    res.status(500).json({ success: false, message: 'Failed to perform AI search', error: err.message });
  }
};


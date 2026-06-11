import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import { generateTravelPackage } from '../services/aiService.js';
import { getDestinationImages } from '../services/imageService.js';
import { ensureHotelCatalogForContext } from '../services/hotelCatalogService.js';

const uniqueImageList = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((image) => {
    const next = String(image).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

/**
 * @desc    Search for a destination, generating it via AI if it doesn't exist.
 *          This version is normalized to use the main Destination and Package collections.
 * @route   GET /api/search/place?q=jaipur
 * @access  Public
 */
export const searchDynamicDestination = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchQuery = q.trim();
    const normalizedQuery = searchQuery.toLowerCase();

    // 1. Check existing destinations in the main collection
    let existingDest = await Destination.findOne({
      name: { $regex: new RegExp(`^${normalizedQuery}$`, 'i') }
    });

    if (existingDest) {
      console.log(`[Search] Found existing destination: ${existingDest.name}`);
      return res.status(200).json(existingDest);
    }

    console.log(`[Search] Cache Miss: Generating rich destination for ${searchQuery}...`);

    // 2. Generate rich data using AI Service
    const aiData = await generateTravelPackage(searchQuery);

    // 3. Fetch premium images
    let images = { heroImage: '', gallery: [], imagePool: [] };
    try {
      images = await getDestinationImages(`${searchQuery} travel tourism`);
    } catch (imgErr) {
      console.warn("Failed to fetch images:", imgErr.message);
      images = {
        heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=85',
        gallery: [
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1522083111867-5fb50eb34ee2?auto=format&fit=crop&w=1600&q=85'
        ],
        imagePool: [
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1522083111867-5fb50eb34ee2?auto=format&fit=crop&w=1600&q=85'
        ]
      };
    }

    // 4. Save to Package Collection
    const newPackageData = {
      ...aiData.package,
      image: images.heroImage,
      heroImage: images.heroImage,
      imageSource: images.imageSource || 'image-service',
      imageUpdatedAt: images.imageUpdatedAt || new Date(),
      imagePool: uniqueImageList([images.heroImage, ...(images.rotationPool || images.imagePool || images.gallery || [])]).slice(0, 20),
      gallery: images.gallery,
      isAIGenerated: false // Treat as normal premium content
    };
    const newPkg = new Package(newPackageData);
    const savedPackage = await newPkg.save();

    // 5. Save to Destination Collection
    const newDestData = {
      ...aiData.destination,
      packageId: savedPackage._id,
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

    console.log(`[Search] ✨ Successfully normalized and saved ${searchQuery}`);

    // 6. Return the saved destination
    res.status(201).json(savedDest);

  } catch (error) {
    console.error('Error generating normalized destination:', error);
    res.status(500).json({ 
      message: 'Failed to generate destination', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get destination by slug (kept for backward compatibility but searches main collection)
 * @route   GET /api/search/destination/:slug
 */
export const getDestinationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const nameFromSlug = slug.replace(/-/g, ' ');
    
    const dest = await Destination.findOne({ 
      name: { $regex: new RegExp(`^${nameFromSlug}$`, 'i') } 
    });

    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    res.status(200).json(dest);
  } catch (error) {
    console.error('Error fetching by slug:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

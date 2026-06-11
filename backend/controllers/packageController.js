import Package from '../models/Package.js';
import Destination from '../models/Destination.js';
import { getDestinationImages } from '../services/imageService.js';
import { generateTravelPackage } from '../services/aiService.js';
import { createLog } from '../utils/logger.js';
import NodeCache from 'node-cache';
import { autoAssignBadge } from '../services/badgeService.js';
import { ensureHotelCatalogForContext } from '../services/hotelCatalogService.js';

const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds cache

const uniqueImageList = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((image) => {
    const next = String(image).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
export const getPackages = async (req, res) => {
  try {
    // Check cache
    const cacheKey = req.originalUrl;
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const {
      category, groupType, inclusions, minPrice, maxPrice,
      rating, duration, month, country, badge, comfortLevel, sort, page = 1, limit = 12
    } = req.query;

    const query = { isActive: true };

    if (category && category !== 'All') query.category = category;
    if (badge) query.badge = badge;
    if (groupType) query.groupType = { $in: groupType.split(',') };
    if (inclusions) query.inclusions = { $all: inclusions.split(',') };
    if (month) query.travelMonths = { $in: month.split(',') };
    if (comfortLevel) query.comfortLevel = comfortLevel;
    if (req.query.isEcoFriendly === 'true') query.isEcoFriendly = true;
    if (req.query.isTrending === 'true') query.popularity = { $gte: 90 };
    
    // Country logic - rudimentary: if country is India, we search location for India. 
    // Usually location has City, Country. For simplicity, we just regex location if country is provided.
    if (country) {
      if (country.toLowerCase() === 'india') {
        query.location = { $regex: /india/i };
      } else if (country.toLowerCase() === 'international') {
        query.location = { $not: { $regex: /india/i } };
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (duration) {
      // duration parsing: '1-3', '4-6', '7-10', '10+'
      // For simplicity, we'll assume the client sends duration text precisely, or we can use regex
      // Actually, we can use a basic regex if the backend duration is string like "5 Days"
      if (duration === '1-3') query.duration = { $regex: /^[1-3]\s/ };
      else if (duration === '4-6') query.duration = { $regex: /^[4-6]\s/ };
      else if (duration === '7-10') query.duration = { $regex: /^([7-9]|10)\s/ };
      else if (duration === '10+') query.duration = { $regex: /^(1[1-9]|[2-9][0-9])\s/ };
    }

    let sortOptions = { popularity: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };
    if (sort === 'popular') sortOptions = { popularity: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    if (sort === 'shortest') sortOptions = { duration: 1 }; // String sort might not be perfect for "10 days" vs "5 days", but keeping it simple

    const skip = (Number(page) - 1) * Number(limit);

    const packages = await Package.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v')
      .lean();

    const total = await Package.countDocuments(query);
    const totalPages = Math.ceil(total / Number(limit));

    const response = {
      success: true,
      data: packages,
      total,
      page: Number(page),
      totalPages,
      message: "Packages fetched successfully"
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch packages', error: err.message });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg, message: "Package fetched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch package', error: err.message });
  }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = async (req, res) => {
  try {
    const newPkg = new Package(req.body);
    
    // Auto-assign badge
    const allPkgsInCat = await Package.find({ category: newPkg.category }).lean();
    newPkg.badge = autoAssignBadge(newPkg, allPkgsInCat);
    
    const saved = await newPkg.save();
    cache.flushAll(); // Clear cache on change
    await ensureHotelCatalogForContext(saved, { count: 4 });
    
    await createLog({
      user: req.user._id,
      action: 'Create Package',
      category: 'Package',
      details: `Administrator created a new package: ${saved.name}`,
      status: 'success'
    }, req);

    res.status(201).json({ success: true, data: saved, message: "Package created successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create package', error: err.message });
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res) => {
  try {
    const pkgToUpdate = await Package.findById(req.params.id);
    if (!pkgToUpdate) return res.status(404).json({ success: false, message: 'Package not found' });

    Object.assign(pkgToUpdate, req.body);

    // Re-evaluate badge
    const allPkgsInCat = await Package.find({ category: pkgToUpdate.category }).lean();
    pkgToUpdate.badge = autoAssignBadge(pkgToUpdate, allPkgsInCat);

    const updated = await pkgToUpdate.save();
    cache.flushAll(); // Clear cache
    await ensureHotelCatalogForContext(updated, { count: 4 });
    
    await createLog({
      user: req.user._id,
      action: 'Update Package',
      category: 'Package',
      details: `Administrator updated package: ${updated.name}`,
      status: 'success'
    }, req);

    res.json({ success: true, data: updated, message: "Package updated successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update package', error: err.message });
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Package not found' });
    
    cache.flushAll(); // Clear cache

    await createLog({
      user: req.user._id,
      action: 'Delete Package',
      category: 'Package',
      details: `Administrator deleted package: ${deleted.name}`,
      status: 'warning'
    }, req);

    res.json({ success: true, data: null, message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete package', error: err.message });
  }
};

// @desc    Heal broken package image
// @route   PATCH /api/packages/:id/heal-image
// @access  Public (Auto-healing)
export const healPackageImage = async (req, res) => {
  try {
    const { id } = req.params;
    let pkg;

    // Resilience against non-ObjectId strings
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      pkg = await Package.findById(id);
    } else {
      console.log(`[Healer] 🌐 Handling external package (xid): ${id}`);
      return res.json({
        success: true,
        newUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
        message: 'External package placeholder provided'
      });
    }

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    console.log(`[Healer] 🛠️ Repairing image for ${pkg.name}...`);

    // Fetch fresh, destination-aware images
    const imageDetails = await getDestinationImages({
      name: pkg.name,
      location: pkg.location,
      category: pkg.category,
      country: 'India',
      forceRefresh: true,
    });

    if (imageDetails && imageDetails.heroImage) {
      pkg.image = imageDetails.heroImage;
      pkg.heroImage = imageDetails.heroImage;
      pkg.imageSource = imageDetails.imageSource || 'image-service';
      pkg.imageUpdatedAt = imageDetails.imageUpdatedAt || new Date();
      
      const rotationPool = uniqueImageList([
        imageDetails.heroImage,
        ...(imageDetails.rotationPool || []),
        ...(imageDetails.gallery || []),
      ]);
      pkg.imagePool = rotationPool.slice(0, 20);
      const gallery = Array.isArray(imageDetails.gallery) ? imageDetails.gallery : [];
      pkg.gallery = gallery.length > 0 ? gallery.slice(0, 8) : rotationPool.slice(1, 7);
      pkg.images = rotationPool.length > 0 ? rotationPool : [imageDetails.heroImage];

      await pkg.save();
      console.log(`[Healer] ? Successfully updated package ${pkg.name} with new image`);

      return res.json({ 
        success: true, 
        newUrl: imageDetails.heroImage,
        gallery: pkg.gallery,
        imagePool: pkg.imagePool,
        imageSource: pkg.imageSource,
        imageUpdatedAt: pkg.imageUpdatedAt,
        message: 'Image healed and persisted to database' 
      });
    }
    res.status(500).json({ success: false, message: 'Could not fetch a suitable replacement image' });
  } catch (err) {
    console.error('[Heal Error]', err);
    res.status(500).json({ success: false, message: 'Failed to heal image', error: err.message });
  }
};

// @desc    AI Search for a destination to generate or fetch package
// @route   POST /api/packages/ai-search
// @access  Public
export const aiSearchPackage = async (req, res) => {
  try {
    const query = req.query.query || req.body.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // 1. Search existing packages (using text search or regex on name/location)
    // We check if any package's name or location matches the query
    let existingPkg = await Package.findOne({
      $or: [
        { name: { $regex: new RegExp(normalizedQuery, 'i') } },
        { location: { $regex: new RegExp(normalizedQuery, 'i') } }
      ]
    });

    if (existingPkg) {
      return res.json({ success: true, isNew: false, data: existingPkg, message: "Found existing package" });
    }

    console.log(`[AI Search] 🔍 Generating new package for: ${query}`);

    // 2. Generate package & destination data using AI
    const aiData = await generateTravelPackage(query);

    // 3. Fetch images from Unsplash
    let images = { heroImage: '', gallery: [] };
    try {
      images = await getDestinationImages({
        name: aiData.package?.name || query,
        location: aiData.package?.location || query,
        category: aiData.package?.category,
        country: 'India'
      });
    } catch (imgErr) {
      console.warn("Failed to fetch images for AI generated package:", imgErr.message);
      images = {
        heroImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522083111867-5fb50eb34ee2?auto=format&fit=crop&q=80'
        ]
      };
    }

    // 4. Save to Package Collection
    const newPackageData = {
      ...aiData.package,
      image: images.heroImage,
      heroImage: images.heroImage,
      imagePool: uniqueImageList([images.heroImage, ...(images.rotationPool || images.imagePool || images.gallery || [])]).slice(0, 20),
      gallery: images.gallery,
      imageSource: images.imageSource || 'image-service',
      imageUpdatedAt: images.imageUpdatedAt || new Date(),
      isAIGenerated: false
    };

    const newPkg = new Package(newPackageData);
    const savedPackage = await newPkg.save();
    await ensureHotelCatalogForContext(savedPackage, { count: 4 });

    // 5. Also save a Destination overview if it doesn't exist
    try {
      const existingDest = await Destination.findOne({ name: new RegExp(query, 'i') });
      if (!existingDest) {
        const newDestData = {
          ...aiData.destination,
          packageId: savedPackage._id,
          itinerary: aiData.package.itinerary,
          highlights: aiData.package.highlights,
          included: aiData.package.included,
          excluded: aiData.package.excluded,
          faqs: aiData.package.faqs,
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
        console.log(`[AI Search] Also created Destination for: ${query}`);
      }
    } catch (destErr) {
      console.warn("Could not create shadow destination:", destErr.message);
    }

    console.log(`[AI Search] ✨ Saved new AI package: ${savedPackage.name}`);

    res.status(201).json({ success: true, isNew: true, data: savedPackage, message: "Package generated successfully" });
  } catch (err) {
    console.error("[AI Search Error]:", err);
    res.status(500).json({ success: false, message: 'Failed to perform AI search', error: err.message });
  }
};


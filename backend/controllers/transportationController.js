import Transportation from '../models/Transportation.js';
import { getDestinationImages } from '../services/imageService.js';
import { createLog } from '../utils/logger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePagination, sanitizeQuery, sendResponse } from '../utils/querySanitizer.js';

const uniqueImageList = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((image) => {
    const next = String(image).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

// ─── Build filter query from params ──────────────────────────────
const buildFilterQuery = (params) => {
  const filter = { isActive: { $ne: false } };

  if (params.mode && params.mode !== 'All') filter.type = params.mode;
  if (params.type && params.type !== 'all') {
    const typeMap = {
      'flights': 'Flight', 'flight': 'Flight',
      'trains': 'Train', 'train': 'Train',
      'buses': 'Bus', 'bus': 'Bus',
      'cabs': 'Cab', 'cab': 'Cab',
      'rental': 'Car Rental', 'car rental': 'Car Rental', 'rental cars': 'Car Rental',
      'bikes': 'Bike', 'bike': 'Bike',
      'luxury coach': 'Luxury Coach',
    };
    const mapped = typeMap[params.type.toLowerCase()] || params.type;
    filter.type = mapped;
  }
  if (params.from) filter.from = { $regex: params.from, $options: 'i' };
  if (params.to) filter.to = { $regex: params.to, $options: 'i' };
  if (params.luxuryLevel && params.luxuryLevel !== 'All') filter.luxuryLevel = params.luxuryLevel;
  if (params.comfortLevel && params.comfortLevel !== 'All') filter.comfortLevel = params.comfortLevel;
  if (params.routeType) filter.routeType = params.routeType;

  // Price range
  if (params.minPrice || params.maxPrice) {
    filter.price = {};
    if (params.minPrice) filter.price.$gte = Number(params.minPrice);
    if (params.maxPrice) filter.price.$lte = Number(params.maxPrice);
  }

  // Rating
  if (params.rating) filter.rating = { $gte: Number(params.rating) };

  // Facilities (comma-separated)
  if (params.facilities) {
    const facilityArr = params.facilities.split(',').map(f => f.trim());
    filter.facilities = { $all: facilityArr };
  }

  // Group type (comma-separated)
  if (params.groupType) {
    const groupArr = params.groupType.split(',').map(g => g.trim());
    filter.groupType = { $in: groupArr };
  }

  // Availability date
  if (params.date) {
    const day = new Date(params.date);
    const startOfDay = new Date(day.setHours(0, 0, 0, 0));
    const endOfDay = new Date(day.setHours(23, 59, 59, 999));
    filter.availabilityDate = { $gte: startOfDay, $lte: endOfDay };
  }

  return filter;
};

// ─── Build sort object ───────────────────────────────────────────
const buildSortQuery = (sortParam) => {
  switch (sortParam) {
    case 'price_asc': return { price: 1 };
    case 'price_desc': return { price: -1 };
    case 'fastest': return { duration: 1 };
    case 'rating': return { rating: -1 };
    case 'popular': return { reviews: -1 };
    case 'recommended':
    default: return { rating: -1, reviews: -1 };
  }
};

// @desc    Get all transportation options (with full filtering, sorting, pagination)
// @route   GET /api/transportation
// @access  Public
export const getAllTransportation = asyncHandler(async (req, res) => {
  const cleanQuery = sanitizeQuery(req.query);
  const filter = buildFilterQuery(cleanQuery);
  const sortObj = buildSortQuery(cleanQuery.sort);
  const { page, limit, skip } = parsePagination(cleanQuery);

  const [items, total] = await Promise.all([
    Transportation.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    Transportation.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, items, {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: items.length,
  });
});

// @desc    Get featured transportation
// @route   GET /api/transportation/featured
// @access  Public
export const getFeaturedTransportation = asyncHandler(async (req, res) => {
  const items = await Transportation.find({ featured: true, isActive: { $ne: false } })
    .limit(8)
    .select('-__v')
    .lean();
  sendResponse(res, 200, true, items);
});

// @desc    Search transportation with filters
// @route   GET /api/transportation/search
// @access  Public
export const searchTransportation = asyncHandler(async (req, res) => {
  const cleanQuery = sanitizeQuery(req.query);
  const filter = buildFilterQuery(cleanQuery);
  const sortObj = buildSortQuery(cleanQuery.sort);
  const { page, limit, skip } = parsePagination(cleanQuery);

  // Also search operator name via regex
  if (cleanQuery.q) {
    const searchRegex = { $regex: cleanQuery.q, $options: 'i' };
    filter.$or = [
      { providerName: searchRegex },
      { operator: searchRegex },
      { from: searchRegex },
      { to: searchRegex },
      { description: searchRegex },
    ];
  }

  const [items, total] = await Promise.all([
    Transportation.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    Transportation.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, items, {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: items.length,
  });
});

// @desc    Filter transportation (POST with complex body)
// @route   POST /api/transportation/filter
// @access  Public
export const filterTransportation = asyncHandler(async (req, res) => {
  const filter = buildFilterQuery(req.body);
  const sortObj = buildSortQuery(req.body.sort);
  const { page, limit, skip } = parsePagination(req.body);

  const [items, total] = await Promise.all([
    Transportation.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    Transportation.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, items, {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: items.length,
  });
});

// @desc    Get unique cities for autocomplete
// @route   GET /api/transportation/cities
// @access  Public
export const getCities = asyncHandler(async (req, res) => {
  const fromCities = await Transportation.distinct('from', { isActive: { $ne: false } });
  const toCities = await Transportation.distinct('to', { isActive: { $ne: false } });
  const allCities = [...new Set([...fromCities, ...toCities])].sort();
  sendResponse(res, 200, true, allCities);
});

// @desc    Get single transportation by ID
// @route   GET /api/transportation/:id
// @access  Public
export const getTransportationById = asyncHandler(async (req, res) => {
  const item = await Transportation.findById(req.params.id).select('-__v');
  if (!item) return sendResponse(res, 404, false, null, { message: 'Transportation not found' });
  res.json({ success: true, data: item });
});

// ─── Auto-assign badge logic ─────────────────────────────────────
const assignBadge = async (item) => {
  // Check if cheapest in its type+route
  const cheapest = await Transportation.findOne({
    type: item.type || item.mode, from: item.from, to: item.to, isActive: { $ne: false }
  }).sort({ price: 1 }).select('price').lean();

  if (cheapest && item.price <= cheapest.price) return 'Cheapest';

  // Check if fastest
  const fastest = await Transportation.findOne({
    type: item.type || item.mode, from: item.from, to: item.to, isActive: { $ne: false }
  }).sort({ duration: 1 }).select('duration').lean();

  if (fastest && item.duration <= fastest.duration) return 'Fastest';

  // Best Value: rating >= 4.5 + AC + Wi-Fi + Food
  if (item.rating >= 4.5 && item.facilities &&
    item.facilities.includes('AC') &&
    item.facilities.includes('Wi-Fi') &&
    item.facilities.includes('Food')) {
    return 'Best Value';
  }

  // Family Friendly: groupType includes Family + Food + Luggage
  if (item.groupType?.includes('Family') &&
    item.facilities?.includes('Food') &&
    item.facilities?.includes('Luggage')) {
    return 'Family Friendly';
  }

  // Luxury Pick
  if (item.comfortLevel === 'Luxury' || item.comfortLevel === 'First Class') {
    return 'Luxury Pick';
  }

  return null;
};

// @desc    Create transportation (Admin)
// @route   POST /api/transportation
// @access  Private/Admin
export const createTransportation = asyncHandler(async (req, res) => {
  const item = new Transportation(req.body);

  // Auto-assign badge if not set
  if (!item.badge) {
    item.badge = await assignBadge(item);
  }

  const saved = await item.save();

  await createLog({
    user: req.user._id,
    action: 'Transportation Creation',
    category: 'Transportation',
    details: `Administrator created transportation: ${saved.type || saved.mode} by ${saved.providerName || saved.operator} from ${saved.from} to ${saved.to}`,
    status: 'success'
  }, req);

  res.status(201).json({ success: true, data: saved, message: 'Transportation created' });
});

// @desc    Update transportation (Admin)
// @route   PUT /api/transportation/:id
// @access  Private/Admin
export const updateTransportation = asyncHandler(async (req, res) => {
  req.body.updatedAt = Date.now();
  const updated = await Transportation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) return sendResponse(res, 404, false, null, { message: 'Not found' });

  // Re-evaluate badge
  updated.badge = await assignBadge(updated);
  await updated.save();

  await createLog({
    user: req.user._id,
    action: 'Transportation Update',
    category: 'Transportation',
    details: `Administrator updated transportation: ${updated.type || updated.mode} by ${updated.providerName || updated.operator}`,
    status: 'info'
  }, req);

  res.json({ success: true, data: updated, message: 'Transportation updated' });
});

// @desc    Soft-delete transportation (Admin)
// @route   DELETE /api/transportation/:id
// @access  Private/Admin
export const deleteTransportation = asyncHandler(async (req, res) => {
  const item = await Transportation.findByIdAndUpdate(
    req.params.id,
    { isActive: false, updatedAt: Date.now() },
    { new: true }
  );
  if (!item) return sendResponse(res, 404, false, null, { message: 'Not found' });

  await createLog({
    user: req.user._id,
    action: 'Transportation Deletion',
    category: 'Transportation',
    details: `Administrator soft-deleted transportation: ${item.type || item.mode} by ${item.providerName || item.operator}`,
    status: 'warning'
  }, req);

  res.json({ success: true, data: null, message: 'Transportation deactivated' });
});

// @desc    Heal broken transportation image
// @route   PATCH /api/transportation/:id/heal-image
// @access  Public (Auto-healing)
export const healTransportationImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is a valid MongoDB ObjectId (24 hex characters)
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    console.log(`[Heal] ⚠️ Invalid ObjectId for Transportation healing, returning placeholder for: ${id}`);
    return res.json({
      success: true,
      newUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=85',
      message: 'Placeholder returned for external ID'
    });
  }

  const transport = await Transportation.findById(id);
  if (!transport) return sendResponse(res, 404, false, null, { message: 'Transportation not found' });

  console.log(`[Heal] 🔍 Healing transportation: ${transport.providerName || transport.operator} ${transport.type || transport.mode}`);

  const images = await getDestinationImages({
    name: transport.providerName || transport.operator || transport.type,
    location: `${transport.from || ''} ${transport.to || ''}`.trim(),
    category: transport.type || transport.mode,
    description: transport.description || `${transport.type || transport.mode} route`,
    forceRefresh: true,
  });

  if (images && images.heroImage) {
    const rotationPool = uniqueImageList([
      images.heroImage,
      ...(images.rotationPool || []),
      ...(images.gallery || []),
    ]);
    transport.heroImage = images.heroImage;
    transport.imageSource = images.imageSource || 'image-service';
    transport.imageUpdatedAt = images.imageUpdatedAt || new Date();
    transport.imagePool = rotationPool.slice(0, 20);
    transport.image = images.heroImage;
    transport.images = rotationPool.length > 0 ? rotationPool : [images.heroImage];
    transport.gallery = images.gallery && images.gallery.length > 0
      ? images.gallery
      : rotationPool.slice(1, 7);
    await transport.save();

    console.log(`[Heal] ✨ Transportation ${transport.providerName || transport.operator} healed with: ${transport.image}`);
    return res.json({
      success: true,
      newUrl: transport.image,
      gallery: transport.gallery,
      imagePool: transport.imagePool,
      imageSource: transport.imageSource,
      imageUpdatedAt: transport.imageUpdatedAt,
      message: 'Image healed and persisted to database'
    });
  }

  throw new Error('Could not find a replacement image');
});

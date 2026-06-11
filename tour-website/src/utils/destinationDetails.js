import { getDestinationFallbackImages } from './imageHelper';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600';

const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200',
];

const unwrapMediaValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    return (
      value.url ||
      value.src ||
      value.image ||
      value.imageUrl ||
      value.path ||
      value.link ||
      value.thumbnail ||
      value.heroImage ||
      value.imagePool?.[0] ||
      null
    );
  }
  return String(value);
};

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => toArray(item));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const mediaValue = unwrapMediaValue(value);
  return mediaValue ? [mediaValue] : [];
};

export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter((value) => {
    if (!value) return false;
    const key = String(value).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatLocation = (raw = {}) => {
  const pieces = [
    raw.place,
    raw.location,
    raw.city,
    raw.state,
    raw.region,
    raw.country,
  ];

  const meaningful = uniqueStrings(
    pieces
      .map((piece) => (typeof piece === 'string' ? piece.trim() : piece))
      .filter(Boolean)
  );

  if (meaningful.length > 0) {
    return meaningful.join(', ');
  }

  return 'India';
};

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

const collectPriceCandidates = (raw = {}) => {
  const candidates = [
    raw.price,
    raw.startingPrice,
    raw.minPrice,
    raw.packagePrice,
    raw.cost,
    raw.lowestPrice,
    raw.fromPrice,
    raw.basePrice,
    raw.fare,
    raw.amount,
  ];

  const nestedLists = [
    raw.packages,
    raw.packageList,
    raw.tourPackages,
    raw.tours,
    raw.options,
  ];

  nestedLists.forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (!item) return;
      candidates.push(
        item.price,
        item.startingPrice,
        item.minPrice,
        item.cost,
        item.basePrice,
        item.fare,
      );
    });
  });

  return candidates
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const normalizeImageList = (raw = {}) => {
  const sources = [
    ...toArray(raw.images),
    ...toArray(raw.gallery),
    ...toArray(raw.imagePool),
    ...toArray(raw.rotationPool),
    unwrapMediaValue(raw.heroImage),
    unwrapMediaValue(raw.image),
  ];

  const unique = uniqueStrings(sources);
  if (unique.length === 0) {
    return getDestinationFallbackImages({
      name: raw.name,
      location: raw.location || raw.city || raw.state || raw.country,
      category: raw.category || raw.type || '',
      imagePool: raw.imagePool,
      gallery: raw.gallery,
    }).slice(0, 8);
  }

  const fallbackPool = unique.length === 1
    ? [...unique, ...FALLBACK_GALLERY]
    : [...unique];

  return uniqueStrings(fallbackPool).slice(0, 6);
};

const summarizeText = (value, fallback) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return fallback;
  return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text;
};

export const normalizeDestinationDetail = (raw = {}, options = {}) => {
  const name = raw.name || raw.title || raw.place || options.fallbackName || 'Destination';
  const location = formatLocation(raw);
  const category = raw.category || raw.type || raw.budget || options.category || 'Destination';
  const priceCandidates = collectPriceCandidates(raw);
  const price = formatPrice(
    priceCandidates.length > 0 ? Math.min(...priceCandidates) : (
      raw.price || raw.startingPrice || raw.minPrice || raw.packagePrice || raw.cost || options.price
    )
  );
  const reviewList = Array.isArray(raw.reviews) ? raw.reviews : [];
  const ratingFromReviews = reviewList.length > 0
    ? reviewList.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewList.length
    : 0;
  const rating = Number(
    raw.rating ||
    raw.reviewRating ||
    raw.avgRating ||
    raw.averageRating ||
    (ratingFromReviews > 0 ? ratingFromReviews : 0) ||
    options.rating ||
    4.8
  );
  const description = raw.overview || raw.description || raw.summary || raw.about || raw.heroDescription || '';
  const subtitle = summarizeText(
    raw.tagline || raw.subtitle || raw.heroSubtitle || description,
    'Experience the extraordinary.'
  );
  const bestTime = raw.bestTime || raw.bestSeason || raw.season || raw.travelSeason || 'All year';
  const duration = raw.duration || raw.idealDuration || raw.tripDuration || raw.stayDuration || 'Flexible';
  const weather = raw.weather || raw.climate || raw.temperature || 'Pleasant';
  const idealFor = uniqueStrings(
    toArray(raw.idealFor || raw.audience || raw.tags || raw.highlights || raw.recommendedFor)
  ).slice(0, 4);
  const images = normalizeImageList(raw);
  const heroImage = images[0] || FALLBACK_HERO;
  const gallery = uniqueStrings([heroImage, ...images]).slice(0, 8);
  const reviewCount = Number(raw.reviewCount || raw.reviewsCount || raw.totalReviews || reviewList.length || 0);
  const bookingKey = raw._id || raw.id || slugify(name);
  const detailPath = options.detailPath || raw.detailPath || '/destinations';
  const bookingPath = options.bookingPath
    || `/destination/${encodeURIComponent(bookingKey)}/book?returnTo=${encodeURIComponent(detailPath)}`;

  return {
    id: bookingKey,
    bookingKey,
    detailPath,
    bookingPath,
    source: options.source || raw.source || (raw.isDynamic ? 'dynamic' : 'database'),
    isDynamic: Boolean(raw.isDynamic || options.source === 'dynamic'),
    name,
    subtitle,
    location,
    category,
    price,
    rating,
    reviewCount,
    description,
    bestTime,
    duration,
    weather,
    idealFor,
    heroImage,
    images,
    gallery,
    imagePool: uniqueStrings([heroImage, ...images]).slice(0, 20),
    tagline: raw.tagline || raw.heroTitle || 'Experience the journey of a lifetime',
    raw,
  };
};

export const buildDestinationBookingState = (destination, overrides = {}) => ({
  name: destination.name,
  images: destination.images,
  location: destination.location,
  price: destination.price,
  rating: destination.rating,
  duration: destination.duration,
  type: destination.category,
  category: destination.category,
  travelDate: overrides.travelDate || '',
  travelers: overrides.travelers || 1,
  detailPath: destination.detailPath,
  detailLabel: destination.name,
  isDynamic: destination.isDynamic || false,
  bookingKey: destination.bookingKey,
  source: overrides.source || destination.source || 'destination',
});

export const formatDestinationCurrency = (value) => {
  const numeric = formatPrice(value);
  return numeric > 0 ? `₹${numeric.toLocaleString('en-IN')}` : 'Price on request';
};

export const getDestinationFallbackHero = () => FALLBACK_HERO;

import Hotel from '../models/Hotel.js';
import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import { getHotelImages, detectDestinationCategory } from './imageService.js';

const LOCATION_ALIASES = [
  { key: 'goa', label: 'Goa', patterns: [/\bgoa\b/i] },
  { key: 'manali', label: 'Manali', patterns: [/\bmanali\b/i] },
  { key: 'jaipur', label: 'Jaipur', patterns: [/\bjaipur\b/i] },
  { key: 'kerala', label: 'Kerala', patterns: [/\bkerala\b/i, /\balleppey\b/i, /\balappuzha\b/i, /\bkumarakom\b/i, /\bmunnar\b/i, /\bcochin\b/i, /\bkochin\b/i, /\bkochi\b/i] },
  { key: 'meghalaya', label: 'Meghalaya', patterns: [/\bmeghalaya\b/i, /\bshillong\b/i, /\bcherrapunji\b/i, /\bdawki\b/i, /\bmawlynnong\b/i] },
  { key: 'kashmir', label: 'Kashmir', patterns: [/\bkashmir\b/i, /\bsrinagar\b/i, /\bgulmarg\b/i, /\bpahalgam\b/i, /\bsonmarg\b/i] },
  { key: 'ladakh', label: 'Ladakh', patterns: [/\bladakh\b/i, /\bleh\b/i, /\bnubra\b/i, /\bpangong\b/i] },
  { key: 'rajasthan', label: 'Rajasthan', patterns: [/\brajasthan\b/i, /\bjaisalmer\b/i, /\bjodhpur\b/i, /\budaipur\b/i, /\bpushkar\b/i] },
  { key: 'delhi', label: 'Delhi', patterns: [/\bnew delhi\b/i, /\bdelhi\b/i, /\bncr\b/i] },
  { key: 'mumbai', label: 'Mumbai', patterns: [/\bmumbai\b/i, /\bbombay\b/i, /\bnariman point\b/i, /\bcolaba\b/i] },
  { key: 'agra', label: 'Agra', patterns: [/\bagra\b/i] },
  { key: 'andaman', label: 'Andaman', patterns: [/\bandaman\b/i, /\bhavelock\b/i, /\bport blair\b/i, /\bneil island\b/i] },
  { key: 'varanasi', label: 'Varanasi', patterns: [/\bvaranasi\b/i, /\bbanaras\b/i, /\bkashi\b/i] },
  { key: 'sikkim', label: 'Sikkim', patterns: [/\bsikkim\b/i, /\bgangtok\b/i, /\btsomgo\b/i] },
  { key: 'darjeeling', label: 'Darjeeling', patterns: [/\bdarjeeling\b/i] },
  { key: 'hyderabad', label: 'Hyderabad', patterns: [/\bhyderabad\b/i, /\bfalaknuma\b/i, /\bshamshabad\b/i] },
  { key: 'bangalore', label: 'Bangalore', patterns: [/\bbangalore\b/i, /\bbengaluru\b/i, /\bresidency road\b/i] },
  { key: 'kolkata', label: 'Kolkata', patterns: [/\bkolkata\b/i, /\bcalcutta\b/i, /\bpark street\b/i] },
  { key: 'coorg', label: 'Coorg', patterns: [/\bcoorg\b/i, /\bmadikeri\b/i] },
  { key: 'shimla', label: 'Shimla', patterns: [/\bshimla\b/i, /\bchharabra\b/i] },
  { key: 'rishikesh', label: 'Rishikesh', patterns: [/\brishikesh\b/i, /\bnarendra nagar\b/i] },
  { key: 'hampi', label: 'Hampi', patterns: [/\bhampi\b/i, /\bkamalapura\b/i] },
];

const HOTEL_PROFILES = {
  beach: {
    names: ['Beachfront Resort', 'Coastal Retreat', 'Palm Bay Suites', 'Sunset Villa'],
    roomTypes: ['Ocean View Room', 'Garden Villa', 'Seaside Suite', 'Private Beach Villa'],
    basePrice: 6500,
    step: 1200,
    rating: 4.5,
    categoryLabel: 'Coastal Escape',
    amenitySets: [
      ['Beach Access', 'Pool', 'Free WiFi', 'Restaurant', 'Sun Deck'],
      ['Pool', 'Spa', 'Breakfast', 'Parking', 'Concierge'],
      ['Ocean View', 'Room Service', 'Bar', 'Gym', 'WiFi'],
      ['Private Beach', 'Spa', 'Fine Dining', 'Butler', 'Airport Transfer'],
    ],
    descriptions: [
      'A sun-kissed coastal retreat with direct beach access and cinematic ocean views.',
      'A refined seaside stay with calm interiors, breezy balconies, and premium leisure spaces.',
      'An elevated bayfront suite experience designed for relaxed tropical escapes.',
      'A signature beachfront villa with privacy, panoramic sunsets, and luxury service.',
    ],
  },
  mountain: {
    names: ['Hillside Resort', 'Valley View Retreat', 'Summit Suites', 'Alpine Lodge'],
    roomTypes: ['Mountain View Room', 'Valley Suite', 'Hillside Chalet', 'Panorama Villa'],
    basePrice: 5800,
    step: 1100,
    rating: 4.6,
    categoryLabel: 'Mountain Stay',
    amenitySets: [
      ['Hill View', 'Free WiFi', 'Restaurant', 'Heater', 'Parking'],
      ['Bonfire', 'Spa', 'Breakfast', 'Trekking Desk', 'WiFi'],
      ['Balcony View', 'Room Service', 'Gym', 'Tea Lounge', 'Parking'],
      ['Private Deck', 'Signature Dining', 'Concierge', 'Campfire', 'Transfer'],
    ],
    descriptions: [
      'A mountain-view retreat surrounded by fresh air, scenic slopes, and quiet comfort.',
      'A valley-facing stay with panoramic windows, warm interiors, and premium hospitality.',
      'A polished alpine lodge for travelers seeking crisp weather and elevated views.',
      'A signature summit suite with standout panoramas and curated mountain experiences.',
    ],
  },
  heritage: {
    names: ['Heritage Palace', 'Royal Courtyard', 'Haveli Suites', 'Fort View Resort'],
    roomTypes: ['Heritage Room', 'Courtyard Suite', 'Royal Chamber', 'Palace Villa'],
    basePrice: 7200,
    step: 1400,
    rating: 4.7,
    categoryLabel: 'Heritage Stay',
    amenitySets: [
      ['Heritage Decor', 'Free WiFi', 'Restaurant', 'Guided Walks', 'Parking'],
      ['Spa', 'Breakfast', 'Concierge', 'WiFi', 'Airport Transfer'],
      ['Courtyard Dining', 'Room Service', 'Bar', 'Cultural Nights', 'Parking'],
      ['Royal Butler', 'Fine Dining', 'Pool', 'Heritage Walks', 'Valet'],
    ],
    descriptions: [
      'A polished heritage residence with hand-crafted interiors and timeless hospitality.',
      'A royal courtyard stay inspired by local architecture and cultural warmth.',
      'A haveli-style suite crafted for travelers who love historic charm and comfort.',
      'A fort-view resort that pairs legacy-inspired design with contemporary luxury.',
    ],
  },
  nature: {
    names: ['Eco Retreat', 'Forest View Lodge', 'Riverstone Suites', 'Green Valley Resort'],
    roomTypes: ['Nature View Room', 'Forest Chalet', 'River Suite', 'Eco Villa'],
    basePrice: 5400,
    step: 1000,
    rating: 4.5,
    categoryLabel: 'Nature Retreat',
    amenitySets: [
      ['Nature Walks', 'Free WiFi', 'Restaurant', 'Garden', 'Parking'],
      ['Spa', 'Breakfast', 'Balcony View', 'Concierge', 'WiFi'],
      ['River View', 'Room Service', 'Tea Lounge', 'Bonfire', 'Transfer'],
      ['Private Garden', 'Organic Dining', 'Wellness', 'Pool', 'Guide Desk'],
    ],
    descriptions: [
      'A calm eco retreat surrounded by greenery and designed for slow, restorative travel.',
      'A forest-view lodge with airy rooms, leafy balconies, and a premium laid-back feel.',
      'A riverstone suite stay with scenic surroundings and a polished boutique atmosphere.',
      'A green valley resort for travelers who want comfort framed by landscape and light.',
    ],
  },
  luxury: {
    names: ['Grand Retreat', 'Signature Suites', 'Royal Pavilion', 'Elite Residence'],
    roomTypes: ['Grand Room', 'Signature Suite', 'Royal Chamber', 'Elite Villa'],
    basePrice: 9800,
    step: 1800,
    rating: 4.8,
    categoryLabel: 'Luxury Stay',
    amenitySets: [
      ['Pool', 'Spa', 'Fine Dining', 'Free WiFi', 'Concierge'],
      ['Butler', 'Valet', 'Breakfast', 'Bar', 'Gym'],
      ['Private Lounge', 'Room Service', 'Spa', 'Parking', 'Airport Transfer'],
      ['Infinity Pool', 'Premium Dining', 'Concierge', 'WiFi', 'Transfer'],
    ],
    descriptions: [
      'A grand luxury retreat with refined interiors, elevated service, and polished comfort.',
      'A signature suite stay built for guests who want premium privacy and standout design.',
      'A royal pavilion experience with curated service and sophisticated leisure spaces.',
      'An elite residence with elevated views, generous rooms, and a first-class atmosphere.',
    ],
  },
  city: {
    names: ['Central Plaza', 'Metro Suites', 'Skyline Hotel', 'Urban Grand'],
    roomTypes: ['City View Room', 'Executive Suite', 'Skyline Room', 'Urban Loft'],
    basePrice: 4200,
    step: 850,
    rating: 4.3,
    categoryLabel: 'City Stay',
    amenitySets: [
      ['Free WiFi', 'Breakfast', 'Parking', 'Gym', 'Restaurant'],
      ['Concierge', 'Room Service', 'WiFi', 'Bar', 'Laundry'],
      ['Business Center', 'Airport Transfer', 'Pool', 'Parking', 'Coffee Lounge'],
      ['Rooftop Dining', 'Valet', 'Gym', 'WiFi', 'Spa'],
    ],
    descriptions: [
      'A central city stay with smooth access, smart rooms, and modern convenience.',
      'A metro suite option with premium comfort and easy movement through the city.',
      'A skyline hotel that balances business practicality with polished leisure touches.',
      'An urban grand stay with contemporary design and dependable hospitality.',
    ],
  },
  spiritual: {
    names: ['Serenity Retreat', 'Pilgrim Suites', 'Dham Residence', 'Peace Lodge'],
    roomTypes: ['Serenity Room', 'Pilgrim Suite', 'Dham Villa', 'Peace Chamber'],
    basePrice: 3500,
    step: 750,
    rating: 4.4,
    categoryLabel: 'Spiritual Stay',
    amenitySets: [
      ['Quiet Zone', 'Free WiFi', 'Breakfast', 'Meditation', 'Parking'],
      ['Yoga Deck', 'Room Service', 'Restaurant', 'Guide Desk', 'WiFi'],
      ['Temple Transfer', 'Airy Rooms', 'Tea Lounge', 'Laundry', 'Concierge'],
      ['Wellness Program', 'Vegetarian Dining', 'Spa', 'Transfer', 'Parking'],
    ],
    descriptions: [
      'A serene retreat designed for slow mornings, quiet evenings, and mindful travel.',
      'A pilgrim suite with calm interiors and convenient access to sacred places.',
      'A residence styled for restorative stays with comfort and easy local movement.',
      'A peaceful lodge that keeps the focus on rest, reflection, and premium simplicity.',
    ],
  },
  desert: {
    names: ['Dune Palace', 'Oasis Retreat', 'Fort Sands Resort', 'Camel Trail Suites'],
    roomTypes: ['Desert Room', 'Oasis Suite', 'Fort View Chamber', 'Sand Dune Villa'],
    basePrice: 5200,
    step: 950,
    rating: 4.4,
    categoryLabel: 'Desert Stay',
    amenitySets: [
      ['Desert View', 'Free WiFi', 'Restaurant', 'Camel Safari', 'Parking'],
      ['Pool', 'Breakfast', 'Spa', 'Transfer', 'Concierge'],
      ['Fort View', 'Room Service', 'WiFi', 'Tea Lounge', 'Guide Desk'],
      ['Sunset Deck', 'Fine Dining', 'Valet', 'Guide Desk', 'Transfer'],
    ],
    descriptions: [
      'A dune-side palace stay with warm tones, scenic horizons, and comfortable rooms.',
      'An oasis retreat offering relaxed interiors and a calm desert escape.',
      'A fort sands resort with a heritage feel and thoughtful travel conveniences.',
      'A camel trail suite experience with polished service and strong regional character.',
    ],
  },
  island: {
    names: ['Lagoon Resort', 'Palm Cove Suites', 'Coral Bay Villa', 'Tropical Retreat'],
    roomTypes: ['Lagoon Room', 'Palm Suite', 'Coral Villa', 'Tropical Chamber'],
    basePrice: 7600,
    step: 1350,
    rating: 4.6,
    categoryLabel: 'Island Stay',
    amenitySets: [
      ['Sea View', 'Free WiFi', 'Pool', 'Restaurant', 'Water Sports'],
      ['Spa', 'Breakfast', 'Beach Access', 'Concierge', 'Transfer'],
      ['Lagoon View', 'Room Service', 'Bar', 'WiFi', 'Parking'],
      ['Private Deck', 'Fine Dining', 'Butler', 'Kayaks', 'Sunset Lounge'],
    ],
    descriptions: [
      'A lagoon resort with breezy rooms, island light, and easy access to the coast.',
      'A palm cove suite designed for relaxed tropical escapes and premium comfort.',
      'A coral bay villa with water-facing views and a polished island feel.',
      'A tropical retreat that blends serenity, luxury, and destination-inspired design.',
    ],
  },
  adventure: {
    names: ['Explorer Basecamp', 'Trail View Lodge', 'Summit Camp Resort', 'Adventure Edge Retreat'],
    roomTypes: ['Explorer Room', 'Trail Lodge', 'Summit Suite', 'Adventure Villa'],
    basePrice: 4800,
    step: 900,
    rating: 4.4,
    categoryLabel: 'Adventure Stay',
    amenitySets: [
      ['Trekking Desk', 'Free WiFi', 'Breakfast', 'Parking', 'Guide'],
      ['Campfire', 'Restaurant', 'WiFi', 'Laundry', 'Transfer'],
      ['Adventure Sports', 'Room Service', 'Spa', 'Parking', 'Coffee Lounge'],
      ['Gear Storage', 'Fine Dining', 'Concierge', 'Transfer', 'Valley View'],
    ],
    descriptions: [
      'An explorer basecamp with practical comfort and easy access to outdoor activities.',
      'A trail view lodge with scenic surroundings and a polished adventure spirit.',
      'A summit camp resort for travelers who want active days and restful nights.',
      'An adventure edge retreat with strong location character and premium support.',
    ],
  },
  wildlife: {
    names: ['Jungle Lodge', 'Safari Retreat', 'Rainforest Suites', 'Reserve Resort'],
    roomTypes: ['Jungle Room', 'Safari Suite', 'Rainforest Chalet', 'Reserve Villa'],
    basePrice: 6200,
    step: 1200,
    rating: 4.5,
    categoryLabel: 'Wildlife Stay',
    amenitySets: [
      ['Nature Walks', 'Free WiFi', 'Restaurant', 'Guide Desk', 'Parking'],
      ['Safari Transfer', 'Breakfast', 'Spa', 'WiFi', 'Concierge'],
      ['Birdwatching', 'Room Service', 'Tea Lounge', 'Laundry', 'Transfer'],
      ['Reserve View', 'Fine Dining', 'Valet', 'Guide Desk', 'Pool'],
    ],
    descriptions: [
      'A jungle lodge with nature-forward surroundings and comfortable, scenic rooms.',
      'A safari retreat crafted for guests who want the outdoors without losing comfort.',
      'A rainforest suite stay with quiet luxury and a strong sense of place.',
      'A reserve resort with premium service and easy access to nearby wildlife routes.',
    ],
  },
  family: {
    names: ['Family Haven', 'Comfort Suites', 'Parkside Resort', 'Holiday Villa'],
    roomTypes: ['Family Room', 'Comfort Suite', 'Park View Room', 'Holiday Villa'],
    basePrice: 4500,
    step: 850,
    rating: 4.4,
    categoryLabel: 'Family Stay',
    amenitySets: [
      ['Free WiFi', 'Breakfast', 'Pool', 'Kids Zone', 'Parking'],
      ['Restaurant', 'Room Service', 'Laundry', 'Concierge', 'WiFi'],
      ['Family Activities', 'Transfer', 'Gym', 'Parking', 'Coffee Lounge'],
      ['Play Area', 'Fine Dining', 'Spa', 'Guide Desk', 'Pool'],
    ],
    descriptions: [
      'A family haven with space, convenience, and easy access to local attractions.',
      'A comfort suite designed to keep the trip simple, smooth, and premium for all ages.',
      'A parkside resort with dependable amenities and a relaxed family-first layout.',
      'A holiday villa that makes group travel feel organized and pleasantly upscale.',
    ],
  },
  default: {
    names: ['Grand Retreat', 'Boutique Stay', 'Signature Suites', 'Premium Residence'],
    roomTypes: ['Standard Room', 'Deluxe Room', 'Suite', 'Premium Villa'],
    basePrice: 5200,
    step: 950,
    rating: 4.4,
    categoryLabel: 'Premium Stay',
    amenitySets: [
      ['Free WiFi', 'Breakfast', 'Restaurant', 'Parking', 'Concierge'],
      ['Pool', 'Gym', 'Room Service', 'WiFi', 'Laundry'],
      ['Spa', 'Bar', 'Transfer', 'Parking', 'Coffee Lounge'],
      ['Valet', 'Fine Dining', 'Concierge', 'Pool', 'Airport Transfer'],
    ],
    descriptions: [
      'A polished premium stay with reliable comfort and refined service.',
      'A boutique option with calm interiors, smart amenities, and easy access to the location.',
      'A signature suite that feels upscale, spacious, and well curated for travel.',
      'A residence-style stay with premium touches and a smooth guest experience.',
    ],
  },
};

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter(Boolean).filter((value) => {
    const next = String(value).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const titleCase = (value = '') =>
  String(value)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const slugify = (value = '') =>
  normalizeText(value)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const stableHash = (value = '') => {
  let hash = 0;
  const input = String(value);
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
};

const isGenericLocation = (value = '') => /^(india|global|world|all|tour|package|travel|trip|journey|experience|stay)$/i.test(String(value).trim());

const detectAlias = (value = '') => {
  const text = normalizeText(value);
  return LOCATION_ALIASES.find((alias) => alias.patterns.some((pattern) => pattern.test(text)));
};

const pickLocationCandidate = (input = {}) => {
  const rawCandidates = [
    input.location,
    input.city,
    input.state,
    input.region,
    input.name,
  ].filter(Boolean);

  const withMeaning = rawCandidates.find((value) => !isGenericLocation(value)) || rawCandidates[0] || '';
  const stringValue = String(withMeaning).trim();
  if (!stringValue) return '';

  if (stringValue.includes(',')) {
    const parts = stringValue.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] || parts[0] || stringValue;
  }

  return stringValue;
};

export const resolveHotelLocationLabel = (input = {}) => {
  const candidate = pickLocationCandidate(input);
  const alias = detectAlias(candidate) || detectAlias(input.name || '') || detectAlias(input.location || '');
  if (alias) return alias.label;
  return titleCase(candidate || input.name || input.location || 'India');
};

export const normalizeHotelLocationKey = (input = {}) => {
  const label = resolveHotelLocationLabel(input);
  const alias = detectAlias(label);
  if (alias) return alias.key;

  const candidate = pickLocationCandidate(input);
  const cleaned = slugify(candidate || label || input.name || input.location || 'india');
  return cleaned || 'india';
};

export const resolveHotelCategory = (input = {}) => {
  const detected = detectDestinationCategory({
    name: input.name,
    title: input.title,
    location: input.location || input.city || input.state,
    city: input.city,
    state: input.state,
    country: input.country,
    category: input.category || input.type,
    description: input.description || input.overview || input.tagline,
    query: input.query,
  });

  return HOTEL_PROFILES[detected] ? detected : 'default';
};

const getProfile = (category = 'default') => HOTEL_PROFILES[category] || HOTEL_PROFILES.default;

const buildHotelName = (locationLabel, profile, rank) => `${locationLabel} ${profile.names[rank] || profile.names[profile.names.length - 1]}`;

const buildHotelDescription = (context, profile, rank) => {
  const description = profile.descriptions[rank] || profile.descriptions[profile.descriptions.length - 1];
  return `${description} Ideal for travelers exploring ${context.locationLabel}.`;
};

const buildHotelPrice = (context, profile, rank) => {
  const base = profile.basePrice || HOTEL_PROFILES.default.basePrice;
  const step = profile.step || HOTEL_PROFILES.default.step;
  const hashBump = stableHash(`${context.locationKey}:${rank}`) % Math.max(step, 1);
  return Math.round(base + rank * step + hashBump);
};

const buildHotelRating = (profile, rank, context) => {
  const ratingBase = profile.rating || HOTEL_PROFILES.default.rating;
  const hashBump = (stableHash(`${context.locationKey}:rating:${rank}`) % 30) / 100;
  return Math.min(5, Number((ratingBase + rank * 0.08 + hashBump).toFixed(1)));
};

const buildHotelAmenitySet = (profile, rank) => profile.amenitySets[rank] || profile.amenitySets[profile.amenitySets.length - 1] || [];

const buildHotelRooms = (hotelName, roomType, price, image) => {
  const premiumRoomType = `Deluxe ${roomType}`;
  return [
    {
      id: `${slugify(hotelName)}-standard`,
      roomType,
      price,
      capacity: '2 Guests',
      image,
      available: true,
      featured: true,
    },
    {
      id: `${slugify(hotelName)}-deluxe`,
      roomType: premiumRoomType,
      price: price + Math.round(price * 0.18),
      capacity: '2 Guests',
      image,
      available: true,
    },
    {
      id: `${slugify(hotelName)}-suite`,
      roomType: `Signature ${roomType}`,
      price: price + Math.round(price * 0.35),
      capacity: '4 Guests',
      image,
      available: true,
    },
  ];
};

const buildHotelContext = async (input = {}) => {
  const data = typeof input === 'string' ? { location: input } : { ...(input || {}) };
  let packageDoc = data.packageId ? await Package.findById(data.packageId).lean() : null;
  let destinationDoc = data.destinationId ? await Destination.findById(data.destinationId).lean() : null;

  if (!packageDoc && data.packageName) {
    packageDoc = await Package.findOne({ name: new RegExp(`^${String(data.packageName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
  }

  if (!destinationDoc && data.destinationName) {
    destinationDoc = await Destination.findOne({ name: new RegExp(`^${String(data.destinationName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
  }

  const source = packageDoc || destinationDoc || data;
  const locationLabel = resolveHotelLocationLabel({
    ...source,
    ...data,
    location: data.location || source.location || source.city || source.name,
    city: data.city || source.city,
    state: data.state || source.state,
    region: data.region || source.region,
    name: data.name || source.name,
  });
  const locationKey = normalizeHotelLocationKey({
    ...source,
    ...data,
    location: data.location || source.location || source.city || source.name,
    city: data.city || source.city,
    state: data.state || source.state,
    region: data.region || source.region,
    name: data.name || source.name,
  });
  const category = resolveHotelCategory({
    ...source,
    ...data,
  });
  const profile = getProfile(category);

  return {
    sourceType: data.sourceType || (packageDoc ? 'package' : destinationDoc ? 'destination' : 'manual'),
    destinationId: data.destinationId || destinationDoc?._id || source.destinationId || null,
    packageId: data.packageId || packageDoc?._id || source.packageId || null,
    locationLabel,
    locationKey,
    category,
    profile,
    city: titleCase(data.city || source.city || locationLabel),
    sourceLocation: data.location || source.location || source.city || locationLabel,
    country: data.country || source.country || 'India',
    name: data.name || source.name || locationLabel,
    description: data.description || source.description || source.overview || '',
    lat: data.lat || source.lat,
    lng: data.lng || source.lng,
  };
};

const buildHotelCatalogPayload = async (context, rank) => {
  const profile = context.profile || getProfile(context.category);
  const hotelName = buildHotelName(context.locationLabel, profile, rank);
  const imageData = await getHotelImages({
    name: hotelName,
    location: context.locationLabel,
    city: context.city,
    country: context.country || 'India',
    category: profile.categoryLabel || context.category,
    description: buildHotelDescription(context, profile, rank),
    forceRefresh: false,
  });

  const imagePool = uniqueStrings([
    imageData.heroImage,
    ...(imageData.rotationPool || []),
    ...(imageData.imagePool || []),
    ...(imageData.gallery || []),
  ]);
  const heroImage = imageData.heroImage || imagePool[0] || '';
  const price = buildHotelPrice(context, profile, rank);
  const rating = buildHotelRating(profile, rank, context);
  const roomType = profile.roomTypes[rank] || profile.roomTypes[profile.roomTypes.length - 1] || 'Standard Room';
  const amenities = buildHotelAmenitySet(profile, rank);
  const gallery = uniqueStrings([
    heroImage,
    ...(imageData.gallery || []),
    ...imagePool.slice(1, 7),
  ]).slice(0, 8);

  return {
    name: hotelName,
    roomType,
    city: context.city,
    location: context.sourceLocation,
    locationKey: context.locationKey,
    sourceLocation: context.sourceLocation,
    sourceType: context.sourceType,
    destinationId: context.destinationId || undefined,
    packageId: context.packageId || undefined,
    price,
    rating,
    heroImage,
    image: heroImage,
    imageSource: imageData.imageSource || 'image-service',
    imageUpdatedAt: imageData.imageUpdatedAt || new Date(),
    imagePool: imagePool.slice(0, 20),
    images: imagePool.length > 0 ? imagePool : [heroImage],
    gallery,
    amenities,
    description: buildHotelDescription(context, profile, rank),
    featured: rank === 0,
    isCatalogHotel: true,
    catalogRank: rank,
    rooms: buildHotelRooms(hotelName, roomType, price, heroImage),
    lat: context.lat,
    lng: context.lng,
  };
};

export const serializeHotelForClient = (hotel) => {
  const heroImage = hotel.heroImage || hotel.image || hotel.images?.[0] || hotel.gallery?.[0] || '';
  const imagePool = uniqueStrings([
    heroImage,
    ...(hotel.images || []),
    ...(hotel.gallery || []),
    ...(hotel.imagePool || []),
  ]).slice(0, 20);

  return {
    _id: hotel._id?.toString?.() || hotel.id,
    id: hotel._id?.toString?.() || hotel.id,
    name: hotel.name,
    roomType: hotel.roomType || hotel.rooms?.[0]?.roomType || 'Standard Room',
    city: hotel.city || hotel.location || 'Unknown',
    location: hotel.location || hotel.city || 'Unknown',
    locationKey: hotel.locationKey || '',
    sourceLocation: hotel.sourceLocation || hotel.location || '',
    sourceType: hotel.sourceType || 'manual',
    destinationId: hotel.destinationId?.toString?.() || hotel.destinationId || null,
    packageId: hotel.packageId?.toString?.() || hotel.packageId || null,
    pricePerNight: hotel.price,
    price: hotel.price,
    rating: Number(hotel.rating || 0),
    reviewsCount: hotel.reviewsCount || Math.floor((stableHash(hotel.name || hotel.location || '') % 1200) + 80),
    heroImage,
    imageSource: hotel.imageSource || 'database',
    imageUpdatedAt: hotel.imageUpdatedAt,
    imagePool,
    images: imagePool,
    gallery: uniqueStrings([
      heroImage,
      ...(hotel.gallery || []),
      ...(hotel.images || []),
    ]).slice(0, 8),
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    description: hotel.description || '',
    featured: Boolean(hotel.featured),
    isCatalogHotel: Boolean(hotel.isCatalogHotel),
    catalogRank: hotel.catalogRank ?? 0,
    rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    lat: hotel.lat,
    lng: hotel.lng,
  };
};

export const ensureHotelCatalogForContext = async (input = {}, options = {}) => {
  const context = await buildHotelContext(input);
  const count = Number(options.count || 4);
  const targetCount = Math.max(1, Math.min(count, 4));

  if (options.forceRefresh) {
    await Hotel.deleteMany({ locationKey: context.locationKey, isCatalogHotel: true });
  }

  const existingHotels = await Hotel.find({
    locationKey: context.locationKey,
    isCatalogHotel: true,
    catalogRank: { $gte: 0, $lt: targetCount },
  })
    .sort({ catalogRank: 1, createdAt: 1 })
    .limit(targetCount);

  const existingRanks = new Set(existingHotels.map((hotel) => Number(hotel.catalogRank)));
  const missingRanks = [];
  for (let rank = 0; rank < targetCount; rank += 1) {
    if (!existingRanks.has(rank)) missingRanks.push(rank);
  }

  const createdHotels = [];
  for (const rank of missingRanks) {
    const payload = await buildHotelCatalogPayload(context, rank);
    const hotel = await Hotel.create(payload);
    createdHotels.push(hotel);
  }

  const hotelMap = new Map();
  [...existingHotels, ...createdHotels].forEach((hotel) => {
    hotelMap.set(Number(hotel.catalogRank), hotel);
  });

  return Array.from(hotelMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, hotel]) => hotel)
    .slice(0, targetCount);
};

export const syncHotelCatalogFromCollections = async () => {
  const [destinations, packages] = await Promise.all([
    Destination.find().select('name location city state region country type description overview packageId').lean(),
    Package.find().select('name location city state region country category description tagline packageId').lean(),
  ]);

  const contexts = [...destinations, ...packages]
    .filter((item) => item && (item.location || item.city || item.state || item.name))
    .map((item) => ({
      ...item,
      sourceType: item.category ? 'package' : 'destination',
      sourceLocation: item.location || item.city || item.name,
    }));

  const uniqueContexts = new Map();
  contexts.forEach((item) => {
    const key = normalizeHotelLocationKey(item);
    if (!uniqueContexts.has(key)) {
      uniqueContexts.set(key, item);
    }
  });

  const summary = [];
  for (const context of uniqueContexts.values()) {
    const hotels = await ensureHotelCatalogForContext(context, { forceRefresh: true, count: 4 });
    summary.push({
      locationKey: normalizeHotelLocationKey(context),
      location: resolveHotelLocationLabel(context),
      count: hotels.length,
    });
  }

  return summary;
};

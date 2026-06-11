import { getHotelFallbackImages } from './imageHelper';

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

const stableHash = (value = '') => {
  let hash = 0;
  const input = String(value);
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
};

const LOCATION_PROFILES = [
  {
    key: 'goa',
    label: 'Goa',
    patterns: [/\bgoa\b/i],
    attractions: ['Baga Beach', 'Calangute Beach', 'Fort Aguada', 'Basilica of Bom Jesus'],
    airport: { name: 'Manohar International Airport', distance: '34 km' },
    railway: { name: 'Thivim Railway Station', distance: '18 km' },
    intro: 'Coastal energy, beach clubs, and easy leisure.',
  },
  {
    key: 'manali',
    label: 'Manali',
    patterns: [/\bmanali\b/i],
    attractions: ['Solang Valley', 'Mall Road', 'Hadimba Devi Temple', 'Atal Tunnel'],
    airport: { name: 'Bhuntar Airport', distance: '50 km' },
    railway: { name: 'Joginder Nagar Railway Station', distance: '163 km' },
    intro: 'A mountain escape with crisp air and alpine views.',
  },
  {
    key: 'jaipur',
    label: 'Jaipur',
    patterns: [/\bjaipur\b/i],
    attractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar'],
    airport: { name: 'Jaipur International Airport', distance: '13 km' },
    railway: { name: 'Jaipur Junction', distance: '4 km' },
    intro: 'A royal city with forts, palaces, and warm hospitality.',
  },
  {
    key: 'kerala',
    label: 'Kerala',
    patterns: [/\bkerala\b/i, /\balleppey\b/i, /\balappuzha\b/i, /\bkochi\b/i, /\bcochin\b/i, /\bmunnar\b/i, /\bkumarakom\b/i],
    attractions: ['Munnar Tea Gardens', 'Alleppey Backwaters', 'Kochi Fort', 'Varkala Cliff'],
    airport: { name: 'Cochin International Airport', distance: '29 km' },
    railway: { name: 'Ernakulam Junction', distance: '12 km' },
    intro: 'Lush backwaters, tea hills, and serene resort stays.',
  },
  {
    key: 'kashmir',
    label: 'Kashmir',
    patterns: [/\bkashmir\b/i, /\bsrinagar\b/i, /\bgulmarg\b/i, /\bpahalgam\b/i, /\bsonmarg\b/i],
    attractions: ['Dal Lake', 'Gulmarg Gondola', 'Pahalgam Valley', 'Shalimar Bagh'],
    airport: { name: 'Srinagar Airport', distance: '15 km' },
    railway: { name: 'Jammu Tawi Railway Station', distance: '263 km' },
    intro: 'Snowy peaks, lakes, and premium valley resorts.',
  },
  {
    key: 'meghalaya',
    label: 'Meghalaya',
    patterns: [/\bmeghalaya\b/i, /\bshillong\b/i, /\bcherrapunji\b/i, /\bdawki\b/i, /\bmawlynnong\b/i],
    attractions: ['Dawki River', 'Living Root Bridges', 'Cherrapunji Falls', 'Shillong Peak'],
    airport: { name: 'Shillong Airport', distance: '31 km' },
    railway: { name: 'Guwahati Railway Station', distance: '101 km' },
    intro: 'Waterfalls, valleys, and lush hill-country retreats.',
  },
  {
    key: 'ladakh',
    label: 'Ladakh',
    patterns: [/\bladakh\b/i, /\bleh\b/i, /\bnubra\b/i, /\bpangong\b/i],
    attractions: ['Pangong Lake', 'Nubra Valley', 'Shanti Stupa', 'Magnetic Hill'],
    airport: { name: 'Kushok Bakula Rimpochee Airport', distance: '4 km' },
    railway: { name: 'Jammu Tawi Railway Station', distance: '722 km' },
    intro: 'High-altitude silence, dramatic landscapes, and adventure luxury.',
  },
  {
    key: 'rajasthan',
    label: 'Rajasthan',
    patterns: [/\brajasthan\b/i, /\bjaisalmer\b/i, /\bjodhpur\b/i, /\budaipur\b/i, /\bpushkar\b/i],
    attractions: ['Amber Fort', 'Lake Pichola', 'Mehrangarh Fort', 'Hawa Mahal'],
    airport: { name: 'Maharana Pratap Airport', distance: '22 km' },
    railway: { name: 'Udaipur City Railway Station', distance: '3 km' },
    intro: 'Heritage palaces, desert light, and royal stays.',
  },
  {
    key: 'andaman',
    label: 'Andaman',
    patterns: [/\bandaman\b/i, /\bhavelock\b/i, /\bport blair\b/i, /\bneil island\b/i],
    attractions: ['Radhanagar Beach', 'Cellular Jail', 'Ross Island', 'Elephant Beach'],
    airport: { name: 'Veer Savarkar International Airport', distance: '7 km' },
    railway: { name: 'Nearest mainland railhead', distance: '1250 km' },
    intro: 'Island calm, coastal views, and luxe waterfront stays.',
  },
  {
    key: 'default',
    label: 'Destination',
    patterns: [],
    attractions: ['Main Market', 'City Viewpoint', 'Local Heritage Street', 'Scenic Promenade'],
    airport: { name: 'Nearest Airport', distance: '18 km' },
    railway: { name: 'Nearest Railway Station', distance: '12 km' },
    intro: 'Premium local stays with easy access to the area.',
  },
];

const AMENITY_FACILITY_LABELS = [
  'Free WiFi',
  'Breakfast',
  'Pool',
  'Spa',
  'Restaurant',
  'Room Service',
  'Parking',
  'Concierge',
  'Gym',
  'Airport Transfer',
];

const DEFAULT_POLICIES = [
  'Check-in starts at 2:00 PM and check-out is by 11:00 AM.',
  'Government-issued photo ID is required at arrival.',
  'Free cancellation is available up to 48 hours before check-in.',
  'Smoking is allowed only in designated outdoor areas.',
  'Pets are allowed only where the property policy explicitly permits them.',
];

const inferStyle = (hotel = {}) => {
  const haystack = normalizeText([
    hotel.name,
    hotel.location,
    hotel.city,
    hotel.description,
    ...(hotel.amenities || []),
  ].join(' '));

  if (/beach|coast|sea|ocean|shore|bay/.test(haystack)) return 'beach';
  if (/mountain|hill|valley|alpine|snow|summit|hillside/.test(haystack)) return 'mountain';
  if (/fort|palace|haveli|heritage|royal/.test(haystack)) return 'heritage';
  if (/forest|nature|river|eco|lodge|jungle|safari/.test(haystack)) return 'nature';
  if (/luxury|grand|elite|signature|premium|resort|villa/.test(haystack)) return 'luxury';
  if (/city|urban|metro|plaza|central|skyline/.test(haystack)) return 'city';
  if (/temple|pilgrim|serenity|peace|dham|spiritual/.test(haystack)) return 'spiritual';
  if (/desert|dune|oasis|sand|camel/.test(haystack)) return 'desert';
  if (/island|lagoon|tropical|coral|palm/.test(haystack)) return 'island';
  if (/adventure|trail|explorer|summit|basecamp/.test(haystack)) return 'adventure';
  if (/wildlife|reserve|safari|rainforest/.test(haystack)) return 'wildlife';
  if (/family|kids|holiday/.test(haystack)) return 'family';
  return 'default';
};

const detectLocationProfile = (hotel = {}) => {
  const haystack = normalizeText([
    hotel.location,
    hotel.city,
    hotel.sourceLocation,
    hotel.name,
  ].join(' '));

  return LOCATION_PROFILES.find((profile) =>
    profile.patterns.some((pattern) => pattern.test(haystack))
  ) || LOCATION_PROFILES[LOCATION_PROFILES.length - 1];
};

const buildRoomOptions = (hotel = {}) => {
  const basePrice = Number(hotel.pricePerNight || hotel.price || 12000);
  const heroImage = hotel.heroImage || hotel.image || hotel.images?.[0] || hotel.gallery?.[0] || '';
  const baseAmenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  const defaultRooms = [
    {
      id: `${hotel._id || hotel.id || 'hotel'}-standard`,
      roomType: 'Standard Room',
      price: basePrice,
      capacity: '2 Guests - 1 Bed',
      image: heroImage,
      facilities: ['Free WiFi', 'Breakfast', 'Air Conditioning'],
      featured: false,
      available: true,
    },
    {
      id: `${hotel._id || hotel.id || 'hotel'}-deluxe`,
      roomType: 'Deluxe Room',
      price: Math.round(basePrice * 1.22),
      capacity: '2 Guests - 1 King Bed',
      image: heroImage,
      facilities: ['Breakfast', 'Room Service', 'City or Scenic View'],
      featured: true,
      available: true,
    },
    {
      id: `${hotel._id || hotel.id || 'hotel'}-suite`,
      roomType: 'Suite',
      price: Math.round(basePrice * 1.45),
      capacity: '3 Guests - 1 King Bed + Sofa',
      image: heroImage,
      facilities: ['Lounge Access', 'Laundry', 'Airport Transfer'],
      featured: false,
      available: true,
    },
  ];

  const sourceRooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  const mappedRooms = sourceRooms
    .map((room, index) => ({
      id: String(room.id || room._id || `${hotel._id || hotel.id || 'hotel'}-${index}`),
      roomType: room.roomType || room.type || room.name || `Room ${index + 1}`,
      price: Number(room.price || room.rate || basePrice),
      capacity: room.capacity || `${index < 2 ? '2 Guests' : '3 Guests'} - ${index === 0 ? '1 Bed' : '1 King Bed'}`,
      image: room.image || heroImage,
      facilities: uniqueStrings([
        ...(Array.isArray(room.facilities) ? room.facilities : []),
        ...(Array.isArray(room.amenities) ? room.amenities : []),
        ...baseAmenities.slice(0, 3),
      ]).slice(0, 4),
      featured: Boolean(room.featured),
      available: room.available !== false,
    }))
    .filter(Boolean);

  const rooms = mappedRooms.length > 0 ? mappedRooms : defaultRooms;

  return rooms.map((room, index) => ({
    ...room,
    facilities: uniqueStrings([
      ...(room.facilities || []),
      ...baseAmenities.slice(index, index + 3),
      ...AMENITY_FACILITY_LABELS.slice(index, index + 3),
    ]).slice(0, 4),
  }));
};

const buildPolicies = (hotel = {}, profile) => {
  if (Array.isArray(hotel.policies) && hotel.policies.length > 0) {
    return hotel.policies.map((item) => String(item));
  }

  if (typeof hotel.policies === 'string' && hotel.policies.trim()) {
    return hotel.policies
      .split(/[\n•]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [
    ...DEFAULT_POLICIES,
    `The property reflects the ${profile.label.toLowerCase()} experience and may include destination-specific service timing.`,
  ];
};

const buildNearbyAttractions = (hotel = {}, profile) => {
  const locationLabel = hotel.location || hotel.city || profile.label;
  return [
    ...profile.attractions.map((name, index) => ({
      name,
      distance: `${index + 1.2} km`,
      note: index === 0 ? 'Closest highlight' : 'Popular nearby stop',
    })),
    {
      name: `${locationLabel} Market`,
      distance: '2.5 km',
      note: 'Local shopping and dining',
    },
  ];
};

const buildAddressLabel = (hotel = {}, profile) => {
  const parts = [
    hotel.addressLine1,
    hotel.addressLine2,
    hotel.location,
    hotel.city,
    hotel.state,
    hotel.country || 'India',
  ].filter(Boolean);

  if (parts.length > 0) return uniqueStrings(parts).join(', ');
  return `${profile.label}, India`;
};

const buildGallery = (hotel = {}, fallbackImages = []) => {
  const heroImage = hotel.heroImage || hotel.image || hotel.images?.[0] || hotel.gallery?.[0] || fallbackImages[0];
  return uniqueStrings([
    heroImage,
    ...(hotel.gallery || []),
    ...(hotel.images || []),
    ...(hotel.imagePool || []),
    ...fallbackImages,
  ]).slice(0, 8);
};

export const normalizeHotelDetails = (hotel = {}) => {
  const profile = detectLocationProfile(hotel);
  const style = inferStyle(hotel);
  const locationLabel = hotel.location || hotel.city || profile.label;
  const fullAddress = buildAddressLabel(hotel, profile);
  const fallbackImages = getHotelFallbackImages({
    name: hotel.name || `${profile.label} Hotel`,
    location: locationLabel,
  });
  const heroImage = hotel.heroImage || hotel.image || hotel.images?.[0] || hotel.gallery?.[0] || fallbackImages[0] || '';
  const gallery = buildGallery({ ...hotel, heroImage }, fallbackImages);
  const rooms = buildRoomOptions({ ...hotel, heroImage });
  const amenities = uniqueStrings([
    ...(Array.isArray(hotel.amenities) ? hotel.amenities : []),
    ...AMENITY_FACILITY_LABELS,
  ]).slice(0, 10);
  const rating = Number(hotel.rating || 0) || (style === 'luxury' ? 4.8 : 4.4);
  const reviewsCount = Number(hotel.reviewsCount || hotel.reviewCount || 0) || (stableHash(`${hotel.name || ''}${locationLabel}`) % 1200) + 80;
  const pricePerNight = Number(hotel.pricePerNight || hotel.price || 0) || (style === 'luxury' ? 22000 : 12000);

  return {
    raw: hotel,
    id: hotel._id || hotel.id,
    name: hotel.name || `${profile.label} Stay`,
    location: locationLabel,
    city: hotel.city || profile.label,
    country: hotel.country || 'India',
    fullAddress,
    style,
    profile,
    categoryLabel: hotel.category || hotel.type || `${profile.label} Hotel`,
    rating,
    reviewsCount,
    reviewScoreLabel: rating >= 4.8 ? 'Exceptional' : rating >= 4.5 ? 'Excellent' : 'Very Good',
    pricePerNight,
    heroImage,
    gallery,
    imagePool: uniqueStrings([heroImage, ...gallery, ...fallbackImages]).slice(0, 12),
    amenities,
    rooms,
    policies: buildPolicies(hotel, profile),
    nearbyAttractions: buildNearbyAttractions(hotel, profile),
    airport: profile.airport,
    railway: profile.railway,
    overview: hotel.description || hotel.overview || `Stay at ${hotel.name || `${profile.label} Hotel`} for a polished hospitality experience with easy access to the best of ${locationLabel}.`,
    tagline: hotel.tagline || profile.intro,
    addressLine: fullAddress,
    mapLabel: `${profile.label} hotel location`,
    isAiGenerated: Boolean(hotel.isAiGenerated || hotel.sourceType === 'ai'),
  };
};

export const buildHotelRatingBreakdown = (reviews = [], hotelRating = 4.5) => {
  const data = Array.isArray(reviews) ? reviews : [];
  if (data.length > 0) {
    const counts = [5, 4, 3, 2, 1].map((score) => ({
      score,
      count: data.filter((review) => Math.round(Number(review.rating || 0)) === score).length,
    }));
    const max = Math.max(...counts.map((entry) => entry.count), 1);
    return counts.map((entry) => ({
      ...entry,
      percent: Math.round((entry.count / max) * 100),
    }));
  }

  const base = Math.round(Math.max(0, Math.min(5, Number(hotelRating || 4.5))) * 20);
  return [
    { score: 5, count: Math.max(1, Math.round(base * 0.45)), percent: 92 },
    { score: 4, count: Math.max(1, Math.round(base * 0.28)), percent: 76 },
    { score: 3, count: Math.max(1, Math.round(base * 0.15)), percent: 52 },
    { score: 2, count: Math.max(1, Math.round(base * 0.07)), percent: 28 },
    { score: 1, count: Math.max(1, Math.round(base * 0.05)), percent: 14 },
  ];
};


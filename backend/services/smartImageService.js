import axios from 'axios';
import NodeCache from 'node-cache';

const imageCache = new NodeCache({
  stdTTL: 60 * 60 * 6,
  checkperiod: 60 * 30,
  useClones: false,
});

const MIN_WIDTH = 1200;
const MIN_HEIGHT = 700;
const MIN_ASPECT_RATIO = 1.2;
const MAX_QUERIES = 8;
const MAX_IMAGE_POOL = 5;
const MAX_GALLERY = 4;

const normalize = (value = '') => String(value).toLowerCase().trim();

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter((value) => {
    if (!value) return false;
    const next = String(value).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const tokenize = (...values) =>
  values
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const stopWords = new Set([
  'the',
  'and',
  'with',
  'from',
  'travel',
  'tour',
  'tourism',
  'trip',
  'journey',
  'visit',
  'place',
  'places',
  'best',
  'top',
  'india',
  'in',
  'of',
  'for',
  'to',
  'a',
  'an',
  'by',
  'near',
  'around',
]);

const scenicKeywords = [
  'waterfall',
  'waterfalls',
  'lake',
  'river',
  'beach',
  'mountain',
  'hills',
  'hill',
  'valley',
  'forest',
  'desert',
  'fort',
  'palace',
  'temple',
  'monastery',
  'bridge',
  'backwater',
  'tea garden',
  'coast',
  'coastal',
  'sunset',
  'sunrise',
  'monument',
  'heritage',
  'resort',
  'landscape',
  'scenic',
];

const badTokens = [
  'logo',
  'icon',
  'portrait',
  'selfie',
  'profile',
  'watermark',
  'text overlay',
  'screenshot',
  'poster',
  'banner',
  'illustration',
  'clipart',
  'stock vector',
  'emoji',
  'gif',
];

export const destinationImageKeywords = {
  meghalaya: [
    'Cherrapunji waterfalls Meghalaya',
    'Dawki river Meghalaya',
    'Living root bridge Meghalaya',
    'Shillong hills Meghalaya',
    'Mawlynnong village Meghalaya',
    'Meghalaya nature tourism',
  ],
  goa: [
    'Goa beach sunset',
    'Baga beach Goa',
    'Dudhsagar falls Goa',
    'Old Goa church',
    'Goa tropical coast',
    'Goa travel landscape',
  ],
  kashmir: [
    'Dal Lake Srinagar Kashmir',
    'Gulmarg Kashmir mountains',
    'Pahalgam valley Kashmir',
    'Sonmarg Kashmir',
    'Kashmir snow mountains',
    'Kashmir scenic travel',
  ],
  ladakh: [
    'Pangong lake Ladakh',
    'Nubra valley Ladakh',
    'Leh Ladakh mountains',
    'Khardung La Ladakh',
    'Ladakh monastery landscape',
    'Ladakh high altitude travel',
  ],
  jaipur: [
    'Hawa Mahal Jaipur',
    'Amber Fort Jaipur',
    'Nahargarh Fort Jaipur',
    'Jaipur palace Rajasthan',
    'Rajasthan heritage Jaipur',
    'Jaipur architecture travel',
  ],
  kerala: [
    'Kerala backwaters',
    'Munnar tea gardens',
    'Alleppey houseboat Kerala',
    'Wayanad Kerala nature',
    'Kochi Kerala travel',
    'Kerala lush landscape',
  ],
  manali: [
    'Manali mountains',
    'Solang Valley Manali',
    'Rohtang Pass Manali',
    'Himachal Manali snow',
    'Manali river valley',
    'Manali hill station travel',
  ],
  rajasthan: [
    'Rajasthan desert safari',
    'Jaisalmer fort Rajasthan',
    'Udaipur lake palace',
    'Rajasthan heritage travel',
    'Thar desert Rajasthan',
    'Rajasthan royal architecture',
  ],
  andaman: [
    'Andaman island beach',
    'Havelock island Andaman',
    'Radhanagar beach Andaman',
    'Andaman turquoise water',
    'Neil island Andaman',
    'Andaman coastline travel',
  ],
  varanasi: [
    'Varanasi ghats sunrise',
    'Ganga river Varanasi',
    'Kashi Vishwanath Varanasi',
    'Varanasi spiritual travel',
    'Banaras ghats',
    'Varanasi riverfront',
  ],
  agra: [
    'Taj Mahal Agra',
    'Agra Fort India',
    'Mehtab Bagh Taj Mahal',
    'Agra heritage travel',
    'Agra monument landscape',
  ],
  sikkim: [
    'Sikkim mountains',
    'Gangtok viewpoint',
    'Tsomgo Lake Sikkim',
    'Sikkim monastery landscape',
    'Himalayan Sikkim travel',
  ],
  darjeeling: [
    'Darjeeling tea gardens',
    'Darjeeling Himalayan railway',
    'Tiger Hill Darjeeling',
    'Darjeeling mountain view',
    'Darjeeling scenic travel',
  ],
  jodhpur: [
    'Mehrangarh Fort Jodhpur',
    'Blue City Jodhpur',
    'Jodhpur desert architecture',
    'Jodhpur heritage travel',
    'Rajasthan blue city',
  ],
  kanpur: [
    'Kanpur Ganga ghats',
    'Kanpur city heritage',
    'Kanpur historic places',
    'Kanpur Uttar Pradesh travel',
  ],
  delhi: [
    'India Gate Delhi',
    'Red Fort Delhi',
    'Qutub Minar Delhi',
    'Humayun Tomb Delhi',
    'Delhi heritage travel',
  ],
  rome: [
    'Colosseum Rome',
    'Roman Forum Rome',
    'Vatican Rome',
    'Rome historic city',
    'Rome Italy travel',
  ],
};

const categoryImageKeywords = {
  adventure: [
    'mountain trekking landscape',
    'river valley adventure',
    'forest adventure travel',
    'scenic outdoor tourism',
  ],
  beach: [
    'tropical beach coastline',
    'ocean shoreline sunset',
    'coastal resort landscape',
    'turquoise water beach',
  ],
  luxury: [
    'luxury resort landscape',
    'premium vacation destination',
    'high end travel experience',
    'luxury stay scenic',
  ],
  family: [
    'family travel landscape',
    'holiday destination scenic',
    'tourist attraction panorama',
    'safe scenic vacation',
  ],
  heritage: [
    'historic monument landscape',
    'palace fort heritage',
    'architectural travel view',
    'cultural tourism landmark',
  ],
  nature: [
    'waterfalls forest hills',
    'green valley landscape',
    'nature tourism scenic',
    'mountain river landscape',
  ],
  mountain: [
    'mountain panorama travel',
    'hill station scenery',
    'alpine landscape tourism',
    'misty hills panorama',
  ],
  spiritual: [
    'temple heritage landscape',
    'monastery tourism view',
    'peaceful spiritual travel',
    'holy river scenic',
  ],
  desert: [
    'desert dunes travel',
    'sand dunes landscape',
    'desert fort scenic',
    'sunset desert panorama',
  ],
  island: [
    'island beach panorama',
    'lagoon travel view',
    'coral coast tourism',
    'blue water island',
  ],
  city: [
    'city skyline travel',
    'urban landmark panorama',
    'night city view',
    'urban tourism scenic',
  ],
  wildlife: [
    'wildlife safari landscape',
    'forest reserve scenic',
    'animal safari panorama',
    'jungle tourism travel',
  ],
};

const categoryFallbackUrls = {
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=85',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1524824267900-7f3c3f1bb1f7?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
  ],
  nature: [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=85',
  ],
  heritage: [
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1435577623298-4bf1cfd6a0e5?auto=format&fit=crop&w=1600&q=85',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1501117716987-c8e2a3a8b0f0?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=85',
  ],
  family: [
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85',
  ],
  mountain: [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  ],
  spiritual: [
    'https://images.unsplash.com/photo-1475165046294-5bbd11d58030?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1455593688351-7d6f1bc7d5d0?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d5f6a1?auto=format&fit=crop&w=1600&q=85',
  ],
  desert: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1503520200083-4b13c0d4bb9e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
  ],
  island: [
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=85',
  ],
  city: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1465379944081-7f47de8f6b8f?auto=format&fit=crop&w=1600&q=85',
  ],
  wildlife: [
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=85',
  ],
};

const destinationFallbackUrls = {
  meghalaya: categoryFallbackUrls.nature,
  goa: categoryFallbackUrls.beach,
  kashmir: categoryFallbackUrls.mountain,
  ladakh: categoryFallbackUrls.mountain,
  jaipur: categoryFallbackUrls.heritage,
  kerala: categoryFallbackUrls.nature,
  manali: categoryFallbackUrls.mountain,
  rajasthan: categoryFallbackUrls.desert,
  andaman: categoryFallbackUrls.island,
  varanasi: categoryFallbackUrls.spiritual,
  agra: categoryFallbackUrls.heritage,
  sikkim: categoryFallbackUrls.mountain,
  darjeeling: categoryFallbackUrls.mountain,
  jodhpur: categoryFallbackUrls.heritage,
  kanpur: categoryFallbackUrls.heritage,
  delhi: categoryFallbackUrls.heritage,
  rome: categoryFallbackUrls.heritage,
};

const GENERIC_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1600&q=85',
];

const getCategoryFallbackPool = (category = '') => categoryFallbackUrls[normalize(category)] || GENERIC_FALLBACK_POOL;

const buildFallbackPool = (input = {}) => {
  const data = typeof input === 'string' ? { query: input } : input || {};
  const haystack = normalize(
    [
      data.name,
      data.title,
      data.location,
      data.city,
      data.state,
      data.region,
      data.country,
      data.category,
      data.type,
      data.description,
      data.query,
    ]
      .filter(Boolean)
      .join(' ')
  );

  const destinationKey = Object.keys(destinationImageKeywords).find((key) => haystack.includes(key));
  const category = detectCategory(data);

  const pool = [
    ...(destinationKey ? destinationFallbackUrls[destinationKey] || [] : []),
    ...(categoryFallbackUrls[category] || []),
    ...getCategoryFallbackPool(category),
  ];

  return uniqueStrings(pool).slice(0, MAX_IMAGE_POOL);
};

const detectCategory = (input = {}) => {
  const text = normalize(
    [
      input.category,
      input.type,
      input.name,
      input.title,
      input.location,
      input.city,
      input.state,
      input.region,
      input.country,
      input.description,
      input.query,
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (/\bbeach|coast|island|lagoon|shore|sea|ocean|harbour|harbor\b/.test(text)) return 'beach';
  if (/\bmountain|hill|hills|valley|snow|alpine|peak|trek|trekking\b/.test(text)) return 'mountain';
  if (/\bfort|palace|heritage|monument|historic|historical|history|temple|castle\b/.test(text)) return 'heritage';
  if (/\bspiritual|pilgrim|pilgrimage|monastery|temple|holy|sacred\b/.test(text)) return 'spiritual';
  if (/\bwildlife|safari|forest|jungle|reserve|sanctuary\b/.test(text)) return 'wildlife';
  if (/\bdesert|dunes|sand\b/.test(text)) return 'desert';
  if (/\bluxury|premium|deluxe|resort|spa\b/.test(text)) return 'luxury';
  if (/\bfamily|kids|group\b/.test(text)) return 'family';
  if (/\bisland\b/.test(text)) return 'island';
  if (/\bcity|urban|metro|metropolitan\b/.test(text)) return 'city';
  if (/\bnature|waterfall|waterfalls|lake|river|garden|tea garden\b/.test(text)) return 'nature';
  if (/\badventure|trek|camp|road trip|thrill\b/.test(text)) return 'adventure';

  return 'nature';
};

const detectDestinationKey = (input = {}) => {
  const haystack = normalize(
    [
      input.name,
      input.title,
      input.location,
      input.city,
      input.state,
      input.region,
      input.country,
      input.category,
      input.type,
      input.description,
      input.query,
    ]
      .filter(Boolean)
      .join(' ')
  );

  return Object.keys(destinationImageKeywords).find((key) => haystack.includes(key));
};

const buildDescriptionQueries = (description = '') => {
  const terms = tokenize(description)
    .filter((token) => token.length > 4 && !stopWords.has(token))
    .filter((token, index, array) => array.indexOf(token) === index)
    .slice(0, 4);

  return terms.length > 0 ? [`${terms.join(' ')} travel photography`] : [];
};

export const buildImageQueries = (input = {}) => {
  const data = typeof input === 'string' ? { query: input, name: input } : input || {};
  const name = data.name || data.title || data.query || '';
  const location = data.location || data.city || data.state || data.region || '';
  const country = data.country || 'India';
  const category = detectCategory(data);
  const destinationKey = detectDestinationKey(data);

  const queries = [
    `${name} ${location} travel photography`.trim(),
    `${name} ${location} tourism`.trim(),
    location ? `${location} scenic landscape travel` : '',
    location ? `${location} famous places` : '',
    `${location} ${category} travel photography`.trim(),
    `${name} ${country} tourism`.trim(),
    `${country} scenic travel`.trim(),
    `${category} tourism landscape`.trim(),
    ...buildDescriptionQueries(data.description || data.overview || data.summary || ''),
    ...(destinationKey ? destinationImageKeywords[destinationKey] : []),
    ...(categoryImageKeywords[category] || []),
  ];

  return uniqueStrings(queries.filter(Boolean)).slice(0, MAX_QUERIES);
};

const unsplashUrl = (image) => {
  if (!image?.urls) return '';
  if (image.urls.raw) {
    return `${image.urls.raw}&auto=format&fit=crop&w=1600&q=85`;
  }
  return image.urls.full || image.urls.regular || image.urls.small || '';
};

const pexelsUrl = (image) =>
  image?.src?.large2x ||
  image?.src?.landscape ||
  image?.src?.large ||
  image?.src?.medium ||
  image?.src?.original ||
  '';

const imageText = (image) =>
  [
    image.alt_description,
    image.description,
    image.alt,
    image.user?.name,
    image.photographer,
    image.slug,
    image.url,
    image.photographer_url,
    ...(Array.isArray(image.tags) ? image.tags.map((tag) => tag.title || tag) : []),
  ]
    .filter(Boolean)
    .join(' ');

const isBadImage = (image) => {
  const text = normalize(imageText(image));
  return badTokens.some((token) => text.includes(token));
};

const scoreImage = (candidate, input = {}) => {
  const width = Number(candidate.width || 0);
  const height = Number(candidate.height || 0);
  if (width < MIN_WIDTH || height < MIN_HEIGHT) return -1000;
  const aspectRatio = width / Math.max(height, 1);
  if (aspectRatio < MIN_ASPECT_RATIO) return -1000;
  if (isBadImage(candidate)) return -1000;

  const query = normalize(candidate.query || '');
  const destinationKey = detectDestinationKey(input);
  const detectedCategory = detectCategory(input);
  const text = normalize(`${imageText(candidate)} ${query} ${input.description || ''}`);
  const tokens = tokenize(input.name, input.title, input.location, input.city, input.state, input.region, input.category, input.type, input.description, query);

  let score = 0;
  score += Math.min(width / 220, 8);
  score += Math.min(height / 200, 6);
  score += Math.min(aspectRatio * 4, 6);
  score += candidate.provider === 'unsplash' ? 6 : 4;
  score += candidate.provider === 'pexels' ? 5 : 0;

  if (destinationKey && text.includes(destinationKey)) score += 40;
  if (detectedCategory && text.includes(detectedCategory)) score += 16;

  tokens.forEach((token) => {
    if (token.length > 3 && text.includes(token)) {
      score += 4;
    }
  });

  scenicKeywords.forEach((token) => {
    if (text.includes(token)) {
      score += 3;
    }
  });

  if (text.includes('travel')) score += 4;
  if (text.includes('tourism')) score += 4;
  if (text.includes('landscape')) score += 6;
  if (text.includes('scenic')) score += 5;
  if (text.includes('panorama')) score += 5;

  return score;
};

const normalizeCandidate = (image, provider, query, input) => {
  const url = provider === 'unsplash' ? unsplashUrl(image) : pexelsUrl(image);
  const candidate = {
    id: image.id || image.slug || image.photographer_url || url,
    url,
    width: image.width || image.src?.width || 0,
    height: image.height || image.src?.height || 0,
    provider,
    query,
    alt: image.alt_description || image.description || image.alt || query,
    tags: Array.isArray(image.tags)
      ? image.tags.map((tag) => tag.title || tag).filter(Boolean)
      : [],
  };

  candidate.score = scoreImage(candidate, input);
  return candidate;
};

const fetchUnsplashCandidates = async (queries, input, apiKey) => {
  const responses = await Promise.allSettled(
    queries.map(async (query) => {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: { Authorization: `Client-ID ${apiKey}` },
        params: {
          query,
          per_page: 20,
          orientation: 'landscape',
          content_filter: 'high',
        },
      });

      const results = response.data?.results || [];
      return results.map((image) => normalizeCandidate(image, 'unsplash', query, input));
    })
  );

  return responses.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
};

const fetchPexelsCandidates = async (queries, input, apiKey) => {
  const responses = await Promise.allSettled(
    queries.map(async (query) => {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: apiKey },
        params: {
          query,
          per_page: 20,
          orientation: 'landscape',
        },
      });

      const results = response.data?.photos || [];
      return results.map((image) => normalizeCandidate(image, 'pexels', query, input));
    })
  );

  return responses.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
};

const collectFallbackPool = (input = {}, detectedCategory) => {
  return buildFallbackPool({
    ...(typeof input === 'string' ? { query: input } : input || {}),
    category: (typeof input === 'object' && input && input.category) || detectedCategory || '',
  });
};

const buildImagePayload = (rankedCandidates, input = {}) => {
  const detectedCategory = detectCategory(input);
  const fallbackPool = collectFallbackPool(input, detectedCategory);
  const rankedUrls = rankedCandidates.map((candidate) => candidate.url).filter(Boolean);
  const combinedPool = uniqueStrings([
    ...rankedUrls,
    ...fallbackPool,
  ]);

  const heroImage = combinedPool[0] || fallbackPool[0] || GENERIC_FALLBACK_POOL[0];
  const imagePool = combinedPool.slice(0, MAX_IMAGE_POOL);
  const gallery = uniqueStrings([heroImage, ...imagePool.slice(1)])
    .filter(Boolean)
    .slice(1, MAX_GALLERY + 1);

  return {
    heroImage,
    gallery,
    imagePool,
    rotationPool: imagePool,
    imageSource: rankedCandidates[0]?.provider || 'fallback',
    imageUpdatedAt: new Date(),
    detectedCategory,
    queries: buildImageQueries(input),
  };
};

export const getDestinationImages = async (input) => {
  const UNSPLASH_API_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY;
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  const data = typeof input === 'string' ? { query: input, name: input } : input || {};
  const cacheKey = JSON.stringify({
    name: data.name || data.title || '',
    location: data.location || data.city || data.state || data.region || '',
    country: data.country || '',
    category: data.category || data.type || '',
    description: String(data.description || data.overview || data.summary || '').slice(0, 160),
    query: data.query || '',
  });

  const cached = imageCache.get(cacheKey);
  if (cached && !data.forceRefresh) {
    return cached;
  }

  const queries = buildImageQueries(data);
  const providerTasks = [];

  if (UNSPLASH_API_KEY) {
    providerTasks.push(fetchUnsplashCandidates(queries, data, UNSPLASH_API_KEY));
  }

  if (PEXELS_API_KEY) {
    providerTasks.push(fetchPexelsCandidates(queries, data, PEXELS_API_KEY));
  }

  let candidates = [];
  if (providerTasks.length > 0) {
    const settled = await Promise.allSettled(providerTasks);
    candidates = settled.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
  }

  const ranked = uniqueStrings(
    candidates
      .filter((candidate) => candidate.url && candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((candidate) => candidate.url)
  ).map((url) => candidates.find((candidate) => candidate.url === url)).filter(Boolean);

  const payload = ranked.length > 0
    ? buildImagePayload(ranked, data)
    : {
        heroImage: collectFallbackPool(data, detectCategory(data))[0] || GENERIC_FALLBACK_POOL[0],
        gallery: collectFallbackPool(data, detectCategory(data)).slice(1, MAX_GALLERY + 1),
        imagePool: collectFallbackPool(data, detectCategory(data)),
        rotationPool: collectFallbackPool(data, detectCategory(data)),
        imageSource: 'fallback',
        imageUpdatedAt: new Date(),
        detectedCategory: detectCategory(data),
        queries,
      };

  imageCache.set(cacheKey, payload);
  return payload;
};

export const detectDestinationCategory = detectCategory;
export const getDestinationFallbackPool = (input = {}) => collectFallbackPool(input, detectCategory(input));
export const getDestinationFallbackImages = (input = {}) =>
  collectFallbackPool(input, detectCategory(input)).slice(0, MAX_IMAGE_POOL);

const HOTEL_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f2c5?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1618773928120-22c6082c97df?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1501117716987-c8e2a3a8b0f0?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1507652313519-d4511f3b7bd8?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1468826113239-2adc5e6590bf?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
];

const rotatePool = (pool = [], key = '') => {
  if (!Array.isArray(pool) || pool.length <= 1) return pool;
  let hash = 0;
  const seed = String(key || '');
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const offset = hash % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
};

const HOTEL_CATEGORY_QUERIES = {
  beach: ['beach resort exterior', 'coastal hotel room', 'oceanfront resort lobby'],
  adventure: ['mountain lodge exterior', 'adventure resort room', 'trail resort facade'],
  nature: ['eco resort exterior', 'forest lodge room', 'nature retreat suite'],
  heritage: ['heritage hotel facade', 'palace hotel room', 'royal resort lobby'],
  luxury: ['luxury hotel exterior', 'premium hotel room', 'signature suite interior'],
  family: ['family resort exterior', 'spacious hotel room', 'holiday resort lobby'],
  spiritual: ['quiet retreat hotel exterior', 'serene hotel room', 'wellness resort lobby'],
  mountain: ['mountain resort exterior', 'hill station hotel room', 'alpine lodge facade'],
  desert: ['desert resort exterior', 'heritage hotel room', 'dune retreat facade'],
  island: ['island resort exterior', 'beachfront hotel room', 'tropical villa'],
  city: ['city hotel exterior', 'urban hotel room', 'business hotel lobby'],
  wildlife: ['safari lodge exterior', 'jungle resort room', 'eco lodge facade'],
  default: ['premium hotel exterior', 'hotel room interior', 'luxury hotel lobby'],
};

const HOTEL_POSITIVE_TOKENS = [
  'hotel',
  'resort',
  'suite',
  'room',
  'lobby',
  'reception',
  'villa',
  'boutique',
  'stay',
  'accommodation',
  'property',
  'guesthouse',
  'lodge',
  'residence',
  'retreat',
  'pavilion',
  'mansion',
  'palace',
  'inn',
  'facade',
  'exterior',
  'interior',
];

const HOTEL_NEGATIVE_TOKENS = [
  'waterfall',
  'mountain',
  'valley',
  'beach',
  'monument',
  'temple',
  'fort',
  'bridge',
  'road',
  'street',
  'landscape',
  'panorama',
  'scenic',
  'tourism',
  'travel',
  'statue',
  'ghat',
  'garden',
  'city view',
  'nature trail',
  'vehicle',
  'food',
  'people',
  'portrait',
  'selfie',
];

const buildHotelDescriptionQueries = (description = '') => {
  const terms = tokenize(description)
    .filter((token) => token.length > 4 && !stopWords.has(token))
    .filter((token, index, array) => array.indexOf(token) === index)
    .slice(0, 4);

  return terms.length > 0 ? [`${terms.join(' ')} hotel interior`] : [];
};

const buildHotelImageQueries = (input = {}) => {
  const data = typeof input === 'string' ? { query: input, name: input } : input || {};
  const name = data.name || data.title || data.query || '';
  const location = data.location || data.city || data.state || data.region || '';
  const country = data.country || 'India';
  const category = detectCategory(data);
  const destinationKey = detectDestinationKey(data);
  const cleanLocation = String(location || '').split(',').map((part) => part.trim()).filter(Boolean)[0] || location;

  const categoryQueries = HOTEL_CATEGORY_QUERIES[category] || HOTEL_CATEGORY_QUERIES.default;

  const queries = [
    `${name} hotel ${location}`.trim(),
    `${name} resort ${location}`.trim(),
    `${name} luxury hotel ${location}`.trim(),
    `${cleanLocation} hotel exterior`.trim(),
    `${cleanLocation} hotel room`.trim(),
    `${cleanLocation} luxury hotel room`.trim(),
    `${cleanLocation} luxury hotel exterior`.trim(),
    `${cleanLocation} hotel lobby`.trim(),
    `${cleanLocation} resort exterior`.trim(),
    `${cleanLocation} boutique hotel`.trim(),
    `${cleanLocation} premium hotel room`.trim(),
    `${name} hotel room ${location}`.trim(),
    `${name} property ${location}`.trim(),
    `${country} premium hotel interior`.trim(),
    `${category} hotel exterior`.trim(),
    ...buildHotelDescriptionQueries(data.description || data.overview || data.summary || ''),
    ...(destinationKey ? [
      `${destinationKey} luxury hotel exterior`,
      `${destinationKey} hotel room`,
      `${destinationKey} resort lobby`,
    ] : []),
    ...categoryQueries.map((query) => `${cleanLocation} ${query}`.trim()),
  ];

  return uniqueStrings(queries.filter(Boolean)).slice(0, MAX_QUERIES);
};

const scoreHotelImage = (candidate, input = {}) => {
  const width = Number(candidate.width || 0);
  const height = Number(candidate.height || 0);
  if (width < MIN_WIDTH || height < MIN_HEIGHT) return -1000;
  const aspectRatio = width / Math.max(height, 1);
  if (aspectRatio < MIN_ASPECT_RATIO) return -1000;

  const sourceText = normalize(candidate.sourceText || '');
  const query = normalize(candidate.query || '');
  const destinationKey = detectDestinationKey(input);
  const text = normalize(`${sourceText} ${query} ${input.name || ''} ${input.location || ''} ${input.city || ''} ${input.state || ''}`);
  const hasHotelToken = HOTEL_POSITIVE_TOKENS.some((token) => sourceText.includes(token));

  if (!hasHotelToken) return -1000;
  if (HOTEL_NEGATIVE_TOKENS.some((token) => sourceText.includes(token)) && !/hotel|resort|suite|room|lobby|villa|boutique|stay|accommodation|property|guesthouse|lodge|residence|retreat|pavilion|mansion|palace|inn/.test(sourceText)) {
    return -1000;
  }

  let score = 0;
  score += Math.min(width / 220, 8);
  score += Math.min(height / 200, 6);
  score += Math.min(aspectRatio * 4, 6);
  score += candidate.provider === 'unsplash' ? 6 : 4;
  score += candidate.provider === 'pexels' ? 5 : 0;
  score += 30;

  if (destinationKey && text.includes(destinationKey)) score += 20;
  if (text.includes('luxury')) score += 10;
  if (text.includes('premium')) score += 8;
  if (text.includes('interior')) score += 8;
  if (text.includes('exterior')) score += 8;
  if (text.includes('lobby')) score += 7;
  if (text.includes('suite')) score += 7;
  if (text.includes('room')) score += 7;
  if (text.includes('facade')) score += 7;
  if (text.includes('building')) score += 6;
  if (text.includes('resort')) score += 8;
  if (text.includes('hotel')) score += 8;

  tokenize(input.name, input.title, input.location, input.city, input.state, input.region).forEach((token) => {
    if (token.length > 3 && sourceText.includes(token)) {
      score += 4;
    }
  });

  return score;
};

const normalizeHotelCandidate = (image, provider, query, input) => {
  const url = provider === 'unsplash' ? unsplashUrl(image) : pexelsUrl(image);
  const candidate = {
    id: image.id || image.slug || image.photographer_url || url,
    url,
    width: image.width || image.src?.width || 0,
    height: image.height || image.src?.height || 0,
    provider,
    query,
    alt: image.alt_description || image.description || image.alt || query,
    tags: Array.isArray(image.tags)
      ? image.tags.map((tag) => tag.title || tag).filter(Boolean)
      : [],
    sourceText: normalize(imageText(image)),
  };

  candidate.score = scoreHotelImage(candidate, input);
  return candidate;
};

const fetchHotelCandidates = async (queries, input, apiKey) => {
  const responses = await Promise.allSettled(
    queries.map(async (query) => {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: { Authorization: `Client-ID ${apiKey}` },
        params: {
          query,
          per_page: 20,
          orientation: 'landscape',
          content_filter: 'high',
        },
      });

      const results = response.data?.results || [];
      return results.map((image) => normalizeHotelCandidate(image, 'unsplash', query, input));
    })
  );

  return responses.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
};

const fetchHotelPexelsCandidates = async (queries, input, apiKey) => {
  const responses = await Promise.allSettled(
    queries.map(async (query) => {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: apiKey },
        params: {
          query,
          per_page: 20,
          orientation: 'landscape',
        },
      });

      const results = response.data?.photos || [];
      return results.map((image) => normalizeHotelCandidate(image, 'pexels', query, input));
    })
  );

  return responses.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
};

const buildHotelFallbackPool = (input = {}) => {
  const data = typeof input === 'string' ? { query: input } : input || {};
  const basePool = [...HOTEL_FALLBACK_POOL];

  const queryName = String(data.name || data.title || data.query || '').trim();
  const queryLocation = String(data.location || data.city || data.state || data.region || '').trim();

  const uniquePool = uniqueStrings([
    ...(queryName ? [HOTEL_FALLBACK_POOL[0], HOTEL_FALLBACK_POOL[1]] : []),
    ...(queryLocation ? [HOTEL_FALLBACK_POOL[2], HOTEL_FALLBACK_POOL[3]] : []),
    ...basePool,
  ]).slice(0, MAX_IMAGE_POOL);

  return rotatePool(uniquePool, `${queryName}|${queryLocation}`);
};

const buildHotelImagePayload = (rankedCandidates, input = {}) => {
  const fallbackPool = buildHotelFallbackPool(input);
  const rankedUrls = rankedCandidates.map((candidate) => candidate.url).filter(Boolean);
  const combinedPool = uniqueStrings([
    ...rankedUrls,
    ...fallbackPool,
  ]);

  const heroImage = combinedPool[0] || fallbackPool[0] || HOTEL_FALLBACK_POOL[0];
  const imagePool = combinedPool.slice(0, MAX_IMAGE_POOL);
  const gallery = uniqueStrings([heroImage, ...imagePool.slice(1)]).slice(1, MAX_GALLERY + 1);

  return {
    heroImage,
    gallery,
    imagePool,
    rotationPool: imagePool,
    imageSource: rankedCandidates[0]?.provider || 'fallback',
    imageUpdatedAt: new Date(),
    detectedCategory: detectCategory(input),
    queries: buildHotelImageQueries(input),
  };
};

export const getHotelImages = async (input) => {
  const UNSPLASH_API_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY;
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
  const data = typeof input === 'string' ? { query: input, name: input } : input || {};
  const cacheKey = JSON.stringify({
    variant: 'hotel',
    name: data.name || data.title || '',
    location: data.location || data.city || data.state || data.region || '',
    country: data.country || '',
    category: data.category || data.type || '',
    description: String(data.description || data.overview || data.summary || '').slice(0, 160),
    query: data.query || '',
  });

  const cached = imageCache.get(cacheKey);
  if (cached && !data.forceRefresh) {
    return cached;
  }

  const queries = buildHotelImageQueries(data);
  let candidates = [];

  const providerTasks = [];
  if (UNSPLASH_API_KEY) providerTasks.push(fetchHotelCandidates(queries, data, UNSPLASH_API_KEY));
  if (PEXELS_API_KEY) providerTasks.push(fetchHotelPexelsCandidates(queries, data, PEXELS_API_KEY));

  if (providerTasks.length > 0) {
    const settled = await Promise.allSettled(providerTasks);
    candidates = settled.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
  }

  const ranked = uniqueStrings(
    candidates
      .filter((candidate) => candidate.url && candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((candidate) => candidate.url)
  ).map((url) => candidates.find((candidate) => candidate.url === url)).filter(Boolean);

  const payload = ranked.length > 0
    ? buildHotelImagePayload(ranked, data)
    : {
        heroImage: buildHotelFallbackPool(data)[0] || HOTEL_FALLBACK_POOL[0],
        gallery: buildHotelFallbackPool(data).slice(1, MAX_GALLERY + 1),
        imagePool: buildHotelFallbackPool(data),
        rotationPool: buildHotelFallbackPool(data),
        imageSource: 'fallback',
        imageUpdatedAt: new Date(),
        detectedCategory: detectCategory(data),
        queries,
      };

  imageCache.set(cacheKey, payload);
  return payload;
};

export const getHotelFallbackImages = (input = {}) =>
  buildHotelFallbackPool(input).slice(0, MAX_IMAGE_POOL);

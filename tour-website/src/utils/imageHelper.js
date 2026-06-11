export const destinationImageKeywords = {
  meghalaya: [
    'Cherrapunji waterfalls Meghalaya',
    'Dawki river Meghalaya',
    'Living root bridge Meghalaya',
    'Shillong hills Meghalaya',
    'Mawlynnong village Meghalaya',
  ],
  goa: ['Goa beach sunset', 'Baga beach Goa', 'Dudhsagar falls Goa', 'Old Goa church'],
  kashmir: ['Dal Lake Srinagar Kashmir', 'Gulmarg Kashmir', 'Pahalgam valley', 'Sonmarg Kashmir'],
  ladakh: ['Pangong lake Ladakh', 'Nubra valley Ladakh', 'Leh Ladakh mountains', 'Ladakh monastery'],
  jaipur: ['Hawa Mahal Jaipur', 'Amber Fort Jaipur', 'Nahargarh Fort Jaipur', 'Jaipur palace'],
  kerala: ['Kerala backwaters', 'Munnar tea gardens', 'Alleppey houseboat', 'Wayanad Kerala'],
  manali: ['Manali mountains', 'Solang Valley Manali', 'Rohtang Pass Manali', 'Manali river valley'],
  andaman: ['Andaman island beach', 'Havelock island Andaman', 'Radhanagar beach Andaman'],
  varanasi: ['Varanasi ghats sunrise', 'Ganga river Varanasi', 'Banaras ghats'],
  agra: ['Taj Mahal Agra', 'Agra Fort India', 'Mehtab Bagh Taj Mahal'],
  rajasthan: ['Rajasthan desert safari', 'Jaisalmer fort Rajasthan', 'Udaipur lake palace'],
  sikkim: ['Sikkim mountains', 'Gangtok viewpoint', 'Tsomgo Lake Sikkim'],
  darjeeling: ['Darjeeling tea gardens', 'Darjeeling Himalayan railway', 'Tiger Hill Darjeeling'],
  jodhpur: ['Mehrangarh Fort Jodhpur', 'Blue City Jodhpur', 'Jodhpur heritage travel'],
  kanpur: ['Kanpur ghats Ganga river', 'Kanpur city heritage', 'Kanpur historic places'],
  delhi: ['India Gate Delhi', 'Red Fort Delhi', 'Qutub Minar Delhi', 'Humayun Tomb Delhi'],
  rome: ['Colosseum Rome', 'Roman Forum Rome', 'Vatican Rome', 'Rome historic city'],
};

const MAX_GALLERY_IMAGES = 5;

const normalize = (value = '') => String(value).toLowerCase().trim();

export const detectDestinationKey = (...values) => {
  const text = normalize(values.filter(Boolean).join(' '));
  return Object.keys(destinationImageKeywords).find((key) => text.includes(key));
};

export const isImageUrl = (value = '') => /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif)(\?|$)/i.test(String(value))
  || /^https?:\/\/images\.unsplash\.com\//i.test(String(value))
  || /^https?:\/\/images\.pexels\.com\//i.test(String(value));

export const imageKey = (url = '') => String(url || '').split('?')[0].replace(/\/$/, '');

export const uniqueImageUrls = (images = []) => {
  const seen = new Set();
  return images.filter(isImageUrl).filter((url) => {
    const key = imageKey(url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const stableHash = (value = '') => {
  let hash = 0;
  const seed = String(value || '');
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
};

const fallbackUrl = (query, width = 1600, height = 900) =>
  `https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=${width}&h=${height}&q=85`;

const curatedPools = {
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
  meghalaya: [
    'https://images.unsplash.com/photo-1596707314271-e75c74384a32?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
  ],
  goa: [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1549488344-c6899ba89f41?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=85',
  ],
  kashmir: [
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
  ],
  ladakh: [
    'https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1589308454676-473d09a56658?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=85',
  ],
  jaipur: [
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=85',
  ],
  kerala: [
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1593693397690-362cb9666cf2?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=85',
  ],
  manali: [
    'https://images.unsplash.com/photo-1605649487212-4d4ce17a8ea3?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
  ],
  andaman: [
    'https://images.unsplash.com/photo-1589394815804-964ce0ff96c7?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=85',
  ],
  varanasi: [
    'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1475165046294-5bbd11d58030?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d5f6a1?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=85',
  ],
  agra: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=1600&q=85',
  ],
  rajasthan: [
    'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1623912079083-d5d83389a9be?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1600&q=85',
  ],
  sikkim: [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
  ],
  darjeeling: [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
  ],
  jodhpur: [
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
  ],
  kanpur: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=1600&q=85',
  ],
  delhi: [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85',
  ],
  rome: [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1600&q=85',
  ],
};

const GENERIC_POOL = [
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
  const hash = stableHash(key);
  const offset = hash % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
};

export const getHotelFallbackImages = ({ imagePool = [], gallery = [], name = '', location = '' } = {}) =>
  rotatePool([...new Set([
    ...imagePool,
    ...gallery,
    ...HOTEL_FALLBACK_POOL,
  ].filter(Boolean))].slice(0, MAX_GALLERY_IMAGES), `${name}|${location}`);

export const detectCategory = (value = '') => {
  const text = normalize(value);
  if (/\bbeach|coast|island|lagoon|shore|sea|ocean\b/.test(text)) return 'beach';
  if (/\bmountain|hill|hills|valley|snow|alpine|peak|trek\b/.test(text)) return 'mountain';
  if (/\bfort|palace|heritage|monument|historic|historical|temple|castle\b/.test(text)) return 'heritage';
  if (/\bspiritual|pilgrim|pilgrimage|monastery|holy|sacred\b/.test(text)) return 'spiritual';
  if (/\bwildlife|safari|forest|jungle|reserve|sanctuary\b/.test(text)) return 'wildlife';
  if (/\bdesert|dunes|sand\b/.test(text)) return 'desert';
  if (/\bluxury|premium|deluxe|resort|spa\b/.test(text)) return 'luxury';
  if (/\bfamily|kids|group\b/.test(text)) return 'family';
  if (/\bisland\b/.test(text)) return 'island';
  if (/\bcity|urban|metro|metropolitan\b/.test(text)) return 'city';
  if (/\badventure|trek|camp|road trip|thrill\b/.test(text)) return 'adventure';
  return 'nature';
};

export const getDestinationFallbackImages = ({ name = '', location = '', category = '', imagePool = [], gallery = [] } = {}) => {
  const destinationKey = detectDestinationKey(name, location, category);
  const detectedCategory = detectCategory(`${name} ${location} ${category}`);
  const seed = `${name}|${location}|${category}`;
  const suppliedPool = uniqueImageUrls([...imagePool, ...gallery]);
  const destinationPool = rotatePool(uniqueImageUrls(destinationKey ? destinationFallbackUrls[destinationKey] || [] : []), seed);
  const categoryPool = rotatePool(uniqueImageUrls(curatedPools[detectedCategory] || []), seed);
  const genericPool = rotatePool(uniqueImageUrls(GENERIC_POOL), seed);
  const pool = [
    ...suppliedPool,
    ...destinationPool,
    ...categoryPool,
    ...genericPool,
  ];

  return uniqueImageUrls(pool).slice(0, MAX_GALLERY_IMAGES);
};

export const getFallbackImagePool = (location, type = 'destination') =>
  type === 'hotel'
    ? getHotelFallbackImages()
    : getDestinationFallbackImages({ name: location, location, category: type });

export const getFallbackImage = (location, type = 'destination') => {
  const fallbackImages = getFallbackImagePool(location, type);
  return fallbackImages[0] || fallbackUrl('premium travel landscape India', 1600, 900);
};

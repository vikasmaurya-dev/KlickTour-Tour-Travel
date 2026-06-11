import axios from 'axios';

export const getPlaceDetails = async (cityName) => {
  const GEODB_API_KEY = process.env.GEODB_API_KEY;
  try {
    let lat, lng, country, region;
    let placeName = cityName;

    const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
    try {
      if (!OPENTRIPMAP_API_KEY) throw new Error("No OTM API key");

      const otmResponse = await axios.get('https://api.opentripmap.com/0.1/en/places/geoname', {
        params: { name: cityName, apikey: OPENTRIPMAP_API_KEY }
      });

      if (!otmResponse.data || otmResponse.data.status !== 'OK') {
        throw new Error('Not found in OTM');
      }

      lat = otmResponse.data.lat;
      lng = otmResponse.data.lon;
      country = otmResponse.data.country;
      region = 'Global';
      placeName = otmResponse.data.name;
    } catch (err) {
      console.warn(`OTM Geocode failed (${err.message}), using fallback coordinates`);
      lat = 26.9124; // Jaipur default
      lng = 75.7873;
      country = 'Unknown';
      region = 'Global';
    }

    // Build the base description based on DB
    const description = `${placeName} is a renowned destination located in ${region || country}. It's celebrated for its amazing culture, warm hospitality, and unforgettable scenic views.`;
    
    // Determine category based on elevation or coastal region could be simulated, but we just set randomly based on country 
    let category = 'Culture & Heritage';
    if (country === 'India') category = 'Heritage & Wonders';
    
    // Ensure we await getAttractions
    const attractions = await getAttractions(lat, lng, placeName);

    return {
      place: placeName,
      country: country,
      state: region,
      description,
      coordinates: { lat, lng },
      category,
      attractions
    };
  } catch (error) {
    console.error("PlaceService Error:", error.message);
    throw error;
  }
};

const getAttractions = async (lat, lng, cityName) => {
  const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
  try {
    if (!OPENTRIPMAP_API_KEY) return defaultAttractions(cityName);

    // Fetch places within a 20km radius, rated 3 or above
    const response = await axios.get(`https://api.opentripmap.com/0.1/en/places/radius`, {
      params: {
        radius: 20000,
        lon: lng,
        lat: lat,
        rate: 3,
        format: 'json',
        limit: 10,
        apikey: OPENTRIPMAP_API_KEY
      }
    });

    if (!response.data || response.data.length === 0) {
      return defaultAttractions(cityName);
    }

    // Filter out missing names and map the data
    return response.data
      .filter((place) => place.name)
      .slice(0, 4) // Only take top 4
      .map(place => ({
        name: place.name,
        kinds: place.kinds.replace(/_/g, ' ').split(',')[0],
        distance: `${(place.dist / 1000).toFixed(1)} km away`,
      }));

  } catch (err) {
    console.error("OpenTripMap Error:", err.message);
    return defaultAttractions(cityName);
  }
};

const defaultAttractions = (cityName) => {
  return [
    { name: `Historic Center of ${cityName}`, kinds: 'historic', distance: '1.2 km away' },
    { name: `Local Market`, kinds: 'shops', distance: '3.5 km away' },
    { name: `Grand Museum`, kinds: 'museums', distance: '4.0 km away' },
    { name: `City Viewpoint`, kinds: 'nature', distance: '6.2 km away' },
  ];
};

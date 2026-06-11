import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function test() {
  const { GEODB_API_KEY, UNSPLASH_API_KEY, PEXELS_API_KEY, OPENTRIPMAP_API_KEY } = process.env;

  try {
    console.log("Testing GeoDB...");
    await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/places', {
      params: { namePrefix: 'jaipur', limit: 1 },
      headers: { 'x-rapidapi-key': GEODB_API_KEY, 'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com' }
    });
    console.log("GeoDB SUCCESS");
  } catch(e) { console.error("GeoDB FAIL:", e.response?.status) }

  try {
    console.log("Testing Unsplash...");
    await axios.get('https://api.unsplash.com/search/photos', {
      headers: { Authorization: `Client-ID ${UNSPLASH_API_KEY}` },
      params: { query: 'jaipur', per_page: 5 }
    });
    console.log("Unsplash SUCCESS");
  } catch(e) { console.error("Unsplash FAIL:", e.response?.status) }

  try {
    console.log("Testing OpenTripMap...");
    await axios.get(`https://api.opentripmap.com/0.1/en/places/radius`, {
      params: { radius: 20000, lon: 75, lat: 26, rate: 3, format: 'json', apikey: OPENTRIPMAP_API_KEY }
    });
    console.log("OpenTripMap SUCCESS");
  } catch(e) { console.error("OpenTripMap FAIL:", e.response?.status) }
}
test();

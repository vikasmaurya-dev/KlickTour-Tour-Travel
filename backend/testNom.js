import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function test() {
  const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
  try {
      console.log("Testing OTM Geocoding...");
      const otmResponse = await axios.get('https://api.opentripmap.com/0.1/en/places/geoname', {
        params: { name: 'jaipur', apikey: OPENTRIPMAP_API_KEY }
      });
      console.log("OTM SUCCESS:", otmResponse.data);
  } catch(e) { 
      console.log("OTM FAIL:", e.response?.status); 
  }
}
test();

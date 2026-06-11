import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const generateTravelPackage = async (placeName) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    throw new Error("Neither Gemini API key nor OpenAI API key is configured.");
  }

  const prompt = `
You are an expert luxury travel planner for "KlickTour". I need a fully structured JSON response for a premium travel destination and package for "${placeName}".
Do not return markdown formatting blocks, return ONLY valid JSON.

CRITICAL: Do NOT include the words "AI", "Artificial Intelligence", "Generated", or "Bot" anywhere in the response. The content must look like it was written by a human travel expert.

The JSON MUST contain all fields for both a "Destination" overview and a "Package" detail page. 
Make the descriptions highly engaging, sensory, and luxury-focused.

Structure the JSON exactly as follows:
{
  "destination": {
    "name": "${placeName}",
    "location": "State/Region, Country",
    "type": "Must be one of: Adventure, Beach, Mountain, Spiritual, Historical, Honeymoon, Wildlife, City, Desert, Island, Family, Luxury",
    "budget": "Must be one of: Low, Medium, High",
    "duration": "E.g., 6 Days / 5 Nights",
    "price": 18000,
    "tagline": "A catchy premium tagline (no AI mention)",
    "description": "An engaging 3-4 sentence overview for the listing card...",
    "overview": "A detailed 3-paragraph description of the destination's charm, history, and why it's a must-visit. Mention specific vibes and atmosphere.",
    "bestTime": "E.g., October to March",
    "weather": "Detailed description of typical weather patterns...",
    "famousAttractions": ["Specific Attraction 1", "Specific Attraction 2", "Specific Attraction 3", "Specific Attraction 4"],
    "localFood": ["Local Dish 1", "Local Dish 2", "Local Dish 3"],
    "thingsToDo": ["Exciting Activity 1", "Exciting Activity 2", "Exciting Activity 3", "Exciting Activity 4"]
  },
  "package": {
    "name": "The Ultimate ${placeName} Luxury Experience",
    "category": "Must be one of: Beach, Mountain, Heritage, Adventure, Wildlife, Spiritual, Honeymoon, Family, Luxury, Budget, Weekend, International",
    "duration": "E.g., 6 Days / 5 Nights",
    "price": 22000,
    "originalPrice": 27000,
    "discount": "22% OFF",
    "rating": 4.9,
    "reviews": 124,
    "description": "A very detailed package description (at least 150 words) that highlights luxury, comfort, and the unique experiences included in this specific journey. Focus on the value and exclusivity.",
    "tagline": "The most curated premium journey through ${placeName}",
    "bestSeason": "E.g., October to March",
    "idealFor": ["Luxury Travelers", "Couples", "Adventure Seekers"],
    "highlights": ["Premium Highlight 1", "Premium Highlight 2", "Premium Highlight 3", "Premium Highlight 4", "Premium Highlight 5"],
    "included": ["Quality Hotel Stay", "Breakfast & Selected Meals", "Private AC Car for Sightseeing", "Destination Expert", "Key Entry Tickets & Monument Fees", "24/7 Support"],
    "excluded": ["Airfare/Train Tickets", "Laundry & Tips", "Personal Shopping", "Alcoholic Beverages"],
    "activities": ["Guided Monument Tour", "Private Local Workshop", "Exclusive Evening Event", "Hidden Gem Exploration"],
    "hotelsInfo": ["Name of a real or realistic Luxury Hotel 1", "Name of a real or realistic Luxury Hotel 2"],
    "transportDesc": "Premium AC SUV (Innova Crysta or similar) for all transfers and city tours with a professional uniformed chauffeur.",
    "meals": ["Breakfast", "Lunch", "Dinner"],
    "cancellationPolicy": "Full refund if cancelled 15 days before travel. 50% refund between 7-14 days.",
    "bookingPolicy": "Pay only 25% today to book this premium experience. Balance 7 days before travel.",
    "travelTips": ["Carry comfortable walking shoes", "Keep a power bank", "Try the local street food at [Specific Area]"],
    "faqs": [
      { "q": "What is the best way to reach?", "a": "The nearest airport is... and we provide private pickup." },
      { "q": "Is this package suitable for seniors?", "a": "Yes, we ensure minimal walking and comfortable luxury transfers." },
      { "q": "Are vegetarian meals available?", "a": "Absolutely, all our partner hotels provide diverse vegetarian and vegan options." },
      { "q": "Can we extend our stay?", "a": "Yes, our experts can customize and extend your itinerary as per your wishes." }
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Royal Welcome & Sunset Serenity",
        "desc": "Arrive at ${placeName} and receive a traditional welcome. Check-in to your luxury suite. In the evening, enjoy a private curated sunset experience followed by a gala dinner.",
        "activities": ["Airport Pickup", "Suite Check-in", "Sunset Experience", "Gala Dinner"]
      },
      {
        "day": 2,
        "title": "The Heart of ${placeName}: Heritage & History",
        "desc": "Explore the iconic landmarks and hidden architectural gems with our local expert who will share stories untold.",
        "activities": ["Guided Heritage Tour", "Museum Visit", "Traditional Lunch"]
      },
      {
        "day": 3,
        "title": "Local Life & Authentic Flavors",
        "desc": "A day dedicated to experiencing ${placeName} like a local. Visit artisan workshops and enjoy a private cooking demonstration.",
        "activities": ["Artisan Workshop", "Culinary Class", "Market Walk"]
      },
      {
        "day": 4,
        "title": "Natural Wonders & Scenic Vistas",
        "desc": "Witness the breathtaking beauty of the surrounding landscapes. Perfect for photography and peaceful reflection.",
        "activities": ["Scenic Nature Walk", "Panoramic Viewpoints", "Picnic by the Lake/Hill"]
      },
      {
        "day": 5,
        "title": "Luxury Leisure & Spa Indulgence",
        "desc": "Enjoy the world-class amenities of your resort. A day for relaxation, spa treatments, and slow-paced exploration.",
        "activities": ["Spa Session", "Poolside Relaxation", "Evening Cultural Show"]
      },
      {
        "day": 6,
        "title": "Fond Farewells & Sweet Souvenirs",
        "desc": "Enjoy a final gourmet breakfast. Visit a curated boutique for authentic souvenirs before your private transfer to the departure point.",
        "activities": ["Gourmet Breakfast", "Curated Shopping", "Private Departure Transfer"]
      }
    ]
  }
}

Use realistic India-friendly INR pricing. Domestic 3-4 day trips should usually be ₹10,000-₹22,000 per person, 5-6 day trips ₹18,000-₹38,000, 7-10 day trips ₹32,000-₹58,000. Luxury or wildlife trips can be higher but should generally stay under ₹70,000 unless the destination is clearly international. Ensure the response is exceptionally high-quality, sounds like a premium brochure, and the JSON is perfectly valid. Do NOT wrap it in \`\`\`json or \`\`\` tags.
`;

  let responseText = null;

  // Try OpenAI first if key is available
  if (openaiApiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using GPT-4o-mini for cost-effectiveness and speed
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" } // Enforce JSON
      });
      responseText = response.choices[0].message.content.trim();
      console.log(`[AI Service] Used OpenAI API for ${placeName}`);
    } catch (openaiErr) {
      console.warn(`[AI Service] OpenAI generation failed: ${openaiErr.message}. Falling back...`);
      // Fallback handled below
    }
  }

  // Fallback or primary use of Gemini
  if (!responseText && geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      // Try gemini-2.5-flash first, then gemini-2.5-pro
      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
        console.log(`[AI Service] Used Gemini 2.5 Flash for ${placeName}`);
      } catch (flashErr) {
        console.warn(`[AI Service] Gemini 2.5 Flash failed, trying gemini-2.5-pro...`);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text().trim();
        console.log(`[AI Service] Used Gemini 2.5 Pro for ${placeName}`);
      }
    } catch (geminiErr) {
      console.error(`[AI Service] Gemini generation failed: ${geminiErr.message}`);
    }
  }

  if (!responseText) {
    throw new Error("Failed to generate package content with both OpenAI and Gemini API.");
  }

  try {
    let cleanJson = responseText;
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleanJson);
    const normalizeGeneratedPrice = (value, fallback = 22000) => {
      const numeric = Number(value);
      const price = Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
      return Math.max(8500, Math.min(Math.round(price), 70000));
    };
    if (parsed.destination) {
      parsed.destination.price = normalizeGeneratedPrice(parsed.destination.price, 18000);
    }
    if (parsed.package) {
      parsed.package.price = normalizeGeneratedPrice(parsed.package.price, 22000);
      parsed.package.originalPrice = Math.max(
        parsed.package.price + 2000,
        normalizeGeneratedPrice(parsed.package.originalPrice, Math.round(parsed.package.price * 1.18))
      );
    }
    return parsed;
  } catch (error) {
    console.error("Error parsing generated AI JSON:", error);
    throw new Error("Failed to parse package content with AI");
  }
};

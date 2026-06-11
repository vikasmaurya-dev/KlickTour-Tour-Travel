import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const stripCodeFence = (value = '') =>
  String(value)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

const parseJsonResponse = (responseText) => {
  try {
    return JSON.parse(stripCodeFence(responseText));
  } catch (error) {
    const jsonMatch = String(responseText).match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw error;
    return JSON.parse(jsonMatch[0]);
  }
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeTrip = (rawTrip, fallbackPrompt) => {
  const trip = rawTrip?.trip || rawTrip;
  if (!trip || typeof trip !== 'object') {
    throw new Error('AI response did not include a trip object.');
  }

  const days = ensureArray(trip.days).map((day, index) => ({
    day: Number(day.day || index + 1),
    title: String(day.title || `Day ${index + 1}`).trim(),
    theme: String(day.theme || '').trim(),
    description: String(day.description || day.desc || '').trim(),
    activities: ensureArray(day.activities).map((activity) => {
      if (typeof activity === 'string') {
        return { time: '', title: activity, description: '' };
      }
      return {
        time: String(activity.time || '').trim(),
        title: String(activity.title || activity.name || 'Activity').trim(),
        description: String(activity.description || activity.desc || '').trim(),
      };
    }),
    meals: ensureArray(day.meals).map(String),
    places: ensureArray(day.places).map(String),
  }));

  if (days.length === 0) {
    throw new Error('AI response did not include day-wise itinerary data.');
  }

  return {
    title: String(trip.title || `Custom Trip for ${fallbackPrompt}`).trim(),
    destination: String(trip.destination || trip.location || '').trim(),
    duration: String(trip.duration || '').trim(),
    travelers: String(trip.travelers || '').trim(),
    summary: String(trip.summary || '').trim(),
    heroImage: String(trip.heroImage || '').trim(),
    days,
    hotels: ensureArray(trip.hotels).map((hotel) => ({
      name: String(hotel.name || 'Recommended stay').trim(),
      area: String(hotel.area || hotel.location || '').trim(),
      priceRange: String(hotel.priceRange || hotel.price || '').trim(),
      why: String(hotel.why || hotel.description || '').trim(),
    })),
    activities: ensureArray(trip.activities).map(String),
    bestPlaces: ensureArray(trip.bestPlaces).map(String),
    foodRecommendations: ensureArray(trip.foodRecommendations || trip.food).map(String),
    transportationTips: ensureArray(trip.transportationTips || trip.transport).map(String),
    tips: ensureArray(trip.tips).map(String),
    budget: {
      currency: String(trip.budget?.currency || 'INR').trim(),
      totalEstimate: String(trip.budget?.totalEstimate || trip.budget?.total || '').trim(),
      breakdown: ensureArray(trip.budget?.breakdown).map((item) => ({
        label: String(item.label || item.name || 'Expense').trim(),
        amount: String(item.amount || item.value || '').trim(),
        note: String(item.note || '').trim(),
      })),
    },
  };
};

const buildTripPrompt = (userPrompt) => `
You are KlickTour's senior travel planner. Create a practical, premium, bookable travel itinerary from this request:
"${userPrompt}"

Return ONLY valid JSON. No markdown, no code fences, no commentary.

Rules:
- If the destination is not well known, infer a sensible destination and still create a useful itinerary.
- Keep the plan realistic for the requested days, budget, travelers, and travel style.
- Include India-friendly prices when the query is in India, otherwise use the likely local currency.
- Do not invent unsafe activities. Keep advice family-safe and travel-safe.
- The result must be structured enough for a React result page.

Required JSON shape:
{
  "trip": {
    "title": "short polished itinerary title",
    "destination": "primary destination or region",
    "duration": "e.g. 5 Days / 4 Nights",
    "travelers": "e.g. 2 people",
    "summary": "2 sentence overview",
    "days": [
      {
        "day": 1,
        "title": "Arrival and local orientation",
        "theme": "Arrival",
        "description": "short day overview",
        "activities": [
          { "time": "Morning", "title": "Activity name", "description": "what to do and why" }
        ],
        "meals": ["Breakfast suggestion", "Dinner suggestion"],
        "places": ["Place 1", "Place 2"]
      }
    ],
    "hotels": [
      { "name": "Hotel or stay suggestion", "area": "Area", "priceRange": "Estimated range", "why": "why it fits" }
    ],
    "activities": ["top activity"],
    "bestPlaces": ["place"],
    "foodRecommendations": ["food"],
    "transportationTips": ["tip"],
    "budget": {
      "currency": "INR",
      "totalEstimate": "₹00,000 - ₹00,000",
      "breakdown": [
        { "label": "Hotels", "amount": "₹00,000", "note": "short note" }
      ]
    },
    "tips": ["booking tip"]
  }
}
`;

export const generateAITrip = async (prompt) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey && !geminiApiKey) {
    const error = new Error('AI trip generation is not configured. Add OPENAI_API_KEY or GEMINI_API_KEY.');
    error.status = 503;
    throw error;
  }

  const engineeredPrompt = buildTripPrompt(prompt);
  let responseText = '';
  let provider = '';

  if (openaiApiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_TRIP_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: engineeredPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      });
      responseText = response.choices?.[0]?.message?.content || '';
      provider = 'openai';
    } catch (error) {
      if (!geminiApiKey) {
        error.status = error.status || 502;
        throw error;
      }
      console.warn(`[AI Trip] OpenAI failed, trying Gemini: ${error.message}`);
    }
  }

  if (!responseText && geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_TRIP_MODEL || 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      });
      const result = await model.generateContent(engineeredPrompt);
      responseText = result.response.text();
      provider = 'gemini';
    } catch (error) {
      error.status = error.status || 502;
      throw error;
    }
  }

  const parsed = parseJsonResponse(responseText);
  const trip = normalizeTrip(parsed, prompt);

  return { trip, provider };
};

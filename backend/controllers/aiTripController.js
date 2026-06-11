import jwt from 'jsonwebtoken';
import AITrip from '../models/AITrip.js';
import Destination from '../models/Destination.js';
import User from '../models/User.js';
import { generateAITrip } from '../services/aiTripService.js';
import { getDestinationImages } from '../services/imageService.js';

const fallbackHeroImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85';

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveOptionalUser = async (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('_id');
  } catch {
    return null;
  }
};

const inferDestinationType = (trip) => {
  const haystack = `${trip.destination} ${trip.title} ${trip.summary}`.toLowerCase();
  if (/beach|coast|island|sea|goa|maldives|bali/.test(haystack)) return 'Beach';
  if (/mountain|hill|snow|manali|shimla|leh|ladakh/.test(haystack)) return 'Mountain';
  if (/temple|spiritual|ashram|varanasi|rishikesh/.test(haystack)) return 'Spiritual';
  if (/fort|heritage|palace|history|jaipur|agra/.test(haystack)) return 'Historical';
  if (/wildlife|safari|forest|jungle/.test(haystack)) return 'Wildlife';
  if (/desert|dune|jaisalmer/.test(haystack)) return 'Desert';
  return 'Adventure';
};

const saveGeneratedDestination = async (trip, prompt, images) => {
  const destinationName = trip.destination || trip.title;
  if (!destinationName) return null;

  const existing = await Destination.findOne({
    name: new RegExp(`^${escapeRegExp(destinationName)}$`, 'i'),
  });
  if (existing) return existing;

  const firstDayPlaces = trip.days?.flatMap((day) => day.places || []) || [];
  const destination = await Destination.create({
    name: destinationName,
    location: destinationName,
    type: inferDestinationType(trip),
    budget: /budget|cheap|low/i.test(prompt) ? 'Low' : 'Medium',
    duration: trip.duration || `${trip.days?.length || 3} Days`,
    price: 0,
    tagline: trip.title,
    description: trip.summary || `A curated trip plan for ${destinationName}.`,
    overview: trip.summary || '',
    bestTime: 'Year Round',
    localFood: trip.foodRecommendations || [],
    famousAttractions: trip.bestPlaces?.length ? trip.bestPlaces : firstDayPlaces,
    thingsToDo: trip.activities || [],
    heroImage: images.heroImage,
    images: images.gallery?.length ? [images.heroImage, ...images.gallery] : [images.heroImage],
    gallery: images.gallery || [],
    imagePool: images.imagePool || images.gallery || [],
    imageSource: images.imageSource || 'ai-trip',
    imageUpdatedAt: new Date(),
    itinerary: (trip.days || []).map((day) => ({
      day: day.day,
      title: day.title,
      desc: day.description,
      activities: (day.activities || []).map((activity) => activity.title || activity),
    })),
    hotelsInfo: (trip.hotels || []).map((hotel) => `${hotel.name}${hotel.area ? `, ${hotel.area}` : ''}`),
    isAIGenerated: true,
  });

  return destination;
};

export const generateTrip = async (req, res, next) => {
  try {
    const prompt = String(req.body.prompt || '').trim();

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please describe the trip you want to plan.' });
    }

    if (prompt.length < 8) {
      return res.status(400).json({ success: false, message: 'Please add a little more detail to your trip request.' });
    }

    const user = await resolveOptionalUser(req);
    const { trip, provider } = await generateAITrip(prompt);

    let imageDetails = { heroImage: fallbackHeroImage, gallery: [], imagePool: [], imageSource: 'fallback' };
    try {
      const resolvedImages = await getDestinationImages({
        name: trip.destination || trip.title,
        location: trip.destination || prompt,
        category: inferDestinationType(trip),
        country: '',
      });
      imageDetails = {
        heroImage: resolvedImages.heroImage || fallbackHeroImage,
        gallery: resolvedImages.gallery || [],
        imagePool: resolvedImages.rotationPool || resolvedImages.imagePool || resolvedImages.gallery || [],
        imageSource: resolvedImages.imageSource || 'image-service',
      };
    } catch (error) {
      console.warn(`[AI Trip] Image lookup failed: ${error.message}`);
    }

    const hydratedTrip = {
      ...trip,
      heroImage: trip.heroImage || imageDetails.heroImage,
      imageSource: imageDetails.imageSource,
    };

    const destination = await saveGeneratedDestination(hydratedTrip, prompt, imageDetails);
    const savedTrip = await AITrip.create({
      userId: user?._id || null,
      prompt,
      generatedTrip: hydratedTrip,
      destinationId: destination?._id || null,
    });

    res.status(201).json({
      success: true,
      trip: hydratedTrip,
      id: savedTrip._id,
      provider,
      destinationId: destination?._id || null,
      message: 'Trip generated successfully.',
    });
  } catch (error) {
    if (/rate limit|429|quota/i.test(error.message)) {
      error.status = 429;
      error.message = 'The trip planner is busy right now. Please try again in a minute.';
    } else if (/json|parse|trip object|day-wise/i.test(error.message)) {
      error.status = 502;
      error.message = 'The planner returned an incomplete trip. Please try again.';
    }
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await AITrip.findById(req.params.id).lean();
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    res.json({
      success: true,
      data: {
        id: trip._id,
        prompt: trip.prompt,
        trip: trip.generatedTrip,
        destinationId: trip.destinationId,
        createdAt: trip.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

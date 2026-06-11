import express from 'express';
import {
  searchDynamicDestination,
  getDestinationBySlug
} from '../controllers/dynamicDestinationController.js';

const router = express.Router();

// GET /api/search/place?q=jaipur
router.get('/place', searchDynamicDestination);

// GET /api/search/destination/:slug
router.get('/destination/:slug', getDestinationBySlug);

export default router;

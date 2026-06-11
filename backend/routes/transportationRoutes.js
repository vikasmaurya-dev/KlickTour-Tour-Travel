import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAllTransportation,
  getFeaturedTransportation,
  searchTransportation,
  filterTransportation,
  getCities,
  getTransportationById,
  createTransportation,
  updateTransportation,
  deleteTransportation,
  healTransportationImage
} from '../controllers/transportationController.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedTransportation);
router.get('/search', searchTransportation);
router.get('/cities', getCities);
router.post('/filter', filterTransportation);

router.route('/')
  .get(getAllTransportation)
  .post(protect, adminOnly, createTransportation);

router.route('/:id')
  .get(getTransportationById)
  .put(protect, adminOnly, updateTransportation)
  .delete(protect, adminOnly, deleteTransportation);

router.patch('/:id/heal-image', healTransportationImage);

export default router;

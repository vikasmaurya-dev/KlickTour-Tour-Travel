import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getHotels,
  getFeaturedHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  createHotelBooking,
  healHotelImage
} from '../controllers/hotelController.js';

const router = express.Router();

router.get('/featured', getFeaturedHotels);
router.post('/booking', protect, createHotelBooking);

router.route('/')
  .get(getHotels)
  .post(protect, adminOnly, createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(protect, adminOnly, updateHotel)
  .delete(protect, adminOnly, deleteHotel);

router.patch('/:id/heal-image', healHotelImage);

export default router;

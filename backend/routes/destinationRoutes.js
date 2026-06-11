import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getDestinations,
  getTopDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  healDestinationImage,
  aiSearchDestination
} from '../controllers/destinationController.js';

const router = express.Router();

router.post('/ai-search', aiSearchDestination);
router.get('/', getDestinations);
router.get('/top', getTopDestinations);
router.get('/:id', getDestinationById);
router.post('/', protect, adminOnly, createDestination);
router.put('/:id', protect, adminOnly, updateDestination);
router.delete('/:id', protect, adminOnly, deleteDestination);
router.patch('/:id/heal-image', healDestinationImage);

export default router;

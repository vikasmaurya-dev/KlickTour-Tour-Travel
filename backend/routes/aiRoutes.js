import express from 'express';
import { generateTrip, getTripById } from '../controllers/aiTripController.js';

const router = express.Router();

router.post('/generate-trip', generateTrip);
router.get('/trips/:id', getTripById);

export default router;

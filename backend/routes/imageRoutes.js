import express from 'express';
import { resolveSmartImages } from '../controllers/imageController.js';

const router = express.Router();

router.get('/resolve', resolveSmartImages);
router.post('/resolve', resolveSmartImages);

export default router;

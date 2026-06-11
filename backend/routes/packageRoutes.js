import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  healPackageImage,
  aiSearchPackage
} from '../controllers/packageController.js';

const router = express.Router();

router.route('/')
  .get(getPackages)
  .post(protect, adminOnly, createPackage);

router.get('/search', aiSearchPackage);
router.post('/ai-search', aiSearchPackage); // Keeping old route just in case

router.route('/:id')
  .get(getPackageById)
  .put(protect, adminOnly, updatePackage)
  .delete(protect, adminOnly, deletePackage);

router.patch('/:id/heal-image', healPackageImage);

export default router;

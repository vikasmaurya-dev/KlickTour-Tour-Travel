import express from 'express';
import {
  forgotPassword,
  getMe,
  googleAuth,
  login,
  register,
  resendOtp,
  resetPassword,
  updateProfile,
  verifyLogin,
  verifyRegister,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-register', verifyRegister);
router.post('/google', googleAuth);
router.post('/login', login);
router.post('/verify-login', verifyLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;

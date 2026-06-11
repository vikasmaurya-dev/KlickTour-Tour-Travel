import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import { sendOTP } from '../utils/emailService.js';
import { verifyGoogleCredential } from '../config/googleAuth.js';
import { createLog } from '../utils/logger.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const validateEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));
const getOtpExpiry = () => new Date(Date.now() + 5 * 60 * 1000);
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const buildAuthPayload = (user, message) => ({
  success: true,
  message,
  token: generateToken(user._id),
  user: user.toSafeObject(),
});

const sendAuthResponse = (res, user, message, statusCode = 200) => {
  res.status(statusCode).json(buildAuthPayload(user, message));
};

const getRegisterConflictMessage = (existingUser) => {
  if (existingUser.googleId && !existingUser.password) {
    return 'This email is already registered with Google. Continue with Google or reset your password to enable email login.';
  }

  if (existingUser.googleId) {
    return 'This email already has an account. You can continue with Google or sign in with your password.';
  }

  return 'User already exists with this email.';
};

export const register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password?.trim();

    if (!name || !email || !password) {
      throw createError('Please fill in all fields.');
    }

    if (!validateEmail(email)) {
      throw createError('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(getRegisterConflictMessage(existingUser), 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Otp.deleteMany({ email, purpose: 'register' });


    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose: 'register',
      userData: { name, password: hashedPassword },
      expiresAt: getOtpExpiry(),
    });


    await sendOTP(email, otp, 'register');


    res.status(200).json({
      success: true,
      otpRequired: true,
      email,
      message: 'OTP sent to your email address.',
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Registration failed.',
    });
  }
};

export const verifyRegister = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = `${req.body.otp || ''}`.trim();

    if (!email || !otp) {
      throw createError('Email and OTP are required.');
    }

    const otpRecord = await Otp.findOne({ email, purpose: 'register' });
    if (!otpRecord) {
      throw createError('OTP expired or not found. Please sign up again.');
    }

    const isValidOtp = await otpRecord.matchOtp(otp);
    if (!isValidOtp) {
      throw createError('Invalid OTP. Please try again.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteMany({ email, purpose: 'register' });
      throw createError(getRegisterConflictMessage(existingUser), 409);
    }

    const user = new User({
      name: otpRecord.userData.name,
      email,
      password: otpRecord.userData.password,
      authProvider: 'local',
      isVerified: true,
    });

    user.$skipPasswordHash = true;
    await user.save();

    await Otp.deleteMany({ email, purpose: 'register' });

    await createLog({
      user: user._id,
      action: 'Account Registration',
      category: 'User',
      details: `New account created via local registration: ${user.email}`,
      status: 'success'
    }, req);

    sendAuthResponse(res, user, `Welcome to KlickTour, ${user.name.split(' ')[0]}!`, 201);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Verification failed.',
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const profile = await verifyGoogleCredential(req.body.credential);

    let user = await User.findOne({
      $or: [{ email: profile.email }, { googleId: profile.googleId }],
    });

    if (user && user.googleId && user.googleId !== profile.googleId) {
      throw createError('This email is already linked to a different Google account.', 409);
    }

    if (user) {
      const wasGoogleLinked = Boolean(user.googleId);

      user.googleId = profile.googleId;
      user.name = user.name || profile.name;
      // Only set avatar if user doesn't already have one (e.g. preserved custom avatar)
      if (!user.avatar) {
        user.avatar = profile.avatar;
      }
      user.isVerified = true;

      if (!user.password) {
        user.authProvider = 'google';
      }

      await user.save();

      sendAuthResponse(
        res,
        user,
        wasGoogleLinked ? 'Successfully logged in with Google.' : 'Google account linked successfully.',
      );

      await createLog({
        user: user._id,
        action: 'Google Login',
        category: 'Security',
        details: `User logged in via Google OAuth: ${user.email}`,
        status: 'success'
      }, req);
      return;
    }

    user = await User.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || '',
      googleId: profile.googleId,
      authProvider: 'google',
      isVerified: true,
    });

    sendAuthResponse(res, user, `Welcome to KlickTour, ${user.name.split(' ')[0]}!`, 201);

    await createLog({
      user: user._id,
      action: 'Google Registration',
      category: 'User',
      details: `New account created via Google OAuth: ${user.email}`,
      status: 'success'
    }, req);
  } catch (error) {
    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Google sign-in failed.',
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = `${req.body.password || ''}`;

    if (!email || !password) {
      throw createError('Email and password are required.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('Invalid email or password.', 401);
    }

    if (!user.password) {
      throw createError('This account does not have a password yet. Continue with Google or reset your password to create one.', 400);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw createError('Invalid email or password.', 401);
    }

    if (user.role === 'admin') {
      sendAuthResponse(res, user, `Welcome back, ${user.name.split(' ')[0]}!`);
      
      await createLog({
        user: user._id,
        action: 'Admin Login',
        category: 'Security',
        details: `Administrator logged in: ${user.email}`,
        status: 'success'
      }, req);

      return;
    }

    await Otp.deleteMany({ email, purpose: 'login' });


    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose: 'login',
      expiresAt: getOtpExpiry(),
    });


    await sendOTP(email, otp, 'login');


    res.status(200).json({
      success: true,
      otpRequired: true,
      email,
      message: 'OTP sent to your email address.',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};

export const verifyLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = `${req.body.otp || ''}`.trim();

    if (!email || !otp) {
      throw createError('Email and OTP are required.');
    }

    const otpRecord = await Otp.findOne({ email, purpose: 'login' });
    if (!otpRecord) {
      throw createError('OTP expired. Please log in again.');
    }

    const isValidOtp = await otpRecord.matchOtp(otp);
    if (!isValidOtp) {
      throw createError('Invalid OTP. Please try again.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('User not found.', 404);
    }

    await Otp.deleteMany({ email, purpose: 'login' });

    sendAuthResponse(res, user, `Welcome back, ${user.name.split(' ')[0]}!`);

    await createLog({
      user: user._id,
      action: 'User Login',
      category: 'Security',
      details: `User logged in: ${user.email}`,
      status: 'success'
    }, req);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Verification failed.',
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !validateEmail(email)) {
      throw createError('Please enter a valid email address.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('User not found with this email address.', 404);
    }

    await Otp.deleteMany({ email, purpose: 'reset' });


    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose: 'reset',
      expiresAt: getOtpExpiry(),
    });


    await sendOTP(email, otp, 'reset');


    res.status(200).json({
      success: true,
      otpSent: true,
      email,
      message: user.password
        ? 'OTP sent to your email address.'
        : 'OTP sent to your email address. You can use it to create a local password for this Google account.',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send OTP.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = `${req.body.otp || ''}`.trim();
    const newPassword = `${req.body.newPassword || ''}`.trim();

    if (!email || !otp || !newPassword) {
      throw createError('Email, OTP, and new password are required.');
    }

    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters.');
    }

    const otpRecord = await Otp.findOne({ email, purpose: 'reset' });
    if (!otpRecord) {
      throw createError('OTP expired. Please request a new one.');
    }

    const isValidOtp = await otpRecord.matchOtp(otp);
    if (!isValidOtp) {
      throw createError('Invalid OTP. Please try again.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('User not found.', 404);
    }

    user.password = newPassword;
    user.isVerified = true;
    await user.save();

    await createLog({
      user: user._id,
      action: 'Password Reset',
      category: 'Security',
      details: 'User successfully reset their password via OTP',
      status: 'success'
    }, req);

    await Otp.deleteMany({ email, purpose: 'reset' });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Password reset failed.',
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const purpose = `${req.body.purpose || ''}`.trim();

    if (!['register', 'login', 'reset'].includes(purpose)) {
      throw createError('Invalid OTP purpose.');
    }

    if (purpose === 'register') {
      const existingRegisterOtp = await Otp.findOne({ email, purpose: 'register' });
      if (!existingRegisterOtp) {
        throw createError('No pending registration found. Please sign up again.');
      }

      const otp = generateOtp();
      existingRegisterOtp.otp = otp;
      existingRegisterOtp.expiresAt = getOtpExpiry();
      console.log(`[Resend OTP] Resending ${purpose} OTP to ${email}`);
      await existingRegisterOtp.save();
      await sendOTP(email, otp, purpose);
      console.log(`[Resend OTP] OTP resent successfully to ${email}`);

      res.status(200).json({
        success: true,
        message: 'OTP resent to your email address.',
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('User not found.', 404);
    }

    await Otp.deleteMany({ email, purpose });

    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose,
      expiresAt: getOtpExpiry(),
    });

    await sendOTP(email, otp, purpose);

    res.status(200).json({
      success: true,
      message: 'OTP resent to your email address.',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to resend OTP.',
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError('User not found.', 404);
    }

    if (req.body.name !== undefined) {
      const nextName = req.body.name.trim();
      if (!nextName) {
        throw createError('Name cannot be empty.');
      }
      user.name = nextName;
    }

    if (req.body.phone !== undefined) {
      user.phone = `${req.body.phone}`.trim();
    }

    if (req.body.avatar !== undefined) {
      const avatar = req.body.avatar.trim();

      if (avatar === '') {
        // Allow clearing the avatar
        user.avatar = '';
      } else if (avatar.startsWith('data:image/')) {
        // Validate base64 image — match frontend 5MB limit
        const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
        const sizeInBytes = Math.ceil((avatar.length * 3) / 4);

        if (sizeInBytes > MAX_AVATAR_BYTES) {
          throw createError('Avatar image must be under 2 MB.');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const mimeMatch = avatar.match(/^data:(image\/\w+);base64,/);

        if (!mimeMatch || !allowedTypes.includes(mimeMatch[1])) {
          throw createError('Only JPEG, PNG, GIF, and WebP images are allowed.');
        }

        user.avatar = avatar;
      } else if (avatar.startsWith('http')) {
        // Allow external URLs (e.g. Google profile picture)
        user.avatar = avatar;
      }
    }

    if (req.body.password) {
      const nextPassword = `${req.body.password}`.trim();
      if (nextPassword.length < 6) {
        throw createError('Password must be at least 6 characters.');
      }
      user.password = nextPassword;
    }

    const updatedUser = await user.save();
    
    await createLog({
      user: user._id,
      action: 'Profile Update',
      category: 'User',
      details: 'User updated their profile information',
      status: 'success'
    }, req);

    sendAuthResponse(res, updatedUser, 'Profile updated successfully.');
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { mongoSanitizeCustom } from './middleware/mongoSanitizeCustom.js';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

console.log('CORS Allowed Origins:', allowedOrigins);

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
// ─── Mongo Sanitize (Security) ────────────────────────────────
app.use(mongoSanitizeCustom);

// ─── Rate Limiting ────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/packages', apiLimiter);
app.use('/api/transportation/search', apiLimiter);
app.use('/api/search', apiLimiter);
app.use('/api/ai', apiLimiter);

// ─── MongoDB Connection ───────────────────────────────────────
connectDB();

import { initCronJobs } from './utils/cronJobs.js';
// ─── Initialize Cron Jobs ─────────────────────────────────────
initCronJobs();

// ─── Health Check Route ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Tour & Travel API is running 🚀',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ─── Import Routes ────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import transportationRoutes from './routes/transportationRoutes.js';
import dynamicDestinationRoutes from './routes/dynamicDestinationRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transportation', transportationRoutes);
app.use('/api/search', dynamicDestinationRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/ai', aiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

import { createLog } from './utils/logger.js';

// ─── Global Error Handler ─────────────────────────────────────
app.use(async (err, req, res, next) => {
  console.error('[Global Error Guard]', err.stack);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const msgs = Object.values(err.errors).map(e => e.message);
    message = msgs.join(', ');
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  // Log the error using the audit system
  try {
    await createLog({
      user: req.user ? req.user._id : null,
      action: 'System Error',
      category: 'Security',
      details: `Error: ${message} - Path: ${req.originalUrl}`,
      status: 'failure'
    }, req);
  } catch (logErr) {
    console.error('[Logger Error]', logErr.message);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
});


// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍  Server running on http://localhost:${PORT}`);
});

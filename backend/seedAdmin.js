import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@wanderlust.com' });
    if (existing) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@wanderlust.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('🔑  Admin user created successfully!');
    console.log('    Email: admin@wanderlust.com');
    console.log('    Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌  Failed:', err.message);
    process.exit(1);
  }
};

createAdmin();

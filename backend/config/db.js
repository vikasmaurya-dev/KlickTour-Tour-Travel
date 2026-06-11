import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'tour-website';

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    const conn = await mongoose.connect(mongoUri, { dbName });
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;

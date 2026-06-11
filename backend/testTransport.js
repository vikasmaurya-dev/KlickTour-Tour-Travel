import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transportation from './models/Transportation.js';
import connectDB from './config/db.js';

dotenv.config();

const test = async () => {
  await connectDB();
  try {
    const items = await Transportation.find().lean();
    console.log(items.length, "items found in total");
    console.log("First item:", items[0]);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
};

test();

test();

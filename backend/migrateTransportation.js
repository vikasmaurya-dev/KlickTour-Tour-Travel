import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transportation from './models/Transportation.js';
import connectDB from './config/db.js';

dotenv.config();

const migrate = async () => {
  await connectDB();
  
  try {
    // Step 1: Backfill type/providerName on records that are missing them
    const missingType = await Transportation.find({ type: { $exists: false } }).lean();
    console.log(`📋 Found ${missingType.length} records missing 'type' field`);
    
    for (const doc of missingType) {
      await Transportation.updateOne(
        { _id: doc._id },
        { $set: { type: doc.mode, providerName: doc.operator } }
      );
    }
    console.log(`✅ Backfilled ${missingType.length} records with type/providerName`);

    // Step 2: Also fix records that have type but it's null/empty
    const nullType = await Transportation.find({ 
      $or: [{ type: null }, { type: '' }, { providerName: null }, { providerName: '' }] 
    }).lean();
    console.log(`📋 Found ${nullType.length} records with null/empty type or providerName`);
    
    for (const doc of nullType) {
      await Transportation.updateOne(
        { _id: doc._id },
        { $set: { type: doc.type || doc.mode, providerName: doc.providerName || doc.operator } }
      );
    }

    // Step 3: Remove duplicates - keep the one with type/providerName populated
    const allDocs = await Transportation.find().lean();
    console.log(`📋 Total records before dedup: ${allDocs.length}`);
    
    // Group by operator+from+to+departureTime+mode
    const groups = {};
    for (const doc of allDocs) {
      const key = `${doc.operator}|${doc.from}|${doc.to}|${doc.departureTime}|${doc.mode}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    }
    
    let removedCount = 0;
    for (const [key, docs] of Object.entries(groups)) {
      if (docs.length > 1) {
        // Keep the one with type populated, remove others
        const toKeep = docs.find(d => d.type) || docs[0];
        const toRemove = docs.filter(d => d._id.toString() !== toKeep._id.toString());
        for (const doc of toRemove) {
          await Transportation.deleteOne({ _id: doc._id });
          removedCount++;
        }
      }
    }
    console.log(`🗑️  Removed ${removedCount} duplicate records`);
    
    // Step 4: Final count
    const finalCount = await Transportation.countDocuments();
    console.log(`✅ Final record count: ${finalCount}`);
    
    // Step 5: Verify a sample
    const sample = await Transportation.findOne({ type: 'Flight' }).lean();
    if (sample) {
      console.log(`\n🔍 Sample Flight record:`);
      console.log(`   type: ${sample.type}, mode: ${sample.mode}`);
      console.log(`   providerName: ${sample.providerName}, operator: ${sample.operator}`);
      console.log(`   Route: ${sample.from} → ${sample.to}`);
    } else {
      console.log('⚠️  No Flight records found after migration!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();

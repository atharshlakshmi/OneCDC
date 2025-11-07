require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function verifyReportsCollection() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);

    const db = mongoose.connection.db;

    // Check if reports collection exists
    const collections = await db.listCollections({ name: 'reports' }).toArray();

    if (collections.length === 0) {
      console.log('\n📝 Creating reports collection...');
      await db.createCollection('reports');
      console.log('✅ Reports collection created');

      // Create indexes
      console.log('\n🔨 Creating indexes...');
      const reportsCollection = db.collection('reports');

      await reportsCollection.createIndex({ reporter: 1 });
      console.log('  ✓ Index: { reporter: 1 }');

      await reportsCollection.createIndex({ targetType: 1, targetId: 1 });
      console.log('  ✓ Index: { targetType: 1, targetId: 1 }');

      await reportsCollection.createIndex({ status: 1 });
      console.log('  ✓ Index: { status: 1 }');

      await reportsCollection.createIndex({ timestamp: -1 });
      console.log('  ✓ Index: { timestamp: -1 }');

      await reportsCollection.createIndex({ reviewedBy: 1 });
      console.log('  ✓ Index: { reviewedBy: 1 }');

      console.log('✅ All indexes created');
    } else {
      console.log('\n✅ Reports collection already exists');
    }

    // Verify the collection
    console.log('\n🔍 Verifying collection...');
    const reportsCollection = db.collection('reports');
    const indexes = await reportsCollection.indexes();
    console.log('📋 Indexes:', JSON.stringify(indexes, null, 2));

    // Count existing reports
    const count = await reportsCollection.countDocuments();
    console.log(`\n📊 Current reports count: ${count}`);

    console.log('\n🎉 Reports collection is ready!');
    console.log('✅ The collection can now accept report submissions');

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyReportsCollection();

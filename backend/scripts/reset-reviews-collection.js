require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function resetReviewsCollection() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);

    const db = mongoose.connection.db;

    // Check if reviews collection exists
    const collections = await db.listCollections({ name: 'reviews' }).toArray();

    if (collections.length > 0) {
      console.log('\n🗑️  Dropping existing reviews collection...');
      await db.dropCollection('reviews');
      console.log('✅ Reviews collection dropped successfully');
    } else {
      console.log('\n⚠️  Reviews collection does not exist');
    }

    // Create new reviews collection with no validators
    console.log('\n📝 Creating new reviews collection...');
    await db.createCollection('reviews', {
      validator: {},
      validationLevel: 'off',
      validationAction: 'warn'
    });
    console.log('✅ Reviews collection created');

    // Create indexes based on Review model
    console.log('\n🔨 Creating indexes...');
    const reviewsCollection = db.collection('reviews');

    // Individual indexes
    await reviewsCollection.createIndex({ item: 1, isActive: 1 });
    console.log('  ✓ Index: { item: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ shopper: 1, isActive: 1 });
    console.log('  ✓ Index: { shopper: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ catalogue: 1, isActive: 1 });
    console.log('  ✓ Index: { catalogue: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ shop: 1, isActive: 1 });
    console.log('  ✓ Index: { shop: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ availability: 1 });
    console.log('  ✓ Index: { availability: 1 }');

    await reviewsCollection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index: { createdAt: -1 }');

    // Unique compound index
    await reviewsCollection.createIndex({ item: 1, shopper: 1 }, { unique: true });
    console.log('  ✓ Index: { item: 1, shopper: 1 } (unique)');

    console.log('✅ All indexes created successfully');

    // Verify the collection
    console.log('\n🔍 Verifying collection...');
    const collectionInfo = await db.listCollections({ name: 'reviews' }).toArray();
    console.log('Collection info:', JSON.stringify(collectionInfo[0], null, 2));

    // Check for validators
    const collStats = await db.command({ collStats: 'reviews' });
    if (collStats.options && collStats.options.validator) {
      console.log('\n⚠️  WARNING: Validator still present:', collStats.options.validator);
    } else {
      console.log('\n✅ No validator present - collection is ready');
    }

    // List all indexes
    const indexes = await reviewsCollection.indexes();
    console.log('\n📋 Indexes:', JSON.stringify(indexes, null, 2));

    console.log('\n🎉 Reviews collection reset complete!');
    console.log('✅ The collection is now ready to accept reviews from the application');

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetReviewsCollection();

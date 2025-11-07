require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function resetReviewsClean() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop the collection if it exists
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    if (collections.length > 0) {
      console.log('\nDropping existing reviews collection...');
      await db.dropCollection('reviews');
      console.log('✓ Dropped reviews collection');
    }

    // Create collection with validation explicitly OFF
    console.log('\nCreating clean reviews collection...');
    await db.createCollection('reviews', {
      validator: {},
      validationLevel: 'off',
      validationAction: 'warn'
    });
    console.log('✓ Created reviews collection with validation OFF');

    // Create indexes
    const reviewsCollection = db.collection('reviews');

    console.log('\nCreating indexes...');
    await reviewsCollection.createIndex({ item: 1, isActive: 1 });
    await reviewsCollection.createIndex({ shopper: 1, isActive: 1 });
    await reviewsCollection.createIndex({ catalogue: 1, isActive: 1 });
    await reviewsCollection.createIndex({ shop: 1, isActive: 1 });
    await reviewsCollection.createIndex({ availability: 1 });
    await reviewsCollection.createIndex({ createdAt: -1 });
    await reviewsCollection.createIndex({ item: 1, shopper: 1 }, { unique: true });
    console.log('✓ All indexes created');

    // Verify setup
    const verifyInfo = await db.listCollections({ name: 'reviews' }).toArray();
    console.log('\n=== Verification ===');
    console.log('Collection exists:', verifyInfo.length > 0);
    console.log('Validation level:', verifyInfo[0].options?.validationLevel || 'Not set');
    console.log('Has validator:', verifyInfo[0].options?.validator ? 'Yes' : 'No');

    console.log('\n✓ Reviews collection is completely clean and ready to use');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetReviewsClean();

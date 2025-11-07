require('dotenv').config();
const mongoose = require('mongoose');

// Use the environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function initReviewsCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if reviews collection already exists
    const collections = await db.listCollections({ name: 'reviews' }).toArray();

    if (collections.length > 0) {
      console.log('Reviews collection already exists');
    } else {
      console.log('Creating reviews collection...');
      await db.createCollection('reviews');
      console.log('✓ Created reviews collection');
    }

    const reviewsCollection = db.collection('reviews');

    // Create indexes matching the Review schema
    console.log('\nCreating indexes...');

    // Single field indexes
    await reviewsCollection.createIndex({ item: 1, isActive: 1 });
    console.log('✓ Created index: { item: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ shopper: 1, isActive: 1 });
    console.log('✓ Created index: { shopper: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ catalogue: 1, isActive: 1 });
    console.log('✓ Created index: { catalogue: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ shop: 1, isActive: 1 });
    console.log('✓ Created index: { shop: 1, isActive: 1 }');

    await reviewsCollection.createIndex({ availability: 1 });
    console.log('✓ Created index: { availability: 1 }');

    await reviewsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Created index: { createdAt: -1 }');

    // Unique compound index for one review per item per shopper
    await reviewsCollection.createIndex({ item: 1, shopper: 1 }, { unique: true });
    console.log('✓ Created unique index: { item: 1, shopper: 1 }');

    console.log('\n✓ Reviews collection initialized successfully');
    console.log('✓ All indexes created');

    await mongoose.disconnect();
    console.log('✓ Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initReviewsCollection();

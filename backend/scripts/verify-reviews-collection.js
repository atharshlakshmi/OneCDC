require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function verifyReviewsCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check if reviews collection exists
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    console.log('Reviews collection exists:', collections.length > 0);

    if (collections.length > 0) {
      const collectionInfo = collections[0];
      console.log('\nCollection info:');
      console.log('  Name:', collectionInfo.name);
      console.log('  Has validator:', collectionInfo.options && collectionInfo.options.validator ? 'Yes' : 'No');

      // Get indexes
      const reviewsCollection = db.collection('reviews');
      const indexes = await reviewsCollection.indexes();
      console.log('\nIndexes created:');
      indexes.forEach(idx => {
        const unique = idx.unique ? ' (unique)' : '';
        console.log('  -', JSON.stringify(idx.key), unique);
      });

      console.log('\n✓ Reviews collection is ready to use');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyReviewsCollection();

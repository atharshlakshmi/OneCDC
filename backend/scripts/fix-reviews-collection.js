require('dotenv').config();
const mongoose = require('mongoose');

// Use the environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function fixReviewsCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if reviews collection exists
    const collections = await db.listCollections({ name: 'reviews' }).toArray();

    if (collections.length > 0) {
      console.log('Found reviews collection, dropping it...');
      await db.dropCollection('reviews');
      console.log('✓ Dropped reviews collection');
    } else {
      console.log('✓ Reviews collection does not exist');
    }

    // Create the collection without any validator
    console.log('Creating new reviews collection without validator...');
    await db.createCollection('reviews', {
      validator: null
    });
    console.log('✓ Created reviews collection');

    await mongoose.disconnect();
    console.log('✓ Done - Reviews collection has been fixed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixReviewsCollection();

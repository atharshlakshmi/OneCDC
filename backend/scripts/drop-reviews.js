require('dotenv').config();
const mongoose = require('mongoose');

// Use the environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function dropReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'reviews' }).toArray();

    if (collections.length > 0) {
      await db.dropCollection('reviews');
      console.log('✓ Dropped reviews collection');
    } else {
      console.log('✓ Reviews collection does not exist');
    }

    await mongoose.disconnect();
    console.log('✓ Done - Reviews collection has been reset');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropReviews();

require('dotenv').config();
const mongoose = require('mongoose');

// Use the environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function removeValidator() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop the reviews collection completely
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    if (collections.length > 0) {
      console.log('Dropping reviews collection...');
      await db.dropCollection('reviews');
      console.log('✓ Dropped reviews collection');
    }

    // Do NOT create a new collection - let Mongoose create it
    console.log('✓ Collection will be recreated by Mongoose without validator');

    await mongoose.disconnect();
    console.log('✓ Done - Please restart your backend server');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeValidator();

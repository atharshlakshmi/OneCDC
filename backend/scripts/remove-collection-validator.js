require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function removeCollectionValidator() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check current validator
    const collectionInfo = await db.listCollections({ name: 'reviews' }).toArray();
    if (collectionInfo.length > 0) {
      console.log('\nCurrent validator:', JSON.stringify(collectionInfo[0].options?.validator, null, 2));
    }

    // Use collMod to completely remove validator
    console.log('\nRemoving validator...');
    await db.command({
      collMod: 'reviews',
      validator: {},
      validationLevel: 'off'
    });
    console.log('✓ Validator removed');

    // Verify it's gone
    const updatedInfo = await db.listCollections({ name: 'reviews' }).toArray();
    console.log('\nUpdated validator:', updatedInfo[0].options?.validator || 'None');
    console.log('Validation level:', updatedInfo[0].options?.validationLevel || 'Not set');

    console.log('\n✓ Reviews collection validator has been completely removed');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeCollectionValidator();

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function fixReportsValidation() {
  try {
    console.log('🔧 Fixing Reports Collection Validation...\n');

    console.log('1️⃣ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}\n`);

    const db = mongoose.connection.db;

    // Check current collection validator
    console.log('2️⃣ Checking current validator...');
    const collections = await db.listCollections({ name: 'reports' }).toArray();

    if (collections.length === 0) {
      console.log('❌ Reports collection does not exist');
      await mongoose.disconnect();
      process.exit(1);
    }

    const collectionInfo = collections[0];
    console.log('Collection info:', JSON.stringify(collectionInfo, null, 2));

    if (collectionInfo.options && collectionInfo.options.validator) {
      console.log('\n⚠️  Current validator found:');
      console.log(JSON.stringify(collectionInfo.options.validator, null, 2));
    } else {
      console.log('\n✅ No validator currently set');
    }

    // Remove validator
    console.log('\n3️⃣ Removing validator...');
    await db.command({
      collMod: 'reports',
      validator: {},
      validationLevel: 'off'
    });

    console.log('✅ Validator removed successfully');

    // Verify the validator was removed
    console.log('\n4️⃣ Verifying validator removal...');
    const updatedCollections = await db.listCollections({ name: 'reports' }).toArray();
    const updatedCollectionInfo = updatedCollections[0];

    if (updatedCollectionInfo.options && updatedCollectionInfo.options.validator && Object.keys(updatedCollectionInfo.options.validator).length > 0) {
      console.log('⚠️  WARNING: Validator still present:', updatedCollectionInfo.options.validator);
    } else {
      console.log('✅ Validator successfully removed - collection is now ready');
    }

    console.log('\n5️⃣ Checking indexes...');
    const reportsCollection = db.collection('reports');
    const indexes = await reportsCollection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`  ${i + 1}. ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

    console.log('\n🎉 Reports collection is now ready to accept reports!');

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixReportsValidation();

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function thoroughDiagnostic() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;

    console.log('\n=== STEP 1: Check Collection Exists ===');
    const collections = await db.listCollections({ name: 'reviews' }).toArray();
    console.log('Reviews collection exists:', collections.length > 0);

    if (collections.length === 0) {
      console.log('Collection does not exist - this is the problem!');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('\n=== STEP 2: Full Collection Info ===');
    const collInfo = collections[0];
    console.log('Full collection info:', JSON.stringify(collInfo, null, 2));

    console.log('\n=== STEP 3: Get Collection Options ===');
    const reviewsCollection = db.collection('reviews');
    const collStats = await db.command({ collStats: 'reviews' });
    console.log('Collection stats:', JSON.stringify(collStats.options || {}, null, 2));

    console.log('\n=== STEP 4: Try to Insert Test Document ===');
    const testDoc = {
      shopper: new mongoose.Types.ObjectId('69099e6e93b69dab5cfe5536'),
      item: 'TEST_ITEM_' + Date.now(),
      catalogue: new mongoose.Types.ObjectId('69027d4c579b2b73915253eb'),
      shop: new mongoose.Types.ObjectId('69027d4b579b2b73915252c6'),
      description: 'Test review',
      images: [],
      availability: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Attempting to insert test document...');
    try {
      const result = await reviewsCollection.insertOne(testDoc);
      console.log('✓ Insert succeeded! Document ID:', result.insertedId);

      // Clean up test document
      await reviewsCollection.deleteOne({ _id: result.insertedId });
      console.log('✓ Test document cleaned up');
    } catch (insertError) {
      console.log('✗ Insert FAILED with error:');
      console.log('Error:', insertError.message);
      console.log('Error details:', JSON.stringify(insertError.errInfo || {}, null, 2));
    }

    console.log('\n=== STEP 5: Check Validator via collMod ===');
    try {
      const modResult = await db.command({
        collMod: 'reviews',
        validator: {},
        validationLevel: 'off'
      });
      console.log('collMod result:', modResult);
    } catch (modError) {
      console.log('collMod error:', modError.message);
    }

    console.log('\n=== STEP 6: List All Collections ===');
    const allCollections = await db.listCollections().toArray();
    console.log('All collections in database:');
    allCollections.forEach(col => {
      console.log(`  - ${col.name}`, col.options?.validator ? '(has validator)' : '(no validator)');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Diagnostic error:', error);
    process.exit(1);
  }
}

thoroughDiagnostic();

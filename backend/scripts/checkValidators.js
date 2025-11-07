const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

async function checkValidators() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check Item collection
    const itemCollectionInfo = await db.listCollections({ name: 'items' }).toArray();
    if (itemCollectionInfo.length > 0) {
      console.log('\n=== Item Collection Info ===');
      console.log(JSON.stringify(itemCollectionInfo[0], null, 2));
    }

    // Check Catalogue collection
    const catalogueCollectionInfo = await db.listCollections({ name: 'catalogues' }).toArray();
    if (catalogueCollectionInfo.length > 0) {
      console.log('\n=== Catalogue Collection Info ===');
      console.log(JSON.stringify(catalogueCollectionInfo[0], null, 2));
    }

    // Get validation rules if they exist
    const itemCollection = db.collection('items');
    const itemStats = await itemCollection.stats();
    console.log('\n=== Item Collection Stats ===');
    console.log('Validator:', itemStats.validator || 'None');

    const catalogueCollection = db.collection('catalogues');
    const catalogueStats = await catalogueCollection.stats();
    console.log('\n=== Catalogue Collection Stats ===');
    console.log('Validator:', catalogueStats.validator || 'None');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkValidators();

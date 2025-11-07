require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';
console.log('Connecting to:', MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');

async function seedReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get existing data to reference
    console.log('\nFetching existing data...');

    const users = await db.collection('users').find({ userType: 'RegisteredShopper' }).limit(5).toArray();
    console.log(`Found ${users.length} shoppers`);

    const catalogues = await db.collection('catalogues').find({}).limit(3).toArray();
    console.log(`Found ${catalogues.length} catalogues`);

    if (users.length === 0 || catalogues.length === 0) {
      console.log('❌ Need at least 1 shopper and 1 catalogue to seed reviews');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Collect items from catalogues
    const itemsData = [];
    for (const catalogue of catalogues) {
      if (catalogue.items && catalogue.items.length > 0) {
        for (const item of catalogue.items.slice(0, 3)) { // Take first 3 items from each catalogue
          itemsData.push({
            itemName: item.name,
            catalogueId: catalogue._id,
            shopId: catalogue.shop
          });
        }
      }
    }

    console.log(`Found ${itemsData.length} items to review`);

    if (itemsData.length === 0) {
      console.log('❌ No items found in catalogues');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Sample review descriptions
    const positiveReviews = [
      'Great product! Fresh and good quality.',
      'Found it easily, item was available and looked fresh.',
      'Excellent! Will definitely buy again.',
      'Good value for money. Item was well stocked.',
      'Very satisfied with the quality and availability.',
      'Fresh stock, exactly what I was looking for.',
      'Highly recommend! Product met my expectations.',
      'Available as advertised, good condition.'
    ];

    const negativeReviews = [
      'Item was out of stock when I visited.',
      'Could not find this item in the store.',
      'Listed as available but was not in stock.',
      'Went specifically for this but it was unavailable.',
      'Not available despite being on the catalogue.',
      'Store ran out of stock recently.',
      'Called ahead but still out of stock when I arrived.'
    ];

    // Create sample reviews
    const reviewsCollection = db.collection('reviews');
    const reviews = [];
    let reviewCount = 0;

    console.log('\nCreating sample reviews...');

    // Create reviews - mix of available and unavailable
    for (let i = 0; i < Math.min(itemsData.length, 15); i++) {
      const item = itemsData[i];
      const shopper = users[i % users.length];
      const isAvailable = Math.random() > 0.3; // 70% available, 30% unavailable

      const review = {
        shopper: shopper._id,
        item: item.itemName,
        catalogue: item.catalogueId,
        shop: item.shopId,
        description: isAvailable
          ? positiveReviews[Math.floor(Math.random() * positiveReviews.length)]
          : negativeReviews[Math.floor(Math.random() * negativeReviews.length)],
        availability: isAvailable,
        images: [], // No images for seeded data
        warnings: 0,
        isActive: true,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        updatedAt: new Date()
      };

      reviews.push(review);
    }

    // Insert reviews (handle duplicates)
    for (const review of reviews) {
      try {
        await reviewsCollection.insertOne(review);
        reviewCount++;
        console.log(`✓ Added review for "${review.item}" (${review.availability ? 'Available' : 'Unavailable'})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`  Skipped duplicate review for "${review.item}"`);
        } else {
          console.log(`  Error adding review for "${review.item}":`, error.message);
        }
      }
    }

    console.log(`\n✓ Successfully seeded ${reviewCount} reviews`);

    // Show summary
    const availableCount = await reviewsCollection.countDocuments({ availability: true, isActive: true });
    const unavailableCount = await reviewsCollection.countDocuments({ availability: false, isActive: true });

    console.log('\n=== Review Summary ===');
    console.log(`Total reviews: ${reviewCount}`);
    console.log(`Available items: ${availableCount}`);
    console.log(`Unavailable items: ${unavailableCount}`);

    await mongoose.disconnect();
    console.log('\n✓ Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedReviews();

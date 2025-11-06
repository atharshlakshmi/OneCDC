// Check MongoDB validation rules on catalogues collection
require("dotenv").config();
const mongoose = require("mongoose");

async function checkValidation() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get collection info
    const collections = await mongoose.connection.db.listCollections({ name: "catalogues" }).toArray();

    if (collections.length > 0) {
      console.log("📋 Catalogues collection info:");
      console.log(JSON.stringify(collections[0], null, 2));

      // Check if there's a validator
      if (collections[0].options && collections[0].options.validator) {
        console.log("\n⚠️  Found validator rules:");
        console.log(JSON.stringify(collections[0].options.validator, null, 2));
      } else {
        console.log("\n✅ No custom validator found on catalogues collection");
      }
    } else {
      console.log("❌ Catalogues collection does not exist yet");
    }

    // Try to manually create a test catalogue
    console.log("\n🧪 Testing catalogue creation...");
    const testShopId = new mongoose.Types.ObjectId();

    try {
      const testCatalogue = await mongoose.connection.db.collection("catalogues").insertOne({
        shop: testShopId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Test catalogue created successfully:", testCatalogue.insertedId);

      // Clean up test
      await mongoose.connection.db.collection("catalogues").deleteOne({ _id: testCatalogue.insertedId });
      console.log("✅ Test catalogue cleaned up");
    } catch (testError) {
      console.error("❌ Test catalogue creation failed:", testError.message);
      console.error("Error details:", testError);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkValidation();

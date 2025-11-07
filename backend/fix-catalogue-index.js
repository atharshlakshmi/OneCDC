// Drop the problematic unique index on items field
require("dotenv").config();
const mongoose = require("mongoose");

async function fixCatalogueIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all indexes on catalogues collection
    const indexes = await mongoose.connection.db.collection("catalogues").indexes();
    console.log("📋 Current indexes on catalogues collection:");
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop the problematic items_1 index
    try {
      await mongoose.connection.db.collection("catalogues").dropIndex("items_1");
      console.log("\n✅ Dropped items_1 unique index successfully!");
    } catch (error) {
      if (error.codeName === "IndexNotFound") {
        console.log("\n✅ Index items_1 does not exist (already dropped or never created)");
      } else {
        throw error;
      }
    }

    // Verify indexes after drop
    const indexesAfter = await mongoose.connection.db.collection("catalogues").indexes();
    console.log("\n📋 Indexes after drop:");
    indexesAfter.forEach((idx) => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    await mongoose.connection.close();
    console.log("\n✅ Done! You can now create multiple shops.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixCatalogueIndex();

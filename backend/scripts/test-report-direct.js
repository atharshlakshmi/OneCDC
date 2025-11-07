require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function testReportDirect() {
  try {
    console.log('🔍 Testing Report Creation Directly...\n');

    console.log('1️⃣ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // Find an existing user
    console.log('2️⃣ Finding an existing user...');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ role: 'registered_shopper' });

    if (!user) {
      console.log('❌ No registered shopper found in database');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user._id})\n`);

    // Find an existing shop
    console.log('3️⃣ Finding an existing shop...');
    const shopsCollection = db.collection('shops');
    const shop = await shopsCollection.findOne();

    if (!shop) {
      console.log('❌ No shop found in database');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found shop: ${shop.name} (${shop._id})\n`);

    // Try to create a report
    console.log('4️⃣ Creating shop report...');
    const reportsCollection = db.collection('reports');

    try {
      const reportData = {
        reporter: user._id,
        targetType: 'shop',
        targetId: shop._id,
        category: 'spam',
        description: 'Test report created directly',
        status: 'pending',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Report data:', JSON.stringify(reportData, null, 2));

      const result = await reportsCollection.insertOne(reportData);

      console.log('✅ Report created successfully!');
      console.log('Report ID:', result.insertedId);

      // Verify it was created
      const createdReport = await reportsCollection.findOne({ _id: result.insertedId });
      console.log('\n📋 Created report:');
      console.log(JSON.stringify(createdReport, null, 2));

      // Clean up - delete the test report
      await reportsCollection.deleteOne({ _id: result.insertedId });
      console.log('\n🧹 Test report cleaned up');

    } catch (error) {
      console.error('❌ Error creating report:', error.message);
      console.error('Full error:', error);
    }

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testReportDirect();

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

async function seedAdminUser() {
  try {
    console.log('🌱 Seeding Admin User...\n');

    console.log('1️⃣ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}\n`);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Admin user details
    const adminEmail = 'admin@onecdc.com';
    const adminPassword = 'Admin123'; // Change this to your desired password

    // Check if admin already exists
    console.log('2️⃣ Checking if admin user already exists...');
    const existingAdmin = await usersCollection.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      console.log('\nℹ️  If you want to create a new admin, delete the existing one first or change the email in the script.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('✅ No existing admin user found\n');

    // Hash the password
    console.log('3️⃣ Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    console.log('✅ Password hashed\n');

    // Create admin user
    console.log('4️⃣ Creating admin user...');
    const adminUser = {
      email: adminEmail,
      passwordHash: passwordHash,
      authProvider: 'local',
      role: 'admin',
      name: 'Admin User',
      phone: '',
      gender: '',
      address: '',
      avatarUrl: '',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      warnings: [],
      singpassVerified: false,
      corppassVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created successfully!\n');

    // Display admin details
    console.log('📋 Admin User Details:');
    console.log('═══════════════════════════════════════');
    console.log('ID:', result.insertedId);
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:', 'admin');
    console.log('Name:', 'Admin User');
    console.log('Email Verified:', true);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Admin user seeded successfully!');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('💡 You can now login with these credentials:\n');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdminUser();

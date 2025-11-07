import 'dotenv/config';
import connect from './connect';
import logger from './logger';
import { Shop, ModerationLog, Owner } from '../models';
import mongoose from 'mongoose';

/**
 * Script to flag a store with warnings for testing
 */
const flagStore = async () => {
  try {
    await connect();

    logger.info('Starting store flagging...');

    // Find the store by name (case-insensitive)
    // You can change this to any store name you want to flag
    const storeName = 'grocery'; // Will match "Grocery Shop 1" or any store with "grocery" in the name
    const store = await Shop.findOne({
      name: { $regex: new RegExp(storeName, 'i') }
    });

    if (!store) {
      logger.error(`Store with name containing "${storeName}" not found`);
      logger.info('Available stores:');
      const allStores = await Shop.find().limit(10);
      allStores.forEach(s => logger.info(`  - ${s.name}`));
      process.exit(1);
    }

    logger.info(`Found store: ${store.name} (${store._id})`);

    // Find the owner
    const owner = await Owner.findById(store.owner);
    if (!owner) {
      logger.error(`Owner not found for store`);
      process.exit(1);
    }

    logger.info(`Owner: ${owner.name} (${owner.email})`);

    // Create a mock admin (or use existing admin)
    // For testing, we'll just use a dummy ObjectId for admin
    const mockAdminId = new mongoose.Types.ObjectId();

    // Warning 1: Offensive Name
    const warning1 = await ModerationLog.create({
      admin: mockAdminId,
      action: 'warn_shop',
      targetType: 'shop',
      targetId: store._id,
      reason: 'Offensive store name',
      details: `The store name "${store.name}" has been reported for containing inappropriate or offensive language. Please review your store name and consider renaming to something more appropriate for all users.`,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    });

    logger.info(`Created warning 1: ${warning1._id}`);

    // Warning 2: Fake Store
    const warning2 = await ModerationLog.create({
      admin: mockAdminId,
      action: 'warn_shop',
      targetType: 'shop',
      targetId: store._id,
      reason: 'Suspected fake store',
      details: 'Multiple users reported that this store does not exist at the listed address. Our verification team could not confirm the store\'s physical location. Please provide accurate store information and address, or this listing may be removed.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    logger.info(`Created warning 2: ${warning2._id}`);

    // Update store warnings and report count
    store.warnings = 2;
    store.reportCount = 5; // Simulate 5 reports
    await store.save();

    logger.info(`Updated store warnings: ${store.warnings}, reportCount: ${store.reportCount}`);

    // Add warnings to owner's warnings array
    owner.warnings.push({
      reason: 'Offensive store name',
      issuedBy: mockAdminId,
      issuedAt: warning1.timestamp,
    } as any);

    owner.warnings.push({
      reason: 'Suspected fake store',
      issuedBy: mockAdminId,
      issuedAt: warning2.timestamp,
    } as any);

    owner.reportCount = (owner.reportCount || 0) + 5;
    await owner.save();

    logger.info(`Added warnings to owner's account`);

    logger.info('\n========================================');
    logger.info('Store flagging completed!');
    logger.info('========================================');
    logger.info(`Store: ${store.name}`);
    logger.info(`Warnings: ${store.warnings}`);
    logger.info(`Report Count: ${store.reportCount}`);
    logger.info('========================================');
    logger.info('\nWarning Details:');
    logger.info('1. Offensive store name (7 days ago)');
    logger.info('2. Suspected fake store (2 days ago)');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error: unknown) {
    logger.error({ error }, 'Store flagging failed');
    process.exit(1);
  }
};

flagStore();

import 'dotenv/config';
import connect from './connect';
import logger from './logger';
import { Owner, Shop } from '../models';

/**
 * Script to assign a shop to an owner
 */
const assignShop = async () => {
  try {
    await connect();

    logger.info('Starting shop assignment...');

    // Find the owner by email
    const ownerEmail = 'shermanowner@gmail.com';
    const owner = await Owner.findOne({ email: ownerEmail });

    if (!owner) {
      logger.error(`Owner with email ${ownerEmail} not found`);
      process.exit(1);
    }

    logger.info(`Found owner: ${owner.name} (${owner.email})`);

    // Find shops with "grocery" in the name (case-insensitive)
    const groceryShops = await Shop.find({
      name: { $regex: /grocery/i }
    });

    logger.info(`Found ${groceryShops.length} grocery shops`);

    if (groceryShops.length === 0) {
      logger.warn('No grocery shops found. Creating Grocery Shop 1...');

      // Create Grocery Shop 1
      const newShop = await Shop.create({
        name: 'Grocery Shop 1',
        description: 'Fresh groceries and everyday essentials',
        address: '1 Grocery Lane, Singapore 123456',
        location: {
          type: 'Point',
          coordinates: [103.8198, 1.3521], // Singapore coordinates
        },
        phone: '61234567',
        email: 'groceryshop1@example.com',
        category: 'grocery',
        images: [],
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 0, openTime: '08:00', closeTime: '20:00', isClosed: false },
        ],
        owner: owner._id as any,
        verifiedByOwner: true,
        isActive: true,
        lastUpdatedBy: owner._id as any,
      });

      logger.info(`Created new shop: ${newShop.name}`);

      // Add shop to owner's shops array if not already there
      if (!owner.shops.includes(newShop._id as any)) {
        owner.shops.push(newShop._id as any);
        await owner.save();
        logger.info(`Added shop to owner's shops array`);
      }

      logger.info('\n========================================');
      logger.info('Shop assignment completed!');
      logger.info('========================================');
      logger.info(`Shop: ${newShop.name}`);
      logger.info(`Owner: ${owner.name} (${owner.email})`);
      logger.info('========================================\n');

      process.exit(0);
    }

    // If grocery shops exist, use the first one or find "Grocery Shop 1"
    let targetShop = groceryShops.find(shop =>
      shop.name.toLowerCase().includes('grocery shop 1')
    ) || groceryShops[0];

    logger.info(`Assigning shop: ${targetShop.name}`);

    // Update shop owner
    targetShop.owner = owner._id as any;
    targetShop.lastUpdatedBy = owner._id as any;
    await targetShop.save();

    logger.info(`Updated shop owner to ${owner.email}`);

    // Add shop to owner's shops array if not already there
    if (!owner.shops.includes(targetShop._id as any)) {
      owner.shops.push(targetShop._id as any);
      await owner.save();
      logger.info(`Added shop to owner's shops array`);
    } else {
      logger.info(`Shop already in owner's shops array`);
    }

    logger.info('\n========================================');
    logger.info('Shop assignment completed!');
    logger.info('========================================');
    logger.info(`Shop: ${targetShop.name}`);
    logger.info(`Owner: ${owner.name} (${owner.email})`);
    logger.info('========================================\n');

    process.exit(0);
  } catch (error: unknown) {
    logger.error({ error }, 'Shop assignment failed');
    process.exit(1);
  }
};

assignShop();

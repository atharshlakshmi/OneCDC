import 'dotenv/config';
import connect from './connect';
import logger from './logger';
import { Owner, Shop, Catalogue } from '../models';
import { UserRole, ShopCategory } from '../types';
import { hashPassword } from './password';

/**
 * Seed script matching frontend mockData.ts exactly
 */
const seedFrontend = async () => {
  try {
    await connect();

    logger.info('Starting frontend mock data seed...');

    // Clear existing data
    await Promise.all([
      Shop.deleteMany({}),
      Catalogue.deleteMany({}),
    ]);

    logger.info('Cleared existing shop and catalogue data');

    // Create a default owner for all shops
    const ownerPassword = await hashPassword('Owner123!');
    let owner = await Owner.findOne({ email: 'owner@onecdc.sg' });

    if (!owner) {
      owner = await Owner.create({
        email: 'owner@onecdc.sg',
        passwordHash: ownerPassword,
        name: 'Default Owner',
        phone: '61234567',
        role: UserRole.OWNER,
        businessRegistrationNumber: '123456789A',
        corppassVerified: true,
      });
      logger.info('✓ Default owner created');
    }

    // Shop 1: Tech Haven
    const techHaven = await Shop.create({
      name: 'Tech Haven',
      description: 'Your one-stop shop for all things tech.',
      address: '123 Tech Street',
      location: {
        type: 'Point',
        coordinates: [103.9056, 1.3016],
      },
      phone: '61234567',
      email: 'techhaven@example.com',
      category: ShopCategory.ELECTRONICS,
      images: [],
      operatingHours: [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00', isClosed: false },
      ],
      owner: owner._id as any,
      verifiedByOwner: true,
      isActive: true,
    });

    await Catalogue.create({
      shop: techHaven._id,
      items: [
        {
          name: 'Wireless Mouse',
          description: 'High-quality wireless mouse',
          price: 25,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [
            {
              shopper: owner._id as any, // Using owner as placeholder
              rating: 5,
              comment: 'Great mouse!',
              photos: [],
              availability: true,
              timestamp: new Date(),
              warnings: 0,
              isActive: true,
            } as any,
            {
              shopper: owner._id as any,
              rating: 4,
              comment: 'Good value for money.',
              photos: [],
              availability: true,
              timestamp: new Date(),
              warnings: 0,
              isActive: true,
            } as any,
          ],
        },
        {
          name: 'Mechanical Keyboard',
          description: 'Premium mechanical keyboard',
          price: 80,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [
            {
              shopper: owner._id as any,
              rating: 5,
              comment: 'Loving the clicky keys!',
              photos: [],
              availability: true,
              timestamp: new Date(),
              warnings: 0,
              isActive: true,
            } as any,
          ],
        },
      ],
    });

    logger.info('✓ Tech Haven created with items');

    // Shop 2: Gadget World
    const gadgetWorld = await Shop.create({
      name: 'Gadget World',
      description: 'Latest gadgets and accessories.',
      address: '456 Gadget Avenue',
      location: {
        type: 'Point',
        coordinates: [103.9156, 1.3116],
      },
      phone: '62345678',
      email: 'gadgetworld@example.com',
      category: ShopCategory.ELECTRONICS,
      images: [],
      operatingHours: [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00', isClosed: false },
      ],
      owner: owner._id as any,
      verifiedByOwner: true,
      isActive: true,
    });

    await Catalogue.create({
      shop: gadgetWorld._id,
      items: [
        {
          name: 'Wireless Mouse',
          description: 'High-quality wireless mouse',
          price: 27,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [],
        },
        {
          name: 'Smartwatch',
          description: 'Latest smartwatch with health tracking',
          price: 120,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [],
        },
      ],
    });

    logger.info('✓ Gadget World created with items');

    // Shop 3: Office Supplies Co.
    const officeSupplies = await Shop.create({
      name: 'Office Supplies Co.',
      description: 'Everything you need for your office.',
      address: '789 Office Blvd',
      location: {
        type: 'Point',
        coordinates: [103.9256, 1.3216],
      },
      phone: '63456789',
      email: 'office@example.com',
      category: ShopCategory.RETAIL,
      images: [],
      operatingHours: [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00', isClosed: false },
      ],
      owner: owner._id as any,
      verifiedByOwner: true,
      isActive: true,
    });

    await Catalogue.create({
      shop: officeSupplies._id,
      items: [
        {
          name: 'Notebook',
          description: 'Quality notebook for all your notes',
          price: 5,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [],
        },
        {
          name: 'Pen',
          description: 'Smooth writing pen',
          price: 1,
          availability: true,
          images: [],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [],
        },
      ],
    });

    logger.info('✓ Office Supplies Co. created with items');

    logger.info('\n========================================');
    logger.info('Frontend mock data seeding completed!');
    logger.info('========================================');
    logger.info('\n3 shops created:');
    logger.info('1. Tech Haven (2 items with reviews)');
    logger.info('2. Gadget World (2 items)');
    logger.info('3. Office Supplies Co. (2 items)');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error: unknown) {
    logger.error({ error }, 'Frontend seeding failed');
    process.exit(1);
  }
};

seedFrontend();

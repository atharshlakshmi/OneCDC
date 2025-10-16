import 'dotenv/config';
import connect from './connect';
import logger from './logger';
import {
  User,
  RegisteredShopper,
  Owner,
  Admin,
  Shop,
  Catalogue,
  ShoppingCart,
  Report,
  ModerationLog,
} from '../models';
import { UserRole, ShopCategory } from '../types';
import { hashPassword } from './password';

const seed = async () => {
  try {
    await connect();

    logger.info('Starting database seed...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      Catalogue.deleteMany({}),
      ShoppingCart.deleteMany({}),
      Report.deleteMany({}),
      ModerationLog.deleteMany({}),
    ]);

    logger.info('Cleared existing data');

    // Create admin
    const adminPassword = await hashPassword('Admin123!');
    await Admin.create({
      email: 'admin@onecdc.sg',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
      phone: '91234567',
    });
    logger.info('✓ Admin created: admin@onecdc.sg / Admin123!');

    // Create shoppers
    const shopperPassword = await hashPassword('Shopper123!');
    const shoppers = [];
    for (let i = 1; i <= 5; i++) {
      const shopper = await RegisteredShopper.create({
        email: `shopper${i}@example.com`,
        passwordHash: shopperPassword,
        name: `Shopper ${i}`,
        phone: `9123456${i}`,
        role: UserRole.REGISTERED_SHOPPER,
        singpassVerified: true,
        address: `${i} Marine Parade Road, Singapore`,
        preferredLocation: {
          lat: 1.3016 + i * 0.001,
          lng: 103.9056 + i * 0.001,
        },
      });
      shoppers.push(shopper);
    }
    logger.info(`✓ ${shoppers.length} shoppers created (shopper1-5@example.com / Shopper123!)`);

    // Create owners with shops
    const ownerPassword = await hashPassword('Owner123!');
    const shopCategories = [
      ShopCategory.GROCERY,
      ShopCategory.FOOD_BEVERAGE,
      ShopCategory.RETAIL,
    ];

    for (let i = 1; i <= 3; i++) {
      const owner = await Owner.create({
        email: `owner${i}@example.com`,
        passwordHash: ownerPassword,
        name: `Owner ${i}`,
        phone: `8123456${i}`,
        role: UserRole.OWNER,
        businessRegistrationNumber: `12345678${i}A`,
        corppassVerified: true,
      });

      // Create shop
      const shop = await Shop.create({
        name: `${shopCategories[i - 1].replace('_', ' ')} Shop ${i}`,
        description: `This is a ${shopCategories[i - 1].replace('_', ' ')} shop offering quality products with CDC voucher acceptance.`,
        address: `${i * 10} Marine Parade Central, Singapore ${i + 44000}`,
        location: {
          type: 'Point',
          coordinates: [103.9056 + i * 0.01, 1.3016 + i * 0.01],
        },
        phone: `6123456${i}`,
        email: `shop${i}@example.com`,
        category: shopCategories[i - 1],
        images: [`https://via.placeholder.com/400x300?text=Shop+${i}`],
        operatingHours: [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isClosed: false },
          { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isClosed: false },
          { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isClosed: false },
          { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isClosed: false },
          { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isClosed: false },
          { dayOfWeek: 6, openTime: '09:00', closeTime: '18:00', isClosed: false },
          { dayOfWeek: 0, openTime: '10:00', closeTime: '17:00', isClosed: false },
        ],
        owner: owner._id as any,
        verifiedByOwner: true,
        isActive: true,
      });

      owner.shops.push(shop._id as any);
      await owner.save();

      // Create catalogue with sample items
      const items = [];
      for (let j = 1; j <= 5; j++) {
        items.push({
          name: `Product ${j} - ${shop.name}`,
          description: `High quality product ${j} available at this shop. Great value for money!`,
          price: Math.floor(Math.random() * 50) + 10,
          availability: Math.random() > 0.2, // 80% available
          images: [`https://via.placeholder.com/300x300?text=Product+${j}`],
          category: shopCategories[i - 1],
          cdcVoucherAccepted: true,
          lastUpdatedBy: owner._id as any,
          lastUpdatedDate: new Date(),
          reviews: [],
        });
      }

      await Catalogue.create({
        shop: shop._id,
        items,
      });

      logger.info(`✓ Owner ${i} created with shop: ${shop.name}`);
    }

    // Create sample reviews for first shop
    const firstShop = await Shop.findOne({});
    if (firstShop) {
      const catalogue = await Catalogue.findOne({ shop: firstShop._id });
      if (catalogue && catalogue.items.length > 0) {
        const firstItem = catalogue.items[0];

        // Add reviews from shoppers
        for (let i = 0; i < 3; i++) {
          (firstItem.reviews as any).push({
            shopper: shoppers[i]._id as any,
            rating: 4 + Math.floor(Math.random() * 2), // 4 or 5
            comment: `Great product! Highly recommend. Bought this using CDC vouchers.`,
            photos: [],
            availability: true,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            warnings: 0,
            isActive: true,
          } as any);
        }

        await catalogue.save();
        logger.info('✓ Sample reviews added');
      }
    }

    // Create sample shopping cart
    if (shoppers[0]) {
      const shops = await Shop.find({}).limit(2);
      await ShoppingCart.create({
        shopper: shoppers[0]._id as any,
        items: shops.map((shop) => ({
          shop: shop._id as any,
          itemTags: ['Product 1', 'Product 2'],
          addedAt: new Date(),
        })),
      });
      logger.info('✓ Sample shopping cart created');
    }

    logger.info('\n========================================');
    logger.info('Database seeding completed successfully!');
    logger.info('========================================');
    logger.info('\nTest Accounts:');
    logger.info('Admin: admin@onecdc.sg / Admin123!');
    logger.info('Shoppers: shopper1-5@example.com / Shopper123!');
    logger.info('Owners: owner1-3@example.com / Owner123!');
    logger.info('========================================\n');

    process.exit(0);
  } catch (error: unknown) {
    logger.error({ error }, 'Seeding failed');
    process.exit(1);
  }
};

seed();

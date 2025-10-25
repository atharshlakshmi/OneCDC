import mongoose from 'mongoose';
import logger from './logger';

async function connect() {
  const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc';

  try {
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    logger.info('Connected to MongoDB');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error: unknown) {
    logger.error({ error }, 'Error connecting to MongoDB');
    process.exit(1);
  }
}

export default connect; 

import 'reflect-metadata'; // Required for decorators
import { sequelize } from './config';
import { initializeAssociations } from './models';
import { seedRationItems } from './scripts/seed-ration-items';

/**
 * Database connection and sync utility
 * Initializes models and manages database lifecycle
 */
class Database {
  private static instance: Database;
  private modelsInitialized: boolean = false;

  private constructor() {}

  /**
   * Get Database singleton instance
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Initialize models and associations
   * Called automatically by connect()
   */
  private async initializeModels(): Promise<void> {
    if (this.modelsInitialized) {
      return;
    }

    try {
      // Models are auto-loaded by sequelize-typescript from config
      // Just need to set up associations
      initializeAssociations();
      
      this.modelsInitialized = true;
      console.log('✓ Models initialized successfully');
    } catch (error) {
      console.error('✗ Error initializing models:', error);
      throw error;
    }
  }

  /**
   * Connect to the database and initialize models
   */
  public async connect(): Promise<void> {
    try {
      await sequelize.authenticate();
      console.log('✓ Database connection established successfully');
      
      // Initialize models after connection
      await this.initializeModels();
    } catch (error) {
      console.error('✗ Unable to connect to the database:', error);
      throw error;
    }
  }

  /**
   * Sync database models
   * @param force - Drop tables before creating (use with caution!)
   * @param alter - Alter tables to match models
   */
  public async sync(force: boolean = false, alter: boolean = false): Promise<void> {
    try {
      await sequelize.sync({ force, alter });
      console.log('✓ Database models synchronized successfully');
    } catch (error) {
      console.error('✗ Error synchronizing database models:', error);
      throw error;
    }
  }

  /**
   * Seed initial data (ration items)
   * Should be called after sync
   */
  public async seed(): Promise<void> {
    try {
      await seedRationItems();
    } catch (error) {
      console.error('✗ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async disconnect(): Promise<void> {
    try {
      await sequelize.close();
      console.log('✓ Database connection closed');
    } catch (error) {
      console.error('✗ Error closing database connection:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Sequelize instance
   */
  public getSequelize() {
    return sequelize;
  }

  /**
   * Get all registered models
   */
  public getModels() {
    return sequelize.models;
  }
}

export default Database;
export { Database };


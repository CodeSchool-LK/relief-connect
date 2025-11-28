import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import { appConfig } from './app.config';

/**
 * Database configuration for different environments
 */
const getConfig = () => {
  const dbConfig = {
    dialect: 'postgres' as const,
    host: appConfig.database.host,
    port: appConfig.database.port,
    database: appConfig.database.database,
    username: appConfig.database.username,
    password: appConfig.database.password,
    logging: appConfig.environment.isDevelopment ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    models: [path.join(__dirname, '../models/**/*.model.{ts,js}')],
    define: {
      timestamps: true,
      underscored: false,
    },
  };

  // Log configuration details (but not password)
  console.log(`📊 Database Configuration:`);
  console.log(`   Environment: ${appConfig.environment.displayName.toUpperCase()}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.username}`);
  
  return dbConfig;
};

/**
 * Sequelize instance with TypeScript support
 */
const config = getConfig();
const sequelize = new Sequelize(config);

export { sequelize, getConfig };
export default sequelize;


import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Environment, getCurrentEnvironment, getEnvironmentDisplayName } from '../enums';

/**
 * Environment to .env file mapping
 * Maps each environment enum to its corresponding .env file
 */
const ENV_FILE_MAP: Record<Environment, string> = {
  [Environment.DEVELOPMENT]: '.env.dev',
  [Environment.QA]: '.env.qa',
  [Environment.STAGING]: '.env.staging',
  [Environment.PRODUCTION]: '.env.prod'
};

/**
 * Load environment variables from .env files
 * Priority: .env.[environment] > .env (in apps/api directory) > .env (root directory)
 * 
 * This function should be called once at application startup before any other config is accessed
 */
export function loadEnvironmentVariables(): void {
  const currentEnv = getCurrentEnvironment();
  const envFile = ENV_FILE_MAP[currentEnv];
  
  // Get the directory where this config file is located
  // In source (ts-node-dev): apps/api/src/config
  // In compiled: apps/api/dist/config
  const configDir = __dirname;
  
  // Determine api directory based on current location
  // Strategy: go up from config directory until we find a directory named "api" with package.json
  let apiDir = configDir;
  let foundApiDir = false;
  
  // Go up directories (max 5 levels) to find the api directory
  for (let i = 0; i < 5; i++) {
    const dirName = path.basename(apiDir);
    const packageJsonPath = path.join(apiDir, 'package.json');
    
    // Check if this directory is named "api" and has package.json
    if (dirName === 'api' && fs.existsSync(packageJsonPath)) {
      foundApiDir = true;
      break;
    }
    
    // Go up one level
    const parentDir = path.resolve(apiDir, '..');
    if (parentDir === apiDir) {
      // Reached filesystem root, stop searching
      break;
    }
    apiDir = parentDir;
  }
  
  // Fallback: use process.cwd() and assume standard monorepo structure
  if (!foundApiDir) {
    const fallbackApiDir = path.resolve(process.cwd(), 'apps/api');
    if (fs.existsSync(path.join(fallbackApiDir, 'package.json'))) {
      apiDir = fallbackApiDir;
      foundApiDir = true;
    }
  }
  
  // Get root directory (monorepo root) - go up from api directory
  const rootDir = foundApiDir ? path.resolve(apiDir, '..', '..') : process.cwd();
  
  // Try multiple paths in order of priority
  const envPaths = [
    path.resolve(apiDir, envFile),                      // apps/api/.env.dev (environment-specific)
    path.resolve(apiDir, '.env'),                       // apps/api/.env (primary)
    path.resolve(rootDir, '.env'),                      // root/.env (fallback)
    path.resolve(process.cwd(), 'apps/api', envFile),   // from cwd: apps/api/.env.dev
    path.resolve(process.cwd(), 'apps/api', '.env'),    // from cwd: apps/api/.env
    path.resolve(process.cwd(), '.env'),                 // from cwd: .env
  ];

  let loaded = false;
  let loadedPath = '';
  
  // Store original DB_NAME to check if it changed after loading
  const originalDbName = process.env.DB_NAME;

  // Try each path until one works
  for (const envPath of envPaths) {
    // Check if file exists first
    if (!fs.existsSync(envPath)) {
      continue;
    }
    
    // Try to load the file
    const result = dotenv.config({ path: envPath });
    
    // Check if loading succeeded and if we got new environment variables
    if (!result.error) {
      // Verify that we actually loaded something (check if DB_NAME changed or was set)
      if (process.env.DB_NAME && process.env.DB_NAME !== originalDbName || originalDbName === undefined) {
        loaded = true;
        loadedPath = envPath;
        console.log(`✓ Loaded environment config from: ${envPath}`);
        break;
      }
    }
  }

  // If no file was loaded, try default dotenv.config() (loads from process.cwd())
  if (!loaded) {
    const defaultEnvPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(defaultEnvPath)) {
      const result = dotenv.config({ path: defaultEnvPath });
      if (!result.error && process.env.DB_NAME) {
        loaded = true;
        loadedPath = defaultEnvPath;
        console.log(`✓ Loaded environment config from: ${loadedPath}`);
      }
    }
  }

  // Log debug information
  if (!loaded) {
    console.warn(`⚠️  No .env file found`);
    console.warn(`   Current working directory: ${process.cwd()}`);
    console.warn(`   Config directory: ${configDir}`);
    console.warn(`   API directory: ${apiDir}`);
    console.warn(`   Tried paths:`);
    envPaths.forEach(p => {
      const exists = fs.existsSync(p);
      console.warn(`     ${exists ? '✓' : '✗'} ${p}`);
    });
  }

  // In production/VPS, environment variables may be set directly by docker-compose
  // which overrides file-based .env, so this is fine
  if (!process.env.DB_NAME && !process.env.DATABASE_URL) {
    console.warn(`⚠️  No DB_NAME or DATABASE_URL environment variable found`);
    console.warn(`   This might be okay if variables are set via Docker or CI/CD`);
  } else {
    console.log(`✓ Environment variables loaded successfully`);
  }
}

// Load environment variables FIRST before creating appConfig
loadEnvironmentVariables();

/**
 * Application configuration
 * Centralized configuration object that loads and validates all environment variables
 */
export const appConfig = {
  /**
   * Server configuration
   */
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: (process.env.NODE_ENV?.toLowerCase() || 'development') as Environment,
    corsOrigin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['*'],
  },

  /**
   * Database configuration
   */
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || '',
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    url: process.env.DATABASE_URL, // Optional: can override individual settings
  },

  /**
   * JWT configuration
   */
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET || 'your-secret-key-change-in-production') + '-refresh',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  /**
   * Environment information
   */
  environment: {
    current: getCurrentEnvironment(),
    displayName: getEnvironmentDisplayName(getCurrentEnvironment()),
    isDevelopment: getCurrentEnvironment() === Environment.DEVELOPMENT,
    isProduction: getCurrentEnvironment() === Environment.PRODUCTION,
    isQA: getCurrentEnvironment() === Environment.QA,
    isStaging: getCurrentEnvironment() === Environment.STAGING,
  },
} as const;

/**
 * Validate critical configuration values
 * Throws error if required values are missing
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate database config
  if (!appConfig.database.url && !appConfig.database.database) {
    errors.push('DB_NAME or DATABASE_URL is required');
  }

  // Validate JWT secrets (warn if using defaults in production)
  if (appConfig.environment.isProduction) {
    if (appConfig.jwt.secret === 'your-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    if (appConfig.jwt.refreshSecret.includes('your-secret-key-change-in-production')) {
      errors.push('JWT_REFRESH_SECRET must be set in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}


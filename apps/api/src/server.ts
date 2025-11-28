import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as HttpServer } from 'http';
import Database from './database';
import { RouterManager } from './routes';
import { normalizeResponse, errorHandler } from './middleware';
import { appConfig } from './config';

/**
 * Server class - Handles application lifecycle
 * Singleton pattern for server initialization and management
 */
class Server {
  private static instance: Server;
  private app: Application;
  private database: Database;
  private server!: HttpServer;

  private constructor() {
    this.app = express();
    this.database = Database.getInstance();
  }

  /**
   * Get Server singleton instance
   */
  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }
    return Server.instance;
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    this.app.use(helmet());
    
    // CORS configuration - allow frontend domains
    this.app.use(cors({
      origin: appConfig.server.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('combined'));
    
    // Response normalization middleware
    this.app.use(normalizeResponse);
  }

  /**
   * Setup routes
   * Uses class-based RouterManager for better organization
   */
  private setupRoutes(): void {
    // Option 1: Use new class-based router manager (recommended)
    const routerManager = RouterManager.getInstance();
    this.app.use('/', routerManager.getRouter());
    
    // Option 2: Use legacy functional routes (for backward compatibility)
    // this.app.use('/', routes);
  }

  /**
   * Setup error handlers
   * Note: Must be registered AFTER all routes
   */
  private setupErrorHandlers(): void {
    // 404 handler for unknown routes
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
      });
    });

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   * @param port Port number to listen on
   */
  public async start(port: number): Promise<void> {
    try {
      console.log('🚀 Starting server...');

      // Stop existing server if running (for development restarts)
      if (this.server) {
        console.log('⚠️  Existing server detected, stopping first...');
        await this.stop();
      }

      // Initialize database
      await this.database.connect();
      
      // Sync database models (only alter in development)
      const shouldAlter = appConfig.environment.isDevelopment;
      await this.database.sync(false, shouldAlter);

      // Setup application
      this.setupMiddleware();
      this.setupRoutes();
      this.setupErrorHandlers();

      // Start listening with error handling
      await new Promise<void>((resolve, reject) => {
        this.server = this.app.listen(port, () => {
          console.log(`✓ API Server is running on port ${port} `);
          console.log(`✓ Environment: ${appConfig.environment.displayName}`);
          resolve();
        });

        this.server.on('error', (error: Error & { code?: string }) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`✗ Port ${port} is already in use`);
            reject(new Error(`Port ${port} is already in use. Please stop the existing server or use a different port.`));
          } else {
            console.error('✗ Server error:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('✗ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server gracefully
   */
  public async stop(): Promise<void> {
    try {
      console.log('\n🛑 Stopping server...');
      
      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve, _reject) => {
          const timeout = setTimeout(() => {
            console.log('⚠️  Force closing server after timeout');
            resolve();
          }, 5000); // 5 second timeout

          this.server.close((err: Error | undefined) => {
            clearTimeout(timeout);
            if (err) {
              console.error('Error closing server:', err);
              // Don't reject, just log and continue
            }
            resolve();
          }); 
        });
        this.server = undefined as unknown as HttpServer;
      }

      // Close database connection
      try {
        await this.database.disconnect();
      } catch (dbError) {
        console.error('Error closing database connection:', dbError);
        // Don't throw, just log
      }
      
      console.log('✓ Server stopped successfully');
    } catch (error) {
      console.error('✗ Error stopping server:', error);
      // Don't throw in stop method to avoid preventing restart
    }
  }

  /**
   * Get Express application instance
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get Database instance
   */
  public getDatabase(): Database {
    return this.database;
  }
}

export default Server;



import { Request, Response, NextFunction } from 'express';
import Database from '../database';
import { IHealthResponse, IReadyResponse } from '@nx-mono-repo-deployment-test/shared';
import { appConfig } from '../config';

/**
 * Controller for Health Check endpoints
 * Note: Health endpoints use custom response formats (not IApiResponse)
 * This is intentional for monitoring tools compatibility
 */
class HealthController {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * GET /health
   * Health check endpoint with database status
   * Returns custom IHealthResponse format for monitoring compatibility
   */
  public async health(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const isDbConnected = await this.database.testConnection();

      const response: IHealthResponse = {
        status: isDbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appConfig.environment.displayName.toLowerCase(),
        database: {
          connected: isDbConnected,
          type: 'PostgreSQL',
        },
      };

      const statusCode = isDbConnected ? 200 : 503;
      res.status(statusCode).json(response);
    } catch (error) {
      // For health checks, we handle errors directly instead of using next()
      // This ensures monitoring tools always get a response
      console.error('Error in HealthController.health:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appConfig.environment.displayName.toLowerCase(),
        database: {
          connected: false,
          type: 'PostgreSQL',
        },
        error: appConfig.environment.isDevelopment ? String(error) : undefined,
      });
    }
  }

  /**
   * GET /health/ready
   * Readiness check endpoint for Kubernetes/Docker health probes
   * Returns custom IReadyResponse format
   */
  public async ready(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const isDbConnected = await this.database.testConnection();

      if (!isDbConnected) {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          reason: 'Database not connected',
        });
        return;
      }

      const response: IReadyResponse = {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      // For readiness checks, we handle errors directly
      console.error('Error in HealthController.ready:', error);
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: appConfig.environment.isDevelopment ? String(error) : 'Service unavailable',
      });
    }
  }
}

export default HealthController;


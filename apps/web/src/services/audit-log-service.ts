import apiClient from './api-client';
import { IApiResponse } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';

export interface AuditLog {
  id: number;
  userId?: number;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: number;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Audit Log Service
 */
class AuditLogService {
  private static instance: AuditLogService;
  private readonly basePath = '/api/admin/audit-logs';

  private constructor() {}

  public static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  /**
   * Get audit logs with filters
   */
  public async getAuditLogs(filters?: AuditLogFilters): Promise<IApiResponse<AuditLog[]>> {
    try {
      const params: Record<string, string | number> = {};
      if (filters) {
        if (filters.userId !== undefined) params.userId = filters.userId;
        if (filters.action) params.action = filters.action;
        if (filters.resourceType) params.resourceType = filters.resourceType;
        if (filters.resourceId) params.resourceId = filters.resourceId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.limit !== undefined) params.limit = filters.limit;
        if (filters.offset !== undefined) params.offset = filters.offset;
      }
      const response = await apiClient.get<IApiResponse<AuditLog[]>>(this.basePath, params);
      return response;
    } catch (error) {
      console.error('Error in AuditLogService.getAuditLogs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      };
    }
  }

  /**
   * Get audit log by ID
   */
  public async getAuditLogById(id: number): Promise<IApiResponse<AuditLog>> {
    try {
      const response = await apiClient.get<IApiResponse<AuditLog>>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in AuditLogService.getAuditLogById (${id}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit log',
      };
    }
  }

  /**
   * Export audit logs
   */
  public async exportAuditLogs(filters?: Omit<AuditLogFilters, 'limit' | 'offset'>, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const params: Record<string, string> = { format };
      if (filters) {
        if (filters.userId !== undefined) params.userId = String(filters.userId);
        if (filters.action) params.action = filters.action;
        if (filters.resourceType) params.resourceType = filters.resourceType;
        if (filters.resourceId) params.resourceId = filters.resourceId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
      }
      
      const accessToken = apiClient.getAccessToken();
      const headers: Record<string, string> = {
        'Accept': format === 'csv' ? 'text/csv' : 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = new URL(`${API_URL}${this.basePath}/export`, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error in AuditLogService.exportAuditLogs:', error);
      throw error;
    }
  }
}

export const auditLogService = AuditLogService.getInstance();
export default auditLogService;


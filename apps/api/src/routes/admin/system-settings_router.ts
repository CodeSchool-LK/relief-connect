import { BaseRouter } from '../common/base_router';
import { SystemSettingsController } from '../../controllers';
import { SystemSettingsService } from '../../services';
import { ValidationMiddleware, authenticate, requireAdmin } from '../../middleware';
import { requirePermission } from '../../middleware/permission';
import { Permission } from '@nx-mono-repo-deployment-test/shared/src/enums';
import { UpdateSystemSettingDto, BulkUpdateSettingsDto } from '@nx-mono-repo-deployment-test/shared/src/dtos';

const SYSTEM_SETTINGS_BASE_PATH = '/admin/system-settings';

/**
 * Router for System Settings endpoints
 */
export class SystemSettingsRouter extends BaseRouter {
  private systemSettingsController!: SystemSettingsController;

  constructor() {
    super();
  }

  private getSystemSettingsController(): SystemSettingsController {
    if (!this.systemSettingsController) {
      const systemSettingsService = SystemSettingsService.getInstance();
      this.systemSettingsController = new SystemSettingsController(systemSettingsService);
    }
    return this.systemSettingsController;
  }

  protected initializeRoutes(): void {
    const controller = this.getSystemSettingsController();

    // GET /api/admin/system-settings - Get all settings
    this.router.get(
      '/',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_SYSTEM_SETTINGS),
      controller.getAllSettings
    );

    // GET /api/admin/system-settings/:category - Get settings by category
    this.router.get(
      '/:category',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_SYSTEM_SETTINGS),
      controller.getSettingsByCategory
    );

    // GET /api/admin/system-settings/key/:key - Get setting by key
    this.router.get(
      '/key/:key',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_SYSTEM_SETTINGS),
      controller.getSettingByKey
    );

    // PUT /api/admin/system-settings/:key - Update setting
    this.router.put(
      '/:key',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_SYSTEM_SETTINGS),
      ValidationMiddleware.body(UpdateSystemSettingDto),
      controller.updateSetting
    );

    // POST /api/admin/system-settings/bulk - Bulk update settings
    this.router.post(
      '/bulk',
      authenticate,
      requireAdmin(),
      requirePermission(Permission.MANAGE_SYSTEM_SETTINGS),
      ValidationMiddleware.body(BulkUpdateSettingsDto),
      controller.bulkUpdateSettings
    );
  }

  public getBasePath(): string {
    return SYSTEM_SETTINGS_BASE_PATH;
  }

  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${SYSTEM_SETTINGS_BASE_PATH}`, methods: ['GET'] },
      { path: `${SYSTEM_SETTINGS_BASE_PATH}/:category`, methods: ['GET'] },
      { path: `${SYSTEM_SETTINGS_BASE_PATH}/key/:key`, methods: ['GET'] },
      { path: `${SYSTEM_SETTINGS_BASE_PATH}/:key`, methods: ['PUT'] },
      { path: `${SYSTEM_SETTINGS_BASE_PATH}/bulk`, methods: ['POST'] },
    ];
  }
}


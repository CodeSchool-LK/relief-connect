import SystemSettingModel, { ISystemSetting } from '../models/system-setting.model';

class SystemSettingDao {
  private static instance: SystemSettingDao;

  private constructor() {}

  public static getInstance(): SystemSettingDao {
    if (!SystemSettingDao.instance) {
      SystemSettingDao.instance = new SystemSettingDao();
    }
    return SystemSettingDao.instance;
  }

  /**
   * Find all system settings
   */
  public async findAll(): Promise<ISystemSetting[]> {
    try {
      const settings = await SystemSettingModel.findAll({
        order: [['category', 'ASC'], ['key', 'ASC']],
      });
      return settings.map(setting => setting.toJSON() as ISystemSetting);
    } catch (error) {
      console.error('Error in SystemSettingDao.findAll:', error);
      throw error;
    }
  }

  /**
   * Find system settings by category
   */
  public async findByCategory(category: string): Promise<ISystemSetting[]> {
    try {
      const settings = await SystemSettingModel.findAll({
        where: {
          [SystemSettingModel.SETTING_CATEGORY]: category,
        },
        order: [['key', 'ASC']],
      });
      return settings.map(setting => setting.toJSON() as ISystemSetting);
    } catch (error) {
      console.error(`Error in SystemSettingDao.findByCategory (${category}):`, error);
      throw error;
    }
  }

  /**
   * Find system setting by key
   */
  public async findByKey(key: string): Promise<ISystemSetting | null> {
    try {
      const setting = await SystemSettingModel.findOne({
        where: {
          [SystemSettingModel.SETTING_KEY]: key,
        },
      });
      return setting ? (setting.toJSON() as ISystemSetting) : null;
    } catch (error) {
      console.error(`Error in SystemSettingDao.findByKey (${key}):`, error);
      throw error;
    }
  }

  /**
   * Create a new system setting
   */
  public async create(settingData: Omit<ISystemSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISystemSetting> {
    try {
      const setting = await SystemSettingModel.create(settingData);
      return setting.toJSON() as ISystemSetting;
    } catch (error) {
      console.error('Error in SystemSettingDao.create:', error);
      throw error;
    }
  }

  /**
   * Update system setting by key
   */
  public async updateByKey(
    key: string,
    updateData: Partial<Omit<ISystemSetting, 'id' | 'key' | 'createdAt'>>,
    updatedBy?: number
  ): Promise<ISystemSetting | null> {
    try {
      const setting = await SystemSettingModel.findOne({
        where: {
          [SystemSettingModel.SETTING_KEY]: key,
        },
      });

      if (!setting) {
        return null;
      }

      if (updatedBy !== undefined) {
        updateData.updatedBy = updatedBy;
      }

      await setting.update(updateData);
      return setting.toJSON() as ISystemSetting;
    } catch (error) {
      console.error(`Error in SystemSettingDao.updateByKey (${key}):`, error);
      throw error;
    }
  }

  /**
   * Bulk update system settings
   */
  public async bulkUpdate(
    updates: Array<{ key: string; value: string; updatedBy?: number }>
  ): Promise<ISystemSetting[]> {
    try {
      const updatedSettings: ISystemSetting[] = [];

      for (const update of updates) {
        const setting = await this.updateByKey(update.key, { value: update.value }, update.updatedBy);
        if (setting) {
          updatedSettings.push(setting);
        }
      }

      return updatedSettings;
    } catch (error) {
      console.error('Error in SystemSettingDao.bulkUpdate:', error);
      throw error;
    }
  }
}

export default SystemSettingDao;
export { SystemSettingDao };


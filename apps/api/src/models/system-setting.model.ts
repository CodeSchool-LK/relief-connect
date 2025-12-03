import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';
import { SystemSettingType, SYSTEM_SETTING_TYPES } from '@nx-mono-repo-deployment-test/shared/src/enums';

export interface ISystemSetting {
  id?: number;
  key: string;
  value: string;
  type: SystemSettingType;
  description?: string;
  category?: string;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  tableName: SystemSettingModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class SystemSettingModel extends Model<ISystemSetting> implements ISystemSetting {
  public static readonly TABLE_NAME = 'system_settings';
  public static readonly SETTING_ID = 'id';
  public static readonly SETTING_KEY = 'key';
  public static readonly SETTING_VALUE = 'value';
  public static readonly SETTING_TYPE = 'type';
  public static readonly SETTING_DESCRIPTION = 'description';
  public static readonly SETTING_CATEGORY = 'category';
  public static readonly SETTING_UPDATED_BY = 'updatedBy';
  public static readonly SETTING_CREATED_AT = 'createdAt';
  public static readonly SETTING_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: SystemSettingModel.SETTING_ID,
  })
  id!: number;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    field: SystemSettingModel.SETTING_KEY,
  })
  key!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: SystemSettingModel.SETTING_VALUE,
  })
  value!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: SystemSettingType.STRING,
    validate: {
      isIn: [SYSTEM_SETTING_TYPES],
    },
    field: SystemSettingModel.SETTING_TYPE,
  })
  type!: SystemSettingType;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: SystemSettingModel.SETTING_DESCRIPTION,
  })
  description?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: SystemSettingModel.SETTING_CATEGORY,
  })
  category?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: SystemSettingModel.SETTING_UPDATED_BY,
  })
  updatedBy?: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: SystemSettingModel.SETTING_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: SystemSettingModel.SETTING_UPDATED_AT,
  })
  updatedAt!: Date;
}


import { Table, Column, Model, DataType, CreatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { AuditAction } from '@nx-mono-repo-deployment-test/shared/src/enums';

export interface IAuditLog {
  id?: number;
  userId?: number;
  action: AuditAction;
  resourceType?: string;
  resourceId?: number | string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

@Table({
  tableName: AuditLogModel.TABLE_NAME,
  timestamps: false, // We only use createdAt
  underscored: false,
})
export default class AuditLogModel extends Model<IAuditLog> implements IAuditLog {
  public static readonly TABLE_NAME = 'audit_logs';
  public static readonly LOG_ID = 'id';
  public static readonly LOG_USER_ID = 'userId';
  public static readonly LOG_ACTION = 'action';
  public static readonly LOG_RESOURCE_TYPE = 'resourceType';
  public static readonly LOG_RESOURCE_ID = 'resourceId';
  public static readonly LOG_DETAILS = 'details';
  public static readonly LOG_IP_ADDRESS = 'ipAddress';
  public static readonly LOG_USER_AGENT = 'userAgent';
  public static readonly LOG_CREATED_AT = 'createdAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: AuditLogModel.LOG_ID,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: AuditLogModel.LOG_USER_ID,
  })
  userId?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: AuditLogModel.LOG_ACTION,
  })
  action!: AuditAction;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: AuditLogModel.LOG_RESOURCE_TYPE,
  })
  resourceType?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: AuditLogModel.LOG_RESOURCE_ID,
  })
  resourceId?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    field: AuditLogModel.LOG_DETAILS,
  })
  details?: Record<string, unknown>;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: AuditLogModel.LOG_IP_ADDRESS,
  })
  ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: AuditLogModel.LOG_USER_AGENT,
  })
  userAgent?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: AuditLogModel.LOG_CREATED_AT,
  })
  createdAt!: Date;
}


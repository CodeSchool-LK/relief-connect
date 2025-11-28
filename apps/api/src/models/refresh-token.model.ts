import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import UserModel from './user.model';

@Table({
  tableName: RefreshTokenModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class RefreshTokenModel extends Model {
  public static readonly TABLE_NAME = 'refresh_tokens';
  public static readonly REFRESH_TOKEN_ID = 'id';
  public static readonly REFRESH_TOKEN_USER_ID = 'userId';
  public static readonly REFRESH_TOKEN_TOKEN = 'token';
  public static readonly REFRESH_TOKEN_EXPIRES_AT = 'expiresAt';
  public static readonly REFRESH_TOKEN_CREATED_AT = 'createdAt';
  public static readonly REFRESH_TOKEN_UPDATED_AT = 'updatedAt';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: RefreshTokenModel.REFRESH_TOKEN_ID,
  })
  id!: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: RefreshTokenModel.REFRESH_TOKEN_USER_ID,
  })
  userId!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: RefreshTokenModel.REFRESH_TOKEN_TOKEN,
  })
  token!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: RefreshTokenModel.REFRESH_TOKEN_EXPIRES_AT,
  })
  expiresAt!: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: RefreshTokenModel.REFRESH_TOKEN_CREATED_AT,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    field: RefreshTokenModel.REFRESH_TOKEN_UPDATED_AT,
  })
  updatedAt!: Date;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}



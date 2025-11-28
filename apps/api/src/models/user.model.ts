import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';
import { UserRole, UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';

@Table({
  tableName: UserModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class UserModel extends Model<IUser> implements IUser {
  public static readonly TABLE_NAME = 'users';
  public static readonly USER_ID = 'id';
  public static readonly USER_USERNAME = 'username';
  public static readonly USER_PASSWORD = 'password';
  public static readonly USER_ROLE = 'role';
  public static readonly USER_STATUS = 'status';
  public static readonly USER_CREATED_AT = 'createdAt';
  public static readonly USER_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: UserModel.USER_ID,
  })
  id!: number;

  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
    field: UserModel.USER_USERNAME,
  })
  username!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true, // Password is optional
    field: UserModel.USER_PASSWORD,
  })
  password?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: UserRole.USER,
    field: UserModel.USER_ROLE,
  })
  role!: UserRole;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
    field: UserModel.USER_STATUS,
  })
  status!: UserStatus;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: UserModel.USER_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: UserModel.USER_UPDATED_AT,
  })
  updatedAt!: Date;
}


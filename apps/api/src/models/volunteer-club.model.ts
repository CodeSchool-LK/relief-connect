import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, Unique, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { IVolunteerClub } from '@nx-mono-repo-deployment-test/shared/src/interfaces/volunteer-club/IVolunteerClub';
import { UserStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import UserModel from './user.model';
import UserVolunteerClubMembershipModel from './user-volunteer-club-membership.model';

@Table({
  tableName: VolunteerClubModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class VolunteerClubModel extends Model<IVolunteerClub> implements IVolunteerClub {
  public static readonly TABLE_NAME = 'volunteer_clubs';
  public static readonly VOLUNTEER_CLUB_ID = 'id';
  public static readonly VOLUNTEER_CLUB_NAME = 'name';
  public static readonly VOLUNTEER_CLUB_DESCRIPTION = 'description';
  public static readonly VOLUNTEER_CLUB_CONTACT_NUMBER = 'contactNumber';
  public static readonly VOLUNTEER_CLUB_EMAIL = 'email';
  public static readonly VOLUNTEER_CLUB_ADDRESS = 'address';
  public static readonly VOLUNTEER_CLUB_USER_ID = 'userId';
  public static readonly VOLUNTEER_CLUB_STATUS = 'status';
  public static readonly VOLUNTEER_CLUB_CREATED_AT = 'createdAt';
  public static readonly VOLUNTEER_CLUB_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_ID,
  })
  id!: number;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    field: VolunteerClubModel.VOLUNTEER_CLUB_NAME,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_DESCRIPTION,
  })
  description?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_CONTACT_NUMBER,
  })
  contactNumber?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_EMAIL,
  })
  email?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_ADDRESS,
  })
  address?: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: VolunteerClubModel.VOLUNTEER_CLUB_USER_ID,
  })
  userId?: number;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: UserStatus.ACTIVE,
    field: VolunteerClubModel.VOLUNTEER_CLUB_STATUS,
  })
  status!: UserStatus;

  @HasMany(() => UserVolunteerClubMembershipModel, {
    foreignKey: 'volunteerClubId',
  })
  memberships?: UserVolunteerClubMembershipModel[];

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: VolunteerClubModel.VOLUNTEER_CLUB_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: VolunteerClubModel.VOLUNTEER_CLUB_UPDATED_AT,
  })
  updatedAt!: Date;
}


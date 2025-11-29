import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import { IUserVolunteerClubMembership } from '@nx-mono-repo-deployment-test/shared/src/interfaces/membership/IUserVolunteerClubMembership';
import { MembershipStatus } from '@nx-mono-repo-deployment-test/shared/src/enums';
import UserModel from './user.model';
import VolunteerClubModel from './volunteer-club.model';

@Table({
  tableName: UserVolunteerClubMembershipModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: [UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID, UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID],
      name: 'unique_user_club_membership',
    },
  ],
})
export default class UserVolunteerClubMembershipModel extends Model<IUserVolunteerClubMembership> implements IUserVolunteerClubMembership {
  public static readonly TABLE_NAME = 'user_volunteer_club_memberships';
  public static readonly MEMBERSHIP_ID = 'id';
  public static readonly MEMBERSHIP_USER_ID = 'userId';
  public static readonly MEMBERSHIP_VOLUNTEER_CLUB_ID = 'volunteerClubId';
  public static readonly MEMBERSHIP_STATUS = 'status';
  public static readonly MEMBERSHIP_REQUESTED_AT = 'requestedAt';
  public static readonly MEMBERSHIP_REVIEWED_AT = 'reviewedAt';
  public static readonly MEMBERSHIP_REVIEWED_BY = 'reviewedBy';
  public static readonly MEMBERSHIP_NOTES = 'notes';
  public static readonly MEMBERSHIP_CREATED_AT = 'createdAt';
  public static readonly MEMBERSHIP_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_ID,
  })
  id!: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID,
  })
  userId!: number;

  @BelongsTo(() => UserModel, {
    foreignKey: UserVolunteerClubMembershipModel.MEMBERSHIP_USER_ID,
    as: 'user',
  })
  user?: UserModel;

  @ForeignKey(() => VolunteerClubModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_VOLUNTEER_CLUB_ID,
  })
  volunteerClubId!: number;

  @BelongsTo(() => VolunteerClubModel)
  volunteerClub?: VolunteerClubModel;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: MembershipStatus.PENDING,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_STATUS,
  })
  status!: MembershipStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_REQUESTED_AT,
  })
  requestedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_REVIEWED_AT,
  })
  reviewedAt?: Date;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_REVIEWED_BY,
  })
  reviewedBy?: number;

  @BelongsTo(() => UserModel, {
    foreignKey: UserVolunteerClubMembershipModel.MEMBERSHIP_REVIEWED_BY,
    as: 'reviewer',
  })
  reviewer?: UserModel;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_NOTES,
  })
  notes?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: UserVolunteerClubMembershipModel.MEMBERSHIP_UPDATED_AT,
  })
  updatedAt!: Date;
}


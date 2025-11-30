import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { IDonation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/donation/IDonation';
import HelpRequestModel from './help-request.model';
import CampModel from './camp.model';
import UserModel from './user.model';

@Table({
  tableName: DonationModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class DonationModel extends Model<IDonation> implements IDonation {
  public static readonly TABLE_NAME = 'donations';
  public static readonly DONATION_ID = 'id';
  public static readonly DONATION_HELP_REQUEST_ID = 'helpRequestId';
  public static readonly DONATION_CAMP_ID = 'campId';
  public static readonly DONATION_DONATOR_ID = 'donatorId';
  public static readonly DONATION_DONATOR_NAME = 'donatorName';
  public static readonly DONATION_DONATOR_MOBILE_NUMBER = 'donatorMobileNumber';
  public static readonly DONATION_RATION_ITEMS = 'rationItems';
  public static readonly DONATION_DONATOR_MARKED_SCHEDULED = 'donatorMarkedScheduled';
  public static readonly DONATION_DONATOR_MARKED_COMPLETED = 'donatorMarkedCompleted';
  public static readonly DONATION_OWNER_MARKED_COMPLETED = 'ownerMarkedCompleted';
  public static readonly DONATION_CREATED_AT = 'createdAt';
  public static readonly DONATION_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: DonationModel.DONATION_ID,
  })
  id!: number;

  @ForeignKey(() => HelpRequestModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: DonationModel.DONATION_HELP_REQUEST_ID,
  })
  helpRequestId?: number;

  @BelongsTo(() => HelpRequestModel)
  helpRequest?: HelpRequestModel;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: DonationModel.DONATION_CAMP_ID,
  })
  campId?: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: DonationModel.DONATION_DONATOR_ID,
  })
  donatorId!: number;

  @BelongsTo(() => UserModel)
  donator?: UserModel;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: DonationModel.DONATION_DONATOR_NAME,
  })
  donatorName!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: DonationModel.DONATION_DONATOR_MOBILE_NUMBER,
  })
  donatorMobileNumber!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    field: DonationModel.DONATION_RATION_ITEMS,
  })
  rationItems!: Record<string, number>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: DonationModel.DONATION_DONATOR_MARKED_SCHEDULED,
  })
  donatorMarkedScheduled!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: DonationModel.DONATION_DONATOR_MARKED_COMPLETED,
  })
  donatorMarkedCompleted!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: DonationModel.DONATION_OWNER_MARKED_COMPLETED,
  })
  ownerMarkedCompleted!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: DonationModel.DONATION_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: DonationModel.DONATION_UPDATED_AT,
  })
  updatedAt!: Date;
}


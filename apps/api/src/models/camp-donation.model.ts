import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import CampModel from './camp.model';
import DonationModel from './donation.model';

/**
 * Junction table for Camp-Donation relationship
 * Connects camps with donations (people who are helping)
 */
@Table({
  tableName: CampDonationModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: [CampDonationModel.CAMP_ID, CampDonationModel.DONATION_ID],
      name: 'unique_camp_donation',
    },
  ],
})
export default class CampDonationModel extends Model {
  public static readonly TABLE_NAME = 'camp_donations';
  public static readonly ID = 'id';
  public static readonly CAMP_ID = 'campId';
  public static readonly DONATION_ID = 'donationId';
  public static readonly CREATED_AT = 'createdAt';
  public static readonly UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampDonationModel.ID,
  })
  id!: number;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampDonationModel.CAMP_ID,
  })
  campId!: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @ForeignKey(() => DonationModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampDonationModel.DONATION_ID,
  })
  donationId!: number;

  @BelongsTo(() => DonationModel)
  donation?: DonationModel;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampDonationModel.CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampDonationModel.UPDATED_AT,
  })
  updatedAt!: Date;
}


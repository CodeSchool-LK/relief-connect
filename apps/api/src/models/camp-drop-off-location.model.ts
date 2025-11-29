import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ICampDropOffLocation } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampDropOffLocation';
import CampModel from './camp.model';

@Table({
  tableName: CampDropOffLocationModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class CampDropOffLocationModel extends Model<ICampDropOffLocation> implements ICampDropOffLocation {
  public static readonly TABLE_NAME = 'camp_drop_off_locations';
  public static readonly LOCATION_ID = 'id';
  public static readonly LOCATION_CAMP_ID = 'campId';
  public static readonly LOCATION_NAME = 'name';
  public static readonly LOCATION_ADDRESS = 'address';
  public static readonly LOCATION_LAT = 'lat';
  public static readonly LOCATION_LNG = 'lng';
  public static readonly LOCATION_CONTACT_NUMBER = 'contactNumber';
  public static readonly LOCATION_NOTES = 'notes';
  public static readonly LOCATION_CREATED_AT = 'createdAt';
  public static readonly LOCATION_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampDropOffLocationModel.LOCATION_ID,
  })
  id!: number;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampDropOffLocationModel.LOCATION_CAMP_ID,
  })
  campId!: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    field: CampDropOffLocationModel.LOCATION_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: CampDropOffLocationModel.LOCATION_ADDRESS,
  })
  address?: string;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: true,
    field: CampDropOffLocationModel.LOCATION_LAT,
  })
  lat?: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
    field: CampDropOffLocationModel.LOCATION_LNG,
  })
  lng?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: CampDropOffLocationModel.LOCATION_CONTACT_NUMBER,
  })
  contactNumber?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: CampDropOffLocationModel.LOCATION_NOTES,
  })
  notes?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampDropOffLocationModel.LOCATION_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampDropOffLocationModel.LOCATION_UPDATED_AT,
  })
  updatedAt!: Date;
}


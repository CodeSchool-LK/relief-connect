import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { ICamp } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICamp';
import { CampType, PeopleRange, CampNeed, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums';

@Table({
  tableName: CampModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class CampModel extends Model<ICamp> implements ICamp {
  public static readonly TABLE_NAME = 'camps';
  public static readonly CAMP_ID = 'id';
  public static readonly CAMP_LAT = 'lat';
  public static readonly CAMP_LNG = 'lng';
  public static readonly CAMP_TYPE = 'campType';
  public static readonly CAMP_NAME = 'name';
  public static readonly CAMP_PEOPLE_RANGE = 'peopleRange';
  public static readonly CAMP_NEEDS = 'needs';
  public static readonly CAMP_SHORT_NOTE = 'shortNote';
  public static readonly CAMP_CONTACT_TYPE = 'contactType';
  public static readonly CAMP_CONTACT = 'contact';
  public static readonly CAMP_CREATED_AT = 'createdAt';
  public static readonly CAMP_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampModel.CAMP_ID,
  })
  id!: number;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
    field: CampModel.CAMP_LAT,
  })
  lat!: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: false,
    field: CampModel.CAMP_LNG,
  })
  lng!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: CampModel.CAMP_TYPE,
  })
  campType!: CampType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    field: CampModel.CAMP_NAME,
  })
  name!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: CampModel.CAMP_PEOPLE_RANGE,
  })
  peopleRange!: PeopleRange;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    field: CampModel.CAMP_NEEDS,
  })
  needs!: CampNeed[];

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    field: CampModel.CAMP_SHORT_NOTE,
  })
  shortNote!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: CampModel.CAMP_CONTACT_TYPE,
  })
  contactType!: ContactType;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: CampModel.CAMP_CONTACT,
  })
  contact?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampModel.CAMP_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampModel.CAMP_UPDATED_AT,
  })
  updatedAt!: Date;
}


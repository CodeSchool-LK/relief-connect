import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { IHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/IHelpRequest';
import { HelpRequestStatus, HelpRequestCategory, Urgency, ContactType } from '@nx-mono-repo-deployment-test/shared/src/enums';
import UserModel from './user.model';

@Table({
  tableName: HelpRequestModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class HelpRequestModel extends Model<IHelpRequest> implements IHelpRequest {
  public static readonly TABLE_NAME = 'help_requests';
  public static readonly HELP_REQUEST_ID = 'id';
  public static readonly HELP_REQUEST_USER_ID = 'userId';
  public static readonly HELP_REQUEST_LAT = 'lat';
  public static readonly HELP_REQUEST_LNG = 'lng';
  public static readonly HELP_REQUEST_CATEGORY = 'category';
  public static readonly HELP_REQUEST_URGENCY = 'urgency';
  public static readonly HELP_REQUEST_SHORT_NOTE = 'shortNote';
  public static readonly HELP_REQUEST_APPROX_AREA = 'approxArea';
  public static readonly HELP_REQUEST_CONTACT_TYPE = 'contactType';
  public static readonly HELP_REQUEST_CONTACT = 'contact';
  public static readonly HELP_REQUEST_NAME = 'name';
  public static readonly HELP_REQUEST_TOTAL_PEOPLE = 'totalPeople';
  public static readonly HELP_REQUEST_ELDERS = 'elders';
  public static readonly HELP_REQUEST_CHILDREN = 'children';
  public static readonly HELP_REQUEST_PETS = 'pets';
  public static readonly HELP_REQUEST_RATION_ITEMS = 'rationItems';
  public static readonly HELP_REQUEST_STATUS = 'status';
  public static readonly HELP_REQUEST_CREATED_AT = 'createdAt';
  public static readonly HELP_REQUEST_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: HelpRequestModel.HELP_REQUEST_ID,
  })
  id!: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_USER_ID,
  })
  userId?: number;

  @BelongsTo(() => UserModel)
  user?: UserModel;

  @Column({
    type: DataType.DECIMAL(10, 8),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_LAT,
  })
  lat!: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_LNG,
  })
  lng!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_CATEGORY,
  })
  category!: HelpRequestCategory;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_URGENCY,
  })
  urgency!: Urgency;

  @Column({
    type: DataType.STRING(160),
    allowNull: false,
    validate: {
      len: [1, 160],
    },
    field: HelpRequestModel.HELP_REQUEST_SHORT_NOTE,
  })
  shortNote!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_APPROX_AREA,
  })
  approxArea!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    field: HelpRequestModel.HELP_REQUEST_CONTACT_TYPE,
  })
  contactType!: ContactType;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_CONTACT,
  })
  contact?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_NAME,
  })
  name?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_TOTAL_PEOPLE,
  })
  totalPeople?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_ELDERS,
  })
  elders?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_CHILDREN,
  })
  children?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_PETS,
  })
  pets?: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    field: HelpRequestModel.HELP_REQUEST_RATION_ITEMS,
  })
  rationItems?: string[];

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: HelpRequestStatus.OPEN,
    field: HelpRequestModel.HELP_REQUEST_STATUS,
  })
  status!: HelpRequestStatus;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: HelpRequestModel.HELP_REQUEST_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: HelpRequestModel.HELP_REQUEST_UPDATED_AT,
  })
  updatedAt!: Date;
}


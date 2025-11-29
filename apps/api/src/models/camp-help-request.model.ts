import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, Unique } from 'sequelize-typescript';
import CampModel from './camp.model';
import HelpRequestModel from './help-request.model';

/**
 * Junction table for Camp-HelpRequest relationship
 * Connects camps with help requests (people who need help)
 */
@Table({
  tableName: CampHelpRequestModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
  indexes: [
    {
      unique: true,
      fields: [CampHelpRequestModel.CAMP_ID, CampHelpRequestModel.HELP_REQUEST_ID],
      name: 'unique_camp_help_request',
    },
  ],
})
export default class CampHelpRequestModel extends Model {
  public static readonly TABLE_NAME = 'camp_help_requests';
  public static readonly ID = 'id';
  public static readonly CAMP_ID = 'campId';
  public static readonly HELP_REQUEST_ID = 'helpRequestId';
  public static readonly CREATED_AT = 'createdAt';
  public static readonly UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampHelpRequestModel.ID,
  })
  id!: number;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampHelpRequestModel.CAMP_ID,
  })
  campId!: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @ForeignKey(() => HelpRequestModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampHelpRequestModel.HELP_REQUEST_ID,
  })
  helpRequestId!: number;

  @BelongsTo(() => HelpRequestModel)
  helpRequest?: HelpRequestModel;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampHelpRequestModel.CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampHelpRequestModel.UPDATED_AT,
  })
  updatedAt!: Date;
}


import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ICampItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampItem';
import { RationItemType } from '@nx-mono-repo-deployment-test/shared/src/enums';
import CampModel from './camp.model';

@Table({
  tableName: CampItemModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class CampItemModel extends Model<ICampItem> implements ICampItem {
  public static readonly TABLE_NAME = 'camp_items';
  public static readonly ITEM_ID = 'id';
  public static readonly ITEM_CAMP_ID = 'campId';
  public static readonly ITEM_ITEM_TYPE = 'itemType';
  public static readonly ITEM_QUANTITY = 'quantity';
  public static readonly ITEM_NOTES = 'notes';
  public static readonly ITEM_CREATED_AT = 'createdAt';
  public static readonly ITEM_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampItemModel.ITEM_ID,
  })
  id!: number;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampItemModel.ITEM_CAMP_ID,
  })
  campId!: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: CampItemModel.ITEM_ITEM_TYPE,
  })
  itemType!: RationItemType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
    field: CampItemModel.ITEM_QUANTITY,
  })
  quantity!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: CampItemModel.ITEM_NOTES,
  })
  notes?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampItemModel.ITEM_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampItemModel.ITEM_UPDATED_AT,
  })
  updatedAt!: Date;
}


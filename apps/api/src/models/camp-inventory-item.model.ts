import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';
import CampModel from './camp.model';

@Table({
  tableName: CampInventoryItemModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class CampInventoryItemModel extends Model<ICampInventoryItem> implements ICampInventoryItem {
  public static readonly TABLE_NAME = 'camp_inventory_items';
  public static readonly INVENTORY_ITEM_ID = 'id';
  public static readonly INVENTORY_ITEM_CAMP_ID = 'campId';
  public static readonly INVENTORY_ITEM_NAME = 'itemName';
  public static readonly INVENTORY_ITEM_QUANTITY_NEEDED = 'quantityNeeded';
  public static readonly INVENTORY_ITEM_QUANTITY_DONATED = 'quantityDonated';
  public static readonly INVENTORY_ITEM_QUANTITY_PENDING = 'quantityPending';
  public static readonly INVENTORY_ITEM_CREATED_AT = 'createdAt';
  public static readonly INVENTORY_ITEM_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: CampInventoryItemModel.INVENTORY_ITEM_ID,
  })
  id!: number;

  @ForeignKey(() => CampModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID,
  })
  campId!: number;

  @BelongsTo(() => CampModel)
  camp?: CampModel;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: CampInventoryItemModel.INVENTORY_ITEM_NAME,
  })
  itemName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED,
  })
  quantityNeeded!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED,
  })
  quantityDonated!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING,
  })
  quantityPending!: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: CampInventoryItemModel.INVENTORY_ITEM_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: CampInventoryItemModel.INVENTORY_ITEM_UPDATED_AT,
  })
  updatedAt!: Date;
}


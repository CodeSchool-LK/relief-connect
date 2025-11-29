import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { IHelpRequestInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/inventory/IHelpRequestInventoryItem';
import HelpRequestModel from './help-request.model';

@Table({
  tableName: HelpRequestInventoryItemModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class HelpRequestInventoryItemModel extends Model<IHelpRequestInventoryItem> implements IHelpRequestInventoryItem {
  public static readonly TABLE_NAME = 'help_request_inventory_items';
  public static readonly INVENTORY_ITEM_ID = 'id';
  public static readonly INVENTORY_ITEM_HELP_REQUEST_ID = 'helpRequestId';
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
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_ID,
  })
  id!: number;

  @ForeignKey(() => HelpRequestModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID,
  })
  helpRequestId!: number;

  @BelongsTo(() => HelpRequestModel)
  helpRequest?: HelpRequestModel;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME,
  })
  itemName!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED,
  })
  quantityNeeded!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED,
  })
  quantityDonated!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING,
  })
  quantityPending!: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: HelpRequestInventoryItemModel.INVENTORY_ITEM_UPDATED_AT,
  })
  updatedAt!: Date;
}


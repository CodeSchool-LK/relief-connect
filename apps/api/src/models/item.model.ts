import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, Unique } from 'sequelize-typescript';
import { IItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces';
import { RationItemType } from '@nx-mono-repo-deployment-test/shared/src/enums/ration-item.enum';


@Table({
  tableName: ItemModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class ItemModel extends Model<IItem> implements IItem {
  public static readonly TABLE_NAME = 'items';
  public static readonly ITEM_ID = 'id';
  public static readonly ITEM_CODE = 'code';
  public static readonly ITEM_NAME = 'name';
  public static readonly ITEM_DESCRIPTION = 'description';
  public static readonly ITEM_CREATED_AT = 'createdAt';
  public static readonly ITEM_UPDATED_AT = 'updatedAt';
  
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: ItemModel.ITEM_ID,
  })
  id!: number;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
    field: ItemModel.ITEM_CODE,
  })
  code!: RationItemType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    field: ItemModel.ITEM_NAME,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: ItemModel.ITEM_DESCRIPTION,
  })
  description?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: ItemModel.ITEM_CREATED_AT,
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: ItemModel.ITEM_UPDATED_AT,
  })
  updatedAt!: Date;
}

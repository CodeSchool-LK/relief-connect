import ItemModel from '../models/item.model';
import { 
  IItem, 
  CreateItemDto, 
  UpdateItemDto 
} from '@nx-mono-repo-deployment-test/shared';


class ItemDao {
  private static instance: ItemDao;

  private constructor() {}

  public static getInstance(): ItemDao {
    if (!ItemDao.instance) {
      ItemDao.instance = new ItemDao();
    }
    return ItemDao.instance;
  }

  public async findAll(): Promise<IItem[]> {
    try {
      const items = await ItemModel.findAll({
        order: [[ItemModel.ITEM_CREATED_AT, 'DESC']],
      });
      return items.map(item => item.toJSON() as IItem);
    } catch (error) {
      console.error('Error in ItemDao.findAll:', error);
      throw error;
    }
  }

  public async findById(id: number): Promise<IItem | null> {
    try {
      const item = await ItemModel.findByPk(id);
      return item ? (item.toJSON() as IItem) : null;
    } catch (error) {
      console.error(`Error in ItemDao.findById (${id}):`, error);
      throw error;
    }
  }

  public async create(createItemDto: CreateItemDto): Promise<IItem> {
    try {
      const item = await ItemModel.create({
        [ItemModel.ITEM_CODE]: createItemDto.code,
        [ItemModel.ITEM_NAME]: createItemDto.name,
        [ItemModel.ITEM_DESCRIPTION]: createItemDto.description,
      });
      return item.toJSON() as IItem;
    } catch (error) {
      console.error('Error in ItemDao.create:', error);
      throw error;
    }
  }

  /**
   * Find item by code
   */
  public async findByCode(code: string): Promise<IItem | null> {
    try {
      const item = await ItemModel.findOne({
        where: {
          [ItemModel.ITEM_CODE]: code,
        },
      });
      return item ? (item.toJSON() as IItem) : null;
    } catch (error) {
      console.error(`Error in ItemDao.findByCode (${code}):`, error);
      throw error;
    }
  }

  /**
   * Create or update item by code (upsert)
   */
  public async upsertByCode(code: string, name: string, description?: string): Promise<IItem> {
    try {
      const [item] = await ItemModel.upsert({
        [ItemModel.ITEM_CODE]: code,
        [ItemModel.ITEM_NAME]: name,
        [ItemModel.ITEM_DESCRIPTION]: description,
      }, {
        returning: true,
      });
      return item.toJSON() as IItem;
    } catch (error) {
      console.error(`Error in ItemDao.upsertByCode (${code}):`, error);
      throw error;
    }
  }

  public async update(id: number, updateItemDto: UpdateItemDto): Promise<IItem | null> {
    try {
      const item = await ItemModel.findByPk(id);
      if (!item) {
        return null;
      }

      if (updateItemDto.name !== undefined) {
        item[ItemModel.ITEM_NAME] = updateItemDto.name;
      }
      if (updateItemDto.description !== undefined) {
        item[ItemModel.ITEM_DESCRIPTION] = updateItemDto.description;
      }

      await item.save();
      return item.toJSON() as IItem;
    } catch (error) {
      console.error(`Error in ItemDao.update (${id}):`, error);
      throw error;
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      const item = await ItemModel.findByPk(id);
      if (!item) {
        return false;
      }

      await item.destroy();
      return true;
    } catch (error) {
      console.error(`Error in ItemDao.delete (${id}):`, error);
      throw error;
    }
  }

  public async count(): Promise<number> {
    try {
      return await ItemModel.count();
    } catch (error) {
      console.error('Error in ItemDao.count:', error);
      throw error;
    }
  }
}

export default ItemDao;


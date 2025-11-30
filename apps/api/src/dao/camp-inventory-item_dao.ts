import CampInventoryItemModel from '../models/camp-inventory-item.model';
import { ICampInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/camp/ICampInventoryItem';

class CampInventoryItemDao {
  private static instance: CampInventoryItemDao;

  private constructor() {}

  public static getInstance(): CampInventoryItemDao {
    if (!CampInventoryItemDao.instance) {
      CampInventoryItemDao.instance = new CampInventoryItemDao();
    }
    return CampInventoryItemDao.instance;
  }

  /**
   * Find all inventory items for a camp
   */
  public async findByCampId(campId: number): Promise<ICampInventoryItem[]> {
    try {
      const items = await CampInventoryItemModel.findAll({
        where: {
          [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
        },
        order: [[CampInventoryItemModel.INVENTORY_ITEM_NAME, 'ASC']],
      });
      return items.map(item => item.toJSON() as ICampInventoryItem);
    } catch (error) {
      console.error(`Error in CampInventoryItemDao.findByCampId (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Find inventory item by camp ID and item name
   */
  public async findByCampIdAndItemName(
    campId: number,
    itemName: string
  ): Promise<ICampInventoryItem | null> {
    try {
      const item = await CampInventoryItemModel.findOne({
        where: {
          [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
          [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
        },
      });
      return item ? (item.toJSON() as ICampInventoryItem) : null;
    } catch (error) {
      console.error(
        `Error in CampInventoryItemDao.findByCampIdAndItemName (${campId}, ${itemName}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Create inventory items for a camp
   * @param campId - The camp ID
   * @param items - Map of item names to quantities needed
   */
  public async createInventoryItems(
    campId: number,
    items: Record<string, number>
  ): Promise<ICampInventoryItem[]> {
    try {
      const inventoryItems = await Promise.all(
        Object.entries(items).map(([itemName, quantityNeeded]) =>
          CampInventoryItemModel.create({
            [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
            [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED]: quantityNeeded,
            [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED]: 0,
            [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]: 0,
          })
        )
      );
      return inventoryItems.map(item => item.toJSON() as ICampInventoryItem);
    } catch (error) {
      console.error(`Error in CampInventoryItemDao.createInventoryItems (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Add pending quantities to inventory items
   * Called when a donation is created
   */
  public async addPendingQuantities(
    campId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          let inventoryItem = await CampInventoryItemModel.findOne({
            where: {
              [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
              [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (!inventoryItem) {
            // Create inventory item if it doesn't exist
            inventoryItem = await CampInventoryItemModel.create({
              [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
              [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
              [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED]: 0,
              [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED]: 0,
              [CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]: quantity,
            });
          } else {
            inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] += quantity;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in CampInventoryItemDao.addPendingQuantities (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Move pending quantities to donated quantities
   * Called when club admin accepts the donation
   */
  public async confirmPendingQuantities(
    campId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          const inventoryItem = await CampInventoryItemModel.findOne({
            where: {
              [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
              [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (inventoryItem) {
            // Move from pending to donated
            const pendingAmount = Math.min(quantity, inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]);
            inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] -= pendingAmount;
            inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED] += pendingAmount;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in CampInventoryItemDao.confirmPendingQuantities (${campId}):`, error);
      throw error;
    }
  }

  /**
   * Remove pending quantities (if donation is cancelled)
   */
  public async removePendingQuantities(
    campId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          const inventoryItem = await CampInventoryItemModel.findOne({
            where: {
              [CampInventoryItemModel.INVENTORY_ITEM_CAMP_ID]: campId,
              [CampInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (inventoryItem) {
            const removeAmount = Math.min(quantity, inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]);
            inventoryItem[CampInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] -= removeAmount;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in CampInventoryItemDao.removePendingQuantities (${campId}):`, error);
      throw error;
    }
  }
}

export default CampInventoryItemDao;


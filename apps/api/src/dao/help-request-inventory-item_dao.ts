import HelpRequestInventoryItemModel from '../models/help-request-inventory-item.model';
import { IHelpRequestInventoryItem } from '@nx-mono-repo-deployment-test/shared/src/interfaces/inventory/IHelpRequestInventoryItem';

class HelpRequestInventoryItemDao {
  private static instance: HelpRequestInventoryItemDao;

  private constructor() {}

  public static getInstance(): HelpRequestInventoryItemDao {
    if (!HelpRequestInventoryItemDao.instance) {
      HelpRequestInventoryItemDao.instance = new HelpRequestInventoryItemDao();
    }
    return HelpRequestInventoryItemDao.instance;
  }

  /**
   * Find all inventory items for a help request
   */
  public async findByHelpRequestId(helpRequestId: number): Promise<IHelpRequestInventoryItem[]> {
    try {
      const items = await HelpRequestInventoryItemModel.findAll({
        where: {
          [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
        },
        order: [[HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME, 'ASC']],
      });
      return items.map(item => item.toJSON() as IHelpRequestInventoryItem);
    } catch (error) {
      console.error(`Error in HelpRequestInventoryItemDao.findByHelpRequestId (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Find inventory item by help request ID and item name
   */
  public async findByHelpRequestIdAndItemName(
    helpRequestId: number,
    itemName: string
  ): Promise<IHelpRequestInventoryItem | null> {
    try {
      const item = await HelpRequestInventoryItemModel.findOne({
        where: {
          [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
          [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
        },
      });
      return item ? (item.toJSON() as IHelpRequestInventoryItem) : null;
    } catch (error) {
      console.error(
        `Error in HelpRequestInventoryItemDao.findByHelpRequestIdAndItemName (${helpRequestId}, ${itemName}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Create inventory items for a help request
   * @param helpRequestId - The help request ID
   * @param items - Map of item names to quantities needed
   */
  public async createInventoryItems(
    helpRequestId: number,
    items: Record<string, number>
  ): Promise<IHelpRequestInventoryItem[]> {
    try {
      const inventoryItems = await Promise.all(
        Object.entries(items).map(([itemName, quantityNeeded]) =>
          HelpRequestInventoryItemModel.create({
            [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
            [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            [HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_NEEDED]: quantityNeeded,
            [HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED]: 0,
            [HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]: 0,
          })
        )
      );
      return inventoryItems.map(item => item.toJSON() as IHelpRequestInventoryItem);
    } catch (error) {
      console.error(`Error in HelpRequestInventoryItemDao.createInventoryItems (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Add pending quantities to inventory items
   * Called when a donation is created
   */
  public async addPendingQuantities(
    helpRequestId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          const inventoryItem = await HelpRequestInventoryItemModel.findOne({
            where: {
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (inventoryItem) {
            inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] += quantity;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in HelpRequestInventoryItemDao.addPendingQuantities (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Move pending quantities to donated quantities
   * Called when both donator and receiver confirm the donation
   */
  public async confirmPendingQuantities(
    helpRequestId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          const inventoryItem = await HelpRequestInventoryItemModel.findOne({
            where: {
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (inventoryItem) {
            // Move from pending to donated
            const pendingAmount = Math.min(quantity, inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]);
            inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] -= pendingAmount;
            inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_DONATED] += pendingAmount;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in HelpRequestInventoryItemDao.confirmPendingQuantities (${helpRequestId}):`, error);
      throw error;
    }
  }

  /**
   * Remove pending quantities (if donation is cancelled)
   */
  public async removePendingQuantities(
    helpRequestId: number,
    items: Record<string, number>
  ): Promise<void> {
    try {
      await Promise.all(
        Object.entries(items).map(async ([itemName, quantity]) => {
          const inventoryItem = await HelpRequestInventoryItemModel.findOne({
            where: {
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_HELP_REQUEST_ID]: helpRequestId,
              [HelpRequestInventoryItemModel.INVENTORY_ITEM_NAME]: itemName,
            },
          });

          if (inventoryItem) {
            const removeAmount = Math.min(quantity, inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING]);
            inventoryItem[HelpRequestInventoryItemModel.INVENTORY_ITEM_QUANTITY_PENDING] -= removeAmount;
            await inventoryItem.save();
          }
        })
      );
    } catch (error) {
      console.error(`Error in HelpRequestInventoryItemDao.removePendingQuantities (${helpRequestId}):`, error);
      throw error;
    }
  }
}

export default HelpRequestInventoryItemDao;


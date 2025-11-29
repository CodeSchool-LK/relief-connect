import { IHelpRequestInventoryItem } from '../../../interfaces/inventory/IHelpRequestInventoryItem';

/**
 * DTO for inventory item response
 * Includes calculated fields for remaining quantity needed
 */
export class InventoryItemResponseDto {
  id: number;
  helpRequestId: number;
  itemName: string;
  quantityNeeded: number;
  quantityDonated: number;
  quantityPending: number;
  quantityRemaining: number; // Calculated: quantityNeeded - quantityDonated
  createdAt?: Date;
  updatedAt?: Date;

  constructor(inventoryItem: IHelpRequestInventoryItem) {
    this.id = inventoryItem.id!;
    this.helpRequestId = inventoryItem.helpRequestId;
    this.itemName = inventoryItem.itemName;
    this.quantityNeeded = inventoryItem.quantityNeeded;
    this.quantityDonated = inventoryItem.quantityDonated;
    this.quantityPending = inventoryItem.quantityPending;
    this.quantityRemaining = Math.max(0, inventoryItem.quantityNeeded - inventoryItem.quantityDonated);
    this.createdAt = inventoryItem.createdAt;
    this.updatedAt = inventoryItem.updatedAt;
  }
}


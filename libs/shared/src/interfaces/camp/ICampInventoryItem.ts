/**
 * Camp Inventory Item interface
 * Tracks inventory items needed and donated for each camp
 */
export interface ICampInventoryItem {
  id?: number;
  campId: number; // The camp this inventory item belongs to
  itemName: string; // Name/ID of the ration item (e.g., 'dry_rations', 'bottled_water')
  quantityNeeded: number; // Total quantity needed for this item
  quantityDonated: number; // Confirmed donated quantity (when club admin accepts donation)
  quantityPending: number; // Pending donation quantity (donated but not yet accepted by club admin)
  createdAt?: Date;
  updatedAt?: Date;
}


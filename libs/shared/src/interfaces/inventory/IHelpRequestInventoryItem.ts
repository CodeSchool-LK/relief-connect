/**
 * Help Request Inventory Item interface
 * Tracks inventory items needed and donated for each help request
 */
export interface IHelpRequestInventoryItem {
  id?: number;
  helpRequestId: number; // The help request this inventory item belongs to
  itemName: string; // Name/ID of the ration item (e.g., 'dry_rations', 'bottled_water')
  quantityNeeded: number; // Total quantity needed for this item
  quantityDonated: number; // Confirmed donated quantity (when both donator and receiver confirm)
  quantityPending: number; // Pending donation quantity (donated but not yet confirmed by both parties)
  createdAt?: Date;
  updatedAt?: Date;
}


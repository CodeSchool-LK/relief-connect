import { RationItemType } from '../../enums';

/**
 * Camp Item interface
 * Represents items needed for a camp
 */
export interface ICampItem {
  id?: number;
  campId: number;
  itemType: RationItemType;
  quantity: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


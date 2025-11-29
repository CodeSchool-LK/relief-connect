import { RationItemType } from '../enums/ration-item.enum';

/**
 * Base Item interface
 */
export interface IItem {
  id?: number;
  code: RationItemType; // Unique code from RationItemType enum
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

